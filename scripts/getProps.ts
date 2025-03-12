import * as cheerio from "npm:cheerio@^1.0.0";
import { ignore,logError } from "./basics.ts";


export const getProps = async ($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called and not relevent
	if (await ignore("props", sheet)) {
		return undefined;
	}

	try {
		const props = [];
		// Get Property index
		// e.g. https://www.w3.org/TR/css-break-3/#index-defined-here
		let propertyIndexList = $("#property-index")
			.next()
			.find('[data-link-type="property"]');

		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/TR/2013/WD-css3-cascade-20130103/
			propertyIndexList = $("#property-index").next().find(".property");
		}

		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/TR/2013/WD-css3-grid-layout-20130910/
			propertyIndexList = $("#property-index")
				.next()
				.find("tbody")
				.find("th a");
		}
		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/TR/2002/WD-css3-background-20020802/
			propertyIndexList = $("table.proptable")
				.find("tbody")
				.find(".property a");
		}

		if (propertyIndexList) {
			// Loops over all things in the indx and adds them to props array
			for (const row of propertyIndexList) {
				const prop = $(row).text().trim();
				props.push(prop);
			}
			if (props.length > 0) {
				return props;
			}
		}

		logError("Props", sheet);
		return undefined;
	} catch {
		logError("Props & ERROR", sheet);
		return undefined;
	}
};
