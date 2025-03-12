import * as cheerio from "npm:cheerio@^1.0.0";
import { ignore, logError } from "./basics.ts";

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
		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/TR/2011/WD-css3-flexbox-20110322
			propertyIndexList = $("table.proptable")
				.find("tbody")
				.find(".property");
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

		// more specail cases

		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://drafts.csswg.org/css-2023

			const allProps = [];
			propertyIndexList = $("#properties").next().find(".index > li");

			if (propertyIndexList && propertyIndexList.length > 0) {
				for (const li of propertyIndexList) {
					// check if it has a table inside e.g. align-self
					if ($(li).find("ul").length > 0) {
						let prop = $(li)
							.contents()
							.filter(function () {
								return this.type === "text";
							})
							.text()
							.trim();
						if (prop) {
							allProps.push(prop);
						}
					} else {
						let prop = $(li).text().trim();
						if (prop) {
							allProps.push(prop);
						}
					}
				}
			}
			if (allProps.length > 0) {
				return allProps;
			}
		}

		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/TR/1998/REC-CSS2-19980512/
			// deals with linked prop tables
			const allProps = [];
			const linkedTable = $(".navbar")
				.find('a:contains("properties")')
				.attr()?.href;

			if (linkedTable) {
				// Here we make another cheerio instance for the linked table
				const $ = await cheerio.fromURL(
					sheet +
						(sheet[sheet.length - 1] == `/` ? `` : `/`) +
						linkedTable,
				);
				const rows = $("tbody").find("tr");
				for (const row of rows) {
					// we use REGEX here to only get text in "'", which are the props
					const props = $(row)
						.find("td")
						.first()
						.text()
						.trim()
						.match(/\'(.*)\'/);
					if (props) {
						// here we just parse throguht them, by spliting on comas (if present) and then removing the "'"
						for (let prop of props[0].split(",")) {
							prop = prop.trim();
							prop = prop.slice(1, prop.length - 1);
							allProps.push(prop);
						}
					}
				}
				if (allProps.length > 0) {
					return allProps;
				}
			}
		}

		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/TR/1998/REC-CSS2-19980512/
			// deals with linked prop tables
			const allProps = [];
			const linkedTable = $(".toc")
				.find('a:contains("Property index")')
				.attr()?.href;

			if (linkedTable) {
				// Here we make another cheerio instance for the linked table
				const $ = await cheerio.fromURL(
					sheet +
						(sheet[sheet.length - 1] == `/` ? `` : `/`) +
						linkedTable,
				);
				const rows = $("tbody").find("tr");
				for (const row of rows) {
					// we use REGEX here to only get text in "'", which are the props
					const props = $(row)
						.find("td")
						.first()
						.text()
						.trim()
						.match(/\'(.*)\'/);
					if (props) {
						// here we just parse throguht them, by spliting on comas (if present) and then removing the "'"
						for (let prop of props[0].split(",")) {
							prop = prop.trim();
							prop = prop.slice(1, prop.length - 1);
							allProps.push(prop);
						}
					}
				}
				if (allProps.length > 0) {
					return allProps;
				}
			}
		}

		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/TR/WD-css1-960726.html
			// Specail case for early CSS1
			const allProps = [];
			// This is our fingerprint
			let item = $(`a:contains("CSS1 properties")`);
			if (item && item.length > 0) {
				// We loop over contents (which lists props) from '5' to '6'
				let newCheck = true;
				while (newCheck) {
					item = $(item).next();
					if (item.text()[0] == "6") {
						newCheck = false;
					} else {
						// we use REGEX here to only get text in "'", which are the props
						const props = item.text().match(/\'(.*)\'/);
						if (props) {
							// here we just parse throguht them, by spliting on comas (if present) and then removing the "'"
							for (let prop of props[0].split(",")) {
								prop = prop.trim();
								prop = prop.slice(1, prop.length - 1);
								allProps.push(prop);
							}
						}
					}
				}
				if (allProps.length > 0) {
					return allProps;
				}
			}
		}

		logError("Props", sheet);
		return undefined;
	} catch {
		logError("Props & ERROR", sheet);
		return undefined;
	}
};
