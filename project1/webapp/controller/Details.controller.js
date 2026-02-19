sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel"
], function (
  Controller,
  JSONModel
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
        isOrderCreation: false
      });

      this.getView().setModel(oDetailConfigModel, "oDetailConfigModel");

      this.oDataV2Model = this.getOwnerComponent().getModel("DataV2");
      this.oDetailConfigModel = this.getView().getModel("oDetailConfigModel");
    },

    _onObjectMatched: function (oEvent) {
      const oArguments = oEvent.getParameter("arguments");
      const sObjectId = oArguments.objectId;
      const oQuery = oArguments["?query"];

      if (sObjectId === "newOrder") {
        this.oDetailConfigModel.setProperty("/isOrderCreation", true);

        const oNewOrderContext = this.oDataV2Model.createEntry("/Orders");
        this.getView().bindElement({
          path: oNewOrderContext.getPath(),
          model: "DataV2",
        });
      } else {
        this.getView().bindElement({
        path: `/Orders(${sObjectId})`,
        parameters: { expand: "Customer,Items,Items/Product,Employee" },
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
    }
  });
});