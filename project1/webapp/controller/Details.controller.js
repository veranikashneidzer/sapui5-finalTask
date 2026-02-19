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
      const oQuery = oArguments["?query"];

      if (sObjectId === "newOrder") {
        this.oDetailConfigModel.setProperty("/isOrderCreation", true);
        this.oDetailConfigModel.setProperty("/isEditMode", true);

        const oNewOrderContext = this.oDataV2Model.createEntry("/Orders", {});
        this.getView().bindElement({
          path: oNewOrderContext.getPath(),
          model: "DataV2",
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

    onSaveOrder() {
      if (this.oDetailConfigModel.getProperty("/isOrderCreation")) {
        this._submitNewProduct();
      }
    },

    _submitNewProduct() {
      const bIsCreate = this.oDetailConfigModel.getProperty("/isOrderCreation");
      const sSuccessMsg = this.oBundle.getText(bIsCreate ? "createSuccessMessage" : "editSuccessMessage");
      const sErrorMsg = this.oBundle.getText(bIsCreate ? "createErrorMessage" : "editErrorMessage");

      try {
        this.oDataV2Model.submitChanges();
        this.oDetailConfigModel.setProperty("/isEditMode", false);
        this.oDetailConfigModel.setProperty("/isOrderCreation", false);

        const oContext = this.getView().getBindingContext("DataV2");
        const sId = oContext.getPath().split("'")[1].split("'")[0];
        this.getOwnerComponent().getRouter().navTo("object", { objectId: sId });
        MessageToast.show(sSuccessMsg);
      } catch  {
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
            value: "{ODataV2>UnitPrice}",
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

    onDeleteOrder() {},

    onSendEmail(oEvent) {
      const oObject = oEvent.getSource().getBindingContext("DataV2").getObject();

      mobileLibrary.URLHelper.triggerEmail(
				null,
				this.oBundle.getText("shareSendEmailObjectSubject", [oObject.OrderID]),
				this.oBundle.getText("shareSendEmailObjectMessage", [oObject.OrderID, oObject.OrderID, location.href, oObject.ShipName, oObject.EmployeeID, oObject.CustomerID])
			);
    },
  });
});