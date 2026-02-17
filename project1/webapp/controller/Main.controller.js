sap.ui.define([
  "project1/controller/BaseController",
  "sap/ui/model/json/JSONModel",
  "./parts/ODataV2ModelTab",
], (BaseController, JSONModel, ODataV2ModelTab) => {
  "use strict";

  return BaseController.extend("project1.controller.Main", Object.assign({}, ODataV2ModelTab, {
    onInit() {
      this.configModel = new JSONModel({
        productsSelectedItems: [],
        isNewProductValid: false,
        buttonSubmitText: '',
      });

      this.getView().setModel(this.configModel, "configModel");
      this.configModel = this.getConfigModel();
      this.oDataV2Model = this.getOwnerComponent().getModel("DataV2");
      this.oBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
    },

    onCreationDialogControlChange(oEvent) {
      const oControl = oEvent.getSource();

      this._validateControl(oControl);
    },

    _validateControl(oControl) {
      let isValid = false;

      if (oControl.isA("sap.m.Input")) {
        const inputValue = oControl.getValue();
        isValid = oControl.getType() === "Number" ? Number(inputValue) && inputValue > 0 : !!(`${inputValue}`.length);
      } else if (oControl.isA("sap.m.DatePicker")) {
        isValid = oControl.isValidValue() && !!oControl.getValue().length;
      }

      oControl.setValueState(isValid ? "None" : "Error");

      return isValid;
    },
  }))
});