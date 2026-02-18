sap.ui.define([
  "project1/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "./parts/ODataV2ModelTab",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/ui/model/Sorter",
  "sap/ui/core/format/DateFormat"
], (BaseController,
  JSONModel,
  ODataV2ModelTab,
  Filter,
  FilterOperator,
  Sorter,
  DateFormat) => {
  "use strict";

  return BaseController.extend("project1.controller.Main", Object.assign({}, ODataV2ModelTab, {
    onInit() {
      this.configModel = this.getConfigModel();
      this.oDataV2Model = this.getOwnerComponent().getModel("DataV2");
      this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();

      this.configModel = new JSONModel({
        ordersCounter: this.oDataV2Model.getProperty("/Orders")?.length || 0,
      });

      this.getView().setModel(this.configModel, "configModel");

      this.mGroupFunctions = {
        CustomerName: function (oContext) {
          const sCustomerName = oContext.getProperty("CustomerName");
          return {
            key: sCustomerName,
            text: sCustomerName
          };
        },
        OrderDate: function (oContext) {
          const oDate = oContext.getProperty("OrderDate");
          const iYear = oDate.getFullYear();
          const iMonth = oDate.getMonth() + 1;
          const sMonthName = DateFormat.getInstance({ pattern: "MMMM" }).format(oDate);
          return {
            key: iYear + "-" + iMonth,
            text: `Ordered in ${sMonthName} ${iYear}`
          };
        },
        ShippedDate: function (oContext) {
          const oDate = oContext.getProperty("ShippedDate");
          if (oDate != null) {
            const iYear = oDate.getFullYear();
            const iMonth = oDate.getMonth() + 1;
            const sMonthName = DateFormat.getInstance({ pattern: "MMMM" }).format(oDate);
            return {
              key: iYear + "-" + iMonth,
              text: `Shipped in ${sMonthName} ${iYear}`
            };
          } else {
            return {
              key: 0,
              text: "Not Shipped Yet"
            };
          }
        }
      };
    },

    onOrdersListUpdateFinished() {
      const ordersCount = this.byId("listOfOrders").getItems().length;
      this.configModel.setProperty("/ordersCounter", ordersCount);
    },

    onSearchOrders(oEvent) {
      const sQuery = oEvent.getSource().getValue();
      const oBinding = this.byId("listOfOrders").getBinding("items");
      const aFilters = sQuery ? [
        new Filter("OrderID", FilterOperator.Contains, sQuery)
      ] : [];

      oBinding.filter(aFilters);
    },

    async onOpenViewSettings(oEvent) {
      const sTabId = oEvent.getSource().getId().split("--").pop();
      try {
        if (!this.oViewSettingsDialog) {
          this.oViewSettingsDialog ??= await this.loadFragment({
            name: "project1.view.fragments.ViewSettingsDialog",
            id: 'viewSettingsDialog',
          });
        }

        this.oViewSettingsDialog.open(sTabId === "groupButton" ? "group" : "filter");
      } catch (error) {
        Log.error("Cannot load view settings dialog", error);
      }
    },

    onConfirmViewSettingsDialog(oEvent) {
      const oViewSettingsDialog = this.oViewSettingsDialog;
      const oList = this.byId("listOfOrders");
      const oBinding = oList.getBinding("items");

      const sSortPath = oViewSettingsDialog.getSelectedFilterItems()[0]?.getKey() || "";
      if (sSortPath === "notShippedFilter") {
        oBinding.filter([new Filter("ShippedDate", FilterOperator.EQ, null)]);
      } else if (sSortPath === "shippedFilter") {
        oBinding.filter([new Filter("ShippedDate", FilterOperator.NE, null)]);
      } else {
        oBinding.filter([]);
      }

      const mParams = oEvent.getParameters();

      if (mParams.groupItem) {
        const aGroups = [];
        const sPath = mParams.groupItem.getKey();
        const bDescending = mParams.groupDescending;
        const vGroup = this.mGroupFunctions[sPath];
        aGroups.push(new Sorter(sPath, bDescending, vGroup));

        oBinding.sort(aGroups);
      } else {
        oBinding.sort([]);
      }
    }
  },

  ))
});;