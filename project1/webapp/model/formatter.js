sap.ui.define([
], () => {
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
		}
	};
});