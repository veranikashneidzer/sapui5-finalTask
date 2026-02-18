sap.ui.define([
    "sap/ui/core/mvc/Controller"
], (Controller) => {
    "use strict";

    return Controller.extend("project1.controller.BaseController", {
        getConfigModel() {
            return this.getView().getModel("configModel");
        },
    });
});