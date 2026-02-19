sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "project1/model/formatter",
  "sap/m/library"
], function (
  Controller,
  JSONModel,
  MessageToast,
  MessageBox,
  formatter,
  mobileLibrary
) {
  "use strict";

  return Controller.extend("project1.controller.Details", {
    onInit: function () {
      this.getOwnerComponent().getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

      const oDetailConfigModel = new JSONModel({
        selectedTab: "",
        totalAmount: 0,
        listItemsCount: 0,
        currency: "EUR",
        isOrderCreation: false,
        isEditMode: false
      });

      this.getView().setModel(oDetailConfigModel, "oDetailConfigModel");

      this.oDataV2Model = this.getOwnerComponent().getModel("DataV2");
      this.oDetailConfigModel = this.getView().getModel("oDetailConfigModel");
      this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
    },

    _onObjectMatched: function (oEvent) {
      const oArguments = oEvent.getParameter("arguments");
      const sObjectId = oArguments.objectId;
      this.getView().unbindElement("DataV2");

      if (sObjectId === "newOrder") {
        this.oDetailConfigModel.setProperty("/isOrderCreation", true);
        this.oDetailConfigModel.setProperty("/isEditMode", true);

        this.oDataV2Model.read("/Orders", {
          success: function (oDataV2) {
            const sortedOrders = oDataV2.results.sort((a, b) => b.OrderID - a.OrderID);
            const iMaxOrderId = sortedOrders[0].OrderID;

            const oContext = this.oDataV2Model.createEntry("/Orders", {
              properties: {
                OrderID: iMaxOrderId + 1,
              }
            });
            this.getView().setBindingContext(oContext, "DataV2");
          }.bind(this),
          error: function () {
            Log.error("Failed to read Orders for generating new OrderID");
          }.bind(this)
        });
      } else {
        this.oDetailConfigModel.setProperty("/isOrderCreation", false);
        this.oDetailConfigModel.setProperty("/isEditMode", false);
        this.getView().bindElement({
          path: `/Orders(${sObjectId})`,
          parameters: { expand: "Employee,Order_Details,Order_Details/Product" },
          model: "DataV2"
        });
      }
    },

    onListUpdateFinished(oEvent) {
      const aItemsContext = oEvent.getSource().getBinding("items").getContexts();
      const nOrderTotal = aItemsContext.reduce((fPreviousTotal, oCurrentContext) => {
        const fItemTotal = oCurrentContext.getObject().Quantity * oCurrentContext.getObject().UnitPrice;
        return fPreviousTotal + fItemTotal;
      }, 0);
      this.oDetailConfigModel.setProperty("/totalAmount", nOrderTotal);
      this.oDetailConfigModel.setProperty("/listItemsCount", aItemsContext.length);
    },

    onCancelEdit() {
      if (this.oDetailConfigModel.getProperty("/isOrderCreation")) {
        this.onCloseOrder();
      } else {
        this.oDataV2Model.resetChanges();
        this.oDetailConfigModel.setProperty("/isEditMode", false);
      }
    },

    onSaveButtonPress() {
      const bIsCreate = this.oDetailConfigModel.getProperty("/isOrderCreation");
      const sSuccessMsg = this.oBundle.getText(bIsCreate ? "createSuccessMessage" : "editSuccessMessage");
      const sErrorMsg = this.oBundle.getText(bIsCreate ? "createErrorMessage" : "editErrorMessage");

      try {
        this.oDataV2Model.submitChanges({
          success: function() {
            // this.getView().getModel("oAppModel").setProperty("/layout", "OneColumn");
            // this.getOwnerComponent().getRouter().navTo("RouteMain");

            this.oDetailConfigModel.setProperty("/isEditMode", false);
            this.oDetailConfigModel.setProperty("/isOrderCreation", false);

            this.oDataV2Model.refresh(true);
            const oContext = this.getView().getBindingContext("DataV2");
            this.getOwnerComponent().getRouter().navTo("object", { objectId: oContext.getObject().OrderID });
            MessageToast.show(sSuccessMsg);
          }.bind(this),
          error: function() {
            MessageBox.show(sErrorMsg);
          }.bind(this)
        });
      } catch {
        MessageBox.error(sErrorMsg);
      }
    },

    onAddLineItem() {
      const oList = this.byId("lineItemsList");
      const oContext = oList.getBinding("items").getContext();
      const oItem = new sap.m.ColumnListItem({
        cells: [
          new sap.m.Input({
            value: "{DataV2>Product/ProductName}",
            visible: "{oDetailConfigModel>/isEditMode}",
            required: true
          }),
          new sap.m.Input({
            type: "Number",
            value: "{DataV2>UnitPrice}",
            visible: "{oDetailConfigModel>/isEditMode}",
            required: true
          }),
          new sap.m.Input({
            value: "{DataV2>Quantity}",
            visible: "{oDetailConfigModel>/isEditMode}",
            required: true
          }),
          new sap.m.ObjectNumber({
            number: formatter.getItemTotal(
              oContext.getProperty("Quantity"),
              oContext.getProperty("UnitPrice"),
              this.oDetailConfigModel.getProperty("/currency")
            ),
            unit: "{oDetailConfigModel>/currency}"
          }),
        ]
      });
      oList.addItem(oItem);
    },

    onDeleteOrder() {
      const oBundle = this.getView().getModel("i18n").getResourceBundle();

      MessageBox.confirm(oBundle.getText("orderDeleteConfirmationDialogText"), {
        actions: [MessageBox.Action.YES, MessageBox.Action.CLOSE],
        onClose: (sAction) => {
          if (sAction === MessageBox.Action.YES) {
            this._onDeleteOrder();
            this.onCloseOrder()
          }
        },
      });
    },

    _onDeleteOrder() {
      const sObjectId = this.getView().getBindingContext("DataV2").getObject().OrderID;
      this.oDataV2Model.remove(`/Orders(${sObjectId})`);

      const sSuccessMsg = this.oBundle.getText("deletionSuccessMessage");
      const sErrorMsg = this.oBundle.getText("deletionErrorMessage");

      this.oDataV2Model.submitChanges({
        success: () => MessageToast.show(sSuccessMsg),
        error: () => MessageBox.error(sErrorMsg),
      });
    },

    onSendEmail(oEvent) {
      const oObject = oEvent.getSource().getBindingContext("DataV2").getObject();

      mobileLibrary.URLHelper.triggerEmail(
        null,
        this.oBundle.getText("shareSendEmailObjectSubject", [oObject.OrderID]),
        this.oBundle.getText("shareSendEmailObjectMessage", [oObject.OrderID, oObject.OrderID, location.href, oObject.ShipName, oObject.EmployeeID, oObject.CustomerID])
      );
    },

    onCloseOrder() {
      this.oDetailConfigModel.setProperty("/isEditMode", false);
      this.oDataV2Model.resetChanges();
      this.getView().getModel("oAppModel").setProperty("/layout", "OneColumn");
      this.getOwnerComponent().getRouter().navTo("RouteMain");
    },

    onPressPhone(oEvent) {
      mobileLibrary.URLHelper.triggerTel(oEvent.getSource().getText());
    },

    onEditOrder() {
      this.oDetailConfigModel.setProperty("/isEditMode", true);
    }
  });
});