sap.ui.define([
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
], (Controller, JSONModel) => {
  "use strict";

  return Controller.extend("project1.controller.App", {
      onInit() {
        const oAppModel = new JSONModel({
          layout : "OneColumn",
        });
        this.getView().setModel(oAppModel, "oAppModel");
      }
  });
});