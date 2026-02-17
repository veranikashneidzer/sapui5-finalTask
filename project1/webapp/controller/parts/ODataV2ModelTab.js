sap.ui.define([
  "sap/m/MessageToast",
  "sap/m/MessageBox",
  "sap/base/Log"
], (MessageToast, MessageBox, Log) => {
  "use strict";

  return ({
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
    
    onProductsTableV2SelectedItemsChanged(oEvent) {
      this.configModel.setProperty("/productsSelectedItems", oEvent.getSource().getSelectedItems());
    },

    onOpenProductsDeleteConfirmationDialog(oEvent) {
      const oBundle = this.getView().getModel("i18n").getResourceBundle();

      MessageBox.confirm(oBundle.getText("productsDeleteConfirmationDialogText"), {
        actions: [MessageBox.Action.YES, MessageBox.Action.CLOSE],
        onClose: (sAction) => {
          if (sAction === MessageBox.Action.YES) {
            this.onDeleteV2Products();
          }
        },
      });
    },

    onDeleteV2Products() {
      const oList = this.byId("productsListV2");
      const selectedIDs = oList?.getSelectedContexts().map(record => record.getObject()?.["ID"]);
      this.oDataV2Model.setDeferredGroups(["deleteGroup"]);

      oList?.getSelectedContexts()?.forEach((oContext, index) => {
        this.oDataV2Model.remove(oContext.getPath(), {
          groupId: "deleteGroup"
        });
      });

      const sSuccessMsg = this.oBundle.getText(selectedIDs.length > 1 ? "deletionSuccessMessagePlural" : "deletionSuccessMessage");
      const sErrorMsg = this.oBundle.getText("deletionErrorMessage");

      this.oDataV2Model.submitChanges({
        groupId: "deleteGroup",
        success: () => MessageToast.show(sSuccessMsg),
        error: () => MessageBox.error(sErrorMsg),
      });

      oList.removeSelections();
    },

    setCreationDialogInitialControlsValueState() {
      const aControls = this.oProductV2DataCreateEditDialog.getContent()[0].getItems();

      aControls.forEach((oControl) => {
        oControl.setValueState("None");
      });
    },

    async _onOpenProductV2DataCreateEditDialog(oSource = {}, bIsCreate = true) {
      let oContext = {};

      try {
        if (!this.oProductCreationDialog) {
          this.oProductV2DataCreateEditDialog ??= await this.loadFragment({
            name: "project1.view.fragments.ProductV2DataCreateEditDialog",
            id: 'productCreationV2Dialog',
          });
        }

        if (bIsCreate) {
          const oList = this.byId("productsListV2");
          oList.removeSelections();

          oContext = this.oDataV2Model.createEntry("/Products");
        } else {
          oContext = oSource.getParent().getBindingContext("DataV2");
        }

        this.oProductV2DataCreateEditDialog.setBindingContext(oContext, "DataV2");

        this.configModel.setProperty('/buttonSubmitText', this.oBundle.getText(bIsCreate ? "dialogAddButtonText" : "dialogSaveButtonText"));
        this.configModel.setProperty('/headerText', this.oBundle.getText(bIsCreate ? "productCreationDialogHeaderText" : "productEditDialogHeaderText"));
        
        this.setCreationDialogInitialControlsValueState();
        this.oProductV2DataCreateEditDialog.open();
      } catch {
        Log.error("Cannot load product create dialog");
      }
    },

    onOpenProductV2DataCreateDialog() {
      this._onOpenProductV2DataCreateEditDialog();
    },

    onSubmitV2Product(oEvent) {
      const sText = oEvent.getSource().getText();
      const bIsCreate = sText === this.oBundle.getText("dialogAddButtonText");

      if (!this.validateForm()) {
        return;
      }

      const sSuccessMsg = this.oBundle.getText(bIsCreate ? "createSuccessMessage" : "editSuccessMessage");
      const sErrorMsg = this.oBundle.getText(bIsCreate ? "createErrorMessage" : "editErrorMessage");

      if (this.oDataV2Model.hasPendingChanges()) {
        this.oDataV2Model.submitChanges({
          success: () => {
            MessageToast.show(sSuccessMsg),
            this.oProductV2DataCreateEditDialog.close();
          },
          error: () => MessageBox.error(sErrorMsg),
        });
      }
    },

    async onOpenProductV2DataEditDialog(oEvent) {
      this._onOpenProductV2DataCreateEditDialog(oEvent.getSource(), false);
    },

    onCancelProductV2DataChanging() {
      this.oDataV2Model.resetChanges();
      this.oProductV2DataCreateEditDialog.close();
    },

    validateForm() {
      const aControls = this.oProductV2DataCreateEditDialog.getContent()[0].getItems();
      let isAllControlsValid = true;

      aControls.forEach((oControl) => {
        const isValid = this._validateControl(oControl);

        if (!isValid) {
          isAllControlsValid = false;
        }
      });

      return isAllControlsValid;
    },
  });
});