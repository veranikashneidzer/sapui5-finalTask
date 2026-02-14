sap.ui.define([
	"sap/ui/core/format/DateFormat",
	"sap/ui/core/date/UI5Date"
], (DateFormat, UI5Date) => {
	"use strict";

	return {
		formatDate(sDate) {
			const oDateFormat = DateFormat.getInstance({
				format: "yyyy"
			});
			const sFormattedDate = UI5Date.getInstance(sDate);
			return oDateFormat.format(sFormattedDate);
		}
	};
});