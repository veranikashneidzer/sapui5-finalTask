sap.ui.define([
  "project1/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "./parts/ODataV2ModelTab",
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
], (BaseController, JSONModel, ODataV2ModelTab, Filter, FilterOperator) => {
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
  }))
});