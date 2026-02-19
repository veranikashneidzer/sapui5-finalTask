sap.ui.define([
	"sap/ui/model/type/Currency"
], (Currency) => {
	"use strict";

	const _getDeliveryStatus = (dRequiredDate, dShippedDate) => {
		let sDeliveryText = "inTime";

		if (!dShippedDate) {
			return "";
		}

		if (dRequiredDate - dShippedDate > 0 && dRequiredDate - dShippedDate <= 7 * 24 * 60 * 60 * 1000) {
			sDeliveryText = "urgent";
		} else if (dRequiredDate < dShippedDate) {
			sDeliveryText = "tooLate";
		}

		return sDeliveryText;
	};

	return {
		getDeliveryText(dRequiredDate, dShippedDate) {
			const oResourceBundle = this.getOwnerComponent().getModel("i18n").getResourceBundle();
			const sDeliveryStatus = _getDeliveryStatus(dRequiredDate, dShippedDate);
			return oResourceBundle.getText(sDeliveryStatus);
		},

		getDeliveryState(dRequiredDate, dShippedDate) {
			const sDeliveryText = _getDeliveryStatus(dRequiredDate, dShippedDate);

			switch (sDeliveryText) {
				case "urgent":
					return "Warning";
				case "tooLate":
					return "Error";
				default:
					return "Success";
			}
		},

		getUnitPrice(sValue) {
			if (!sValue) {
				return "";
			}
			return parseFloat(sValue).toFixed(2);
		},

		getItemTotal: function (iQuantity, nPrice, sCurrency) {
			var oCurrency = new Currency({showMeasure: false});
			var fTotal = iQuantity * nPrice || 0;
			return oCurrency.formatValue([fTotal.toFixed(2), sCurrency], "string");
		},

		formatEmployeeImage(vData) {
			return vData ? 'data:image/jpeg;base64,' + vData.substr(104) : "../images/Employee.png";
		}
	};
});