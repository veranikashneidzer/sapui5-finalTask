sap.ui.define([
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator",
  "sap/m/MessageBox",
  "sap/m/MessageToast",
  "sap/base/Log"
], (Filter, FilterOperator, MessageBox, MessageToast, Log) => {
  "use strict";

  return ({
    onAddRecord({ name, author, genre, availableQuantity, releaseDate }) {
      const oList = this.byId("booksList");
      const oBinding = oList.getBinding("items");

      const aUpdatedBooksList = [...oBinding.getContexts().map(el => el.getObject()), {
        ID: `${Math.floor(Math.random() * 10000)}`,
        Name: name,
        Author: author,
        Genre: ({ key: oBinding.getContexts().length + 1, title: genre }),
        ReleaseDate: new Date(releaseDate),
        AvailableQuantity: availableQuantity,
        isEditable: false
      }
      ];

      this.oModel.setProperty("/currentBooks", aUpdatedBooksList);
      this.oModel.setProperty("/initialBooks", [...aUpdatedBooksList]);
      oList.removeSelections();
    },

    onDeleteRecord(oEvent) {
      const oList = this.byId("booksList");
      const oBinding = oList.getBinding("items");
      const selectedIDs = oList?.getSelectedContexts().map(record => record.getObject()?.["ID"]);

      const aUpdatedBooksList = [];

      oBinding.getContexts().forEach(element => {
        if (selectedIDs.every(id => id !== element.getObject()?.["ID"])) {
          aUpdatedBooksList.push(element.getObject());
        }
      });

      this.oModel.setProperty("/currentBooks", aUpdatedBooksList);
      this.oModel.setProperty("/initialBooks", [...aUpdatedBooksList]);
      oList.removeSelections();
    },

    onSetSearchedName(oEvent) {
      const sValue = oEvent.getSource().getValue();
      this.oModel.setProperty("/searchedName", sValue);
    },

    onSetSelectedGenre(oEvent) {
      const selectedKey = oEvent.getSource()?.getSelectedKey();
      this.oModel.setProperty("/selectedGenre", selectedKey);
    },

    onFilterTable() {
      const sSelectedGenre = this.oModel.getData().selectedGenre;
      const sSearchedName = this.oModel.getData().searchedName;

      const oList = this.byId("booksList");
      const oBinding = oList.getBinding("items");

      const aFilter = [];
      if (sSelectedGenre) {
        if (sSelectedGenre === '0') {
          aFilter = [];
        } else {
          aFilter.push(new Filter("Genre/key", FilterOperator.EQ, sSelectedGenre));
        }
      }

      if (sSearchedName) {
        aFilter.push(new Filter("Name", FilterOperator.Contains, sSearchedName));
      }
      oBinding.filter(aFilter);
    },

    onEditTitle(oEvent) {
      const sBookPath = oEvent.getSource().getBindingContext("booksModel").getPath();
      this.oModel.setProperty(`${sBookPath}/isEditable`, true);
    },

    onSaveTitle(oEvent) {
      const sBookPath = oEvent.getSource().getBindingContext("booksModel").getPath();
      this.oModel.setProperty(`${sBookPath}/isEditable`, false);

      const oBooksData = this.oModel.getProperty("/currentBooks");
      this.oModel.setProperty("/initialBooks", [...oBooksData].map(bookData => ({ ...bookData })));
    },

    onCancelUpdateTitle(oEvent) {
      const sBookPath = oEvent.getSource().getBindingContext("booksModel").getPath();
      this.oModel.setProperty(`${sBookPath}/isEditable`, false);

      const oBooksData = this.oModel.getProperty("/initialBooks");
      this.oModel.setProperty("/currentBooks", [...oBooksData].map(bookData => ({ ...bookData })));
    },

    onOpenDeletionRecordConfirmationDialog(oEvent) {
      const oBundle = this.getView().getModel("i18n").getResourceBundle();

      MessageBox.confirm(oBundle.getText("confirmationDialogText"), {
        actions: [MessageBox.Action.YES, MessageBox.Action.CLOSE],
        onClose: (sAction) => {
          if (sAction === MessageBox.Action.YES) {
            this.onDeleteRecord(oEvent);
          }
        },
      });
    },

    onBooksTableSelectedItemsChanged(oEvent) {
      this.oModel.setProperty("/booksSelectedItems", oEvent.getSource().getSelectedItems());
    },

    async onOpenBookCreationDialog() {
      this.oModel.setProperty("/newBookData", {});

      try {
        if (!this.oBookCreationDialog) {
          this.oBookCreationDialog ??= await this.loadFragment({
            name: "project1.view.fragments.BookCreationDialog"
          });

          this.oBookCreationDialog.bindElement({
            path: "/newBookData",
            model: "booksModel"
          });
        }

        this.oBookCreationDialog.open();
      } catch {
        Log.error("Cannot load book creation dialog");
      }
    },

    onSubmitBookCreation() {
      const { name, author, genre, releaseDate, availableQuantity } = this.oModel.getProperty("/newBookData");

      if (!name || !author || !genre || !releaseDate || !availableQuantity) {
        const oBundle = this.getView().getModel("i18n").getResourceBundle();
        let sMsg = oBundle.getText("bookCreationDialogAddItemError");

        if (!releaseDate) {
          sMsg = oBundle.getText("bookCreationDialogReleaseDateError");
        }

        MessageToast.show(sMsg);
      } else {
        this.onAddRecord({ name, author, genre, availableQuantity, releaseDate });
        this.oBookCreationDialog.close();
      }
    },

    onCancelBookCreation() {
      this.oBookCreationDialog.close();
    },
  });
});