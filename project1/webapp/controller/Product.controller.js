sap.ui.define([
  "project1/controller/BaseController"
], (BaseController,) => {
  "use strict";

  return BaseController.extend("project1.controller.Product", {
    onInit() {
      this.oRouter = this.getOwnerComponent().getRouter();
      this.oRouter.getRoute("ProductDetailPage").attachPatternMatched(this.onObjectMatched, this);
    },

    onObjectMatched(oEvent) {
      const sProductId = window.decodeURIComponent(oEvent.getParameter("arguments").ProductID);

      this.getView().bindElement({
        path: `/Products(${sProductId})`,
        model: "DataV2",
        parameters: {
          expand: "Supplier"
        }
      });
    },
  })
});