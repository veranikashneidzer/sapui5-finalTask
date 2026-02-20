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
      const sQuery = oArguments["?query"];
      this.getView().unbindElement("DataV2");

      if (sObjectId === "newOrder") {
        this.oDetailConfigModel.setProperty("/isOrderCreation", true);
        this.oDetailConfigModel.setProperty("/isEditMode", true);
        const oContext = this.oDataV2Model.createEntry("/Orders");
        this.getView().setBindingContext(oContext, "DataV2");
      } else {
        this.oDetailConfigModel.setProperty("/isOrderCreation", false);
        this.oDetailConfigModel.setProperty("/isEditMode", false);
        this.getView().bindElement({
          path: `/Orders(${sObjectId})`,
          model: "DataV2"
        });
      }

      this.getView().getModel("oAppModel").setProperty("/layout", "TwoColumnsMidExpanded");

      if (sQuery && sQuery.isEditMode) {
        this.oDetailConfigModel.setProperty("/isEditMode", true);
      }
    },

    onCancelEdit() {
      if (this.oDetailConfigModel.getProperty("/isOrderCreation")) {
        this.onCloseOrder();
      } else {
        this.oDataV2Model.resetChanges();
        this.oDetailConfigModel.setProperty("/isEditMode", false);
      }
      this.getOwnerComponent().getRouter().navTo("object", { objectId: this.getView().getBindingContext("DataV2").getObject().OrderID });
    },

    _validateControl(oControl) {
      let isValid = false;

      if (oControl.isA("sap.m.Input")) {
        const inputValue = oControl.getValue();
        isValid = oControl.getType() === "Number" ? Number(inputValue) && inputValue > 0 : !!(`${inputValue}`.length);
        oControl.setValueState(isValid ? "None" : "Error");
        return isValid;
      } else if (oControl.isA("sap.m.DatePicker")) {
        isValid = oControl.isValidValue() && !!oControl.getValue().length;
        oControl.setValueState(isValid ? "None" : "Error");
        return isValid;
      } else {
        return true;
      }
    },

    onControlChanged(oEvent) {
      const oControl = oEvent.getSource();
      this._validateControl(oControl);
    },

    validateForm() {
      const aControls = [...this.getView().byId("headerContent").getContent()[0].getContent(), ...this.getView().byId("shippingAddressForm").getContent()];
      let isAllControlsValid = true;

      aControls.forEach((oControl) => {
        const isValid = this._validateControl(oControl);

        if (!isValid) {
          isAllControlsValid = false;
        }
      });

      return isAllControlsValid;
    },

    onSaveButtonPress() {
      if (!this.validateForm()) {
        return;
      }

      const bIsCreate = this.oDetailConfigModel.getProperty("/isOrderCreation");
      const sSuccessMsg = this.oBundle.getText(bIsCreate ? "createSuccessMessage" : "editSuccessMessage");
      const sErrorMsg = this.oBundle.getText(bIsCreate ? "createErrorMessage" : "editErrorMessage");

      try {
        const oContext = this.getView().getBindingContext("DataV2");
        this.oDataV2Model.submitChanges({
          success: function () {
            this.oDetailConfigModel.setProperty("/isEditMode", false);
            this.oDetailConfigModel.setProperty("/isOrderCreation", false);

            this.oDataV2Model.refresh(true);
            const oContext = this.getView().getBindingContext("DataV2");
            this.getOwnerComponent().getRouter().navTo("object", { objectId: oContext.getObject().OrderID });
            MessageToast.show(sSuccessMsg);
          }.bind(this),
          error: function () {
            MessageBox.show(sErrorMsg);
          }.bind(this)
        });
      } catch (error) {
        MessageBox.error(sErrorMsg, error);
      }
    },

    onDeleteOrder() {
      const oBundle = this.getView().getModel("i18n").getResourceBundle();

      MessageBox.confirm(oBundle.getText("orderDeleteConfirmationDialogText"), {
        actions: [MessageBox.Action.YES, MessageBox.Action.CLOSE],
        onClose: (sAction) => {
          if (sAction === MessageBox.Action.YES) {
            this._onDeleteOrder();
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
        success: () => {
          MessageToast.show(sSuccessMsg);
          this.onCloseDetailsPage();
        },
        error: () => MessageBox.error(sErrorMsg),
      });
    },

    onCloseOrder() {
      this.onCloseDetailsPage();
      this.oDataV2Model.resetChanges();
    },

    onCloseDetailsPage() {
      this.oDetailConfigModel.setProperty("/isEditMode", false);
      this.getView().getModel("oAppModel").setProperty("/layout", "OneColumn");
      this.getOwnerComponent().getRouter().navTo("RouteMain");
    },

    onSendEmail(oEvent) {
      const oObject = oEvent.getSource().getBindingContext("DataV2").getObject();

      mobileLibrary.URLHelper.triggerEmail(
        null,
        this.oBundle.getText("shareSendEmailObjectSubject", [oObject.OrderID]),
        this.oBundle.getText("shareSendEmailObjectMessage", [oObject.OrderID, oObject.OrderID, location.href, oObject.ShipName, oObject.EmployeeID, oObject.CustomerID])
      );
    },

    onPressPhone(oEvent) {
      mobileLibrary.URLHelper.triggerTel(oEvent.getSource().getText());
    },

    onEditOrder(oEvent) {
      const oOrderID = oEvent.getSource().getBindingContext("DataV2").getObject().OrderID;
      this.getOwnerComponent().getRouter().navTo("object", {
        objectId: oOrderID,
        query: {
          isEditMode: true
        }
      });
    }
  });
});