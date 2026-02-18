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

            const oDetailModel = new JSONModel({
                selectedTab: ""
            });

            this.getView().setModel(oDetailModel, "oDetailConfigModel");
        },

        _onObjectMatched: function (oEvent) {
            const oArguments = oEvent.getParameter("arguments");
            const sObjectId = oArguments.objectId;
            const oQuery = oArguments["?query"];

            this.getView().bindElement({
                path: `/Orders(${sObjectId})`,
                parameters: { expand: "Customer,Items,Items/Product" },
                model: "DataV2"
            });
        }
    });
});