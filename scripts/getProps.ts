import * as cheerio from "npm:cheerio@^1.0.0";
import { logError } from "./basics.ts";
import { addLink } from "../addToMissing.ts";
import { progress } from "../getSpecInfo.ts";
import { ignore } from "../getSpecInfo.ts";

const MDNProps = await JSON.parse(
	await Deno.readTextFile("./jsons/allProps.json"),
);

export const getProps = async ($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called and not relevent
	if (await ignore("props", sheet)) {
		return undefined;
	}

	try {
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
			// specail check for https://www.w3.org/TR/2013/WD-css-counter-styles-3-20130221/
			if (
				$("table.proptable").prev().text().trim() != "Descriptor index"
			) {
				// e.g. https://www.w3.org/TR/2011/WD-css3-flexbox-20110322
				propertyIndexList = $("table.proptable")
					.find("tbody")
					.find(".property");
			}
		}

		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/TR/2002/WD-css3-background-20020802/
			propertyIndexList = $("table.proptable")
				.find("tbody")
				.find("tr td a");
		}

		if (propertyIndexList) {
			const allProps: string[] = [];
			// quick Check if this is a weird false postive
			if ($('p:contains("No properties defined.")').length > 0) {
				await addLink("props", sheet);
				return undefined;
			}
			// Loops over all things in the indx and adds them to props array
			for (const row of propertyIndexList) {
				// extra checks for https://www.w3.org/TR/2002/WD-css3-text-20021024/
				// and https://www.w3.org/TR/2013/WD-css3-cascade-20130103/
				if (
					$(row).parent().next().text().trim() != "" ||
					$(row).parent().next().length == 0 ||
					$(row).text().trim() === "all"
				) {
					let prop = $(row).text().trim();
					if (prop && cleanProp(prop, sheet) != "FAILED") {
						allProps.push(cleanProp(prop, sheet));
					}
				} else {
					// console.log('here',$(row).parent().next().text().trim())
				}
			}
			if (allProps.length > 0) {
				return allProps;
			}
		}

		// more specail cases
		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://drafts.csswg.org/css-2023

			const allProps: string[] = [];
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
						if (prop && cleanProp(prop, sheet) != "FAILED") {
							allProps.push(cleanProp(prop, sheet));
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
			const allProps: string[] = [];
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
						for (let propss of props[0].split(",")) {
							for (let prop of propss.split(" ")) {
								if (
									prop &&
									cleanProp(prop, sheet) != "FAILED"
								) {
									allProps.push(cleanProp(prop, sheet));
								}
							}
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
			const allProps: string[] = [];
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
							if (prop && cleanProp(prop, sheet) != "FAILED") {
								allProps.push(cleanProp(prop, sheet));
							}
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
			const allProps: string[] = [];
			// This is our fingerprint
			let item = $(`a:contains("5         CSS1 properties")`);
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
								if (
									prop &&
									cleanProp(prop, sheet) != "FAILED"
								) {
									allProps.push(cleanProp(prop, sheet));
								}
							}
						}
					}
				}
				if (allProps.length > 0) {
					return allProps;
				}
			}
		}
		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/1999/06/WD-css3-page-19990623
			// Specail case for internal property definations
			const allProps: string[] = [];
			// This is our fingerprint
			let items = $(`table`).find(
				'tr[valign="baseline"] th:contains("Property:")',
			);
			if (items && items.length > 0) {
				for (const item of items) {
					let prop = $(item).next().text();
					if (prop && cleanProp(prop, sheet) != "FAILED") {
						allProps.push(cleanProp(prop, sheet));
					}
				}
			}
			if (allProps.length > 0) {
				return allProps;
			}
		}

		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/TR/2003/WD-css3-page-20031218/
			// Specail case for internal property definations
			const allProps: string[] = [];
			// This is our fingerprint
			let items = $(`table.propdef`);
			if (items && items.length > 0) {
				for (const item of items) {
					let prop = $(item)
						.find("tbody")
						.children()
						.first()
						.find("dfn")
					for (let propper of prop) {
						let propperText = $(propper).text()
						if (propperText && cleanProp(propperText, sheet) != "FAILED") {
							allProps.push(cleanProp(propperText, sheet));
						}
					}
					// e.g. https://www.w3.org/TR/2004/WD-css3-speech-20040727/
					let propText = $(item).find("caption").find("dfn").text();
					if (propText && cleanProp(propText, sheet) != "FAILED") {
						allProps.push(cleanProp(propText, sheet));
					}
				}
			}
			if (allProps.length > 0) {
				return allProps;
			}
		}

		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/TR/2013/WD-cssom-view-20131217/
			// Specail case for internal property definations
			const allProps: string[] = [];
			// This is our fingerprint
			let items = $(`pre.propdef`);
			if (items && items.length > 0) {
				for (const item of items) {
					let prop = $(item).find("dfn").text();
					if (prop && cleanProp(prop, sheet) != "FAILED") {
						allProps.push(cleanProp(prop, sheet));
					}
				}
			}
			if (allProps.length > 0) {
				return allProps;
			}
		}

		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/TR/2014/WD-compositing-1-20140107/
			// Specail case for internal property definations
			const allProps: string[] = [];
			// This is our fingerprint
			let items = $(`div.propdef`);
			if (items && items.length > 0) {
				for (const item of items) {
					let prop = $(item).find("code.property").text();
					if (prop && cleanProp(prop, sheet) != "FAILED") {
						allProps.push(cleanProp(prop, sheet));
					}
				}
			}
			if (allProps.length > 0) {
				return allProps;
			}
		}

		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/TR/2001/WD-css3-ruby-20010216/
			// Specail case for ruby table
			const allProps: string[] = [];
			// This is our fingerprint
			let table = $(`h2 a[name="properties"]`)
				.parent()
				.next()
				.find("tbody")
				.find("a");
			if (table && table.length > 0) {
				for (const item of table) {
					let prop = $(item).text();
					if (prop) {
						if (prop && cleanProp(prop, sheet) != "FAILED") {
							allProps.push(cleanProp(prop, sheet));
						}
					}
				}
			}
			if (allProps.length > 0) {
				return allProps;
			}
		}

		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/TR/WD-css1-951222.html
			// Specail case for early CSS1 WD
			const allProps: string[] = [];
			// This is our fingerprint
			let item = $(`h2:contains("CSS1 properties")`);
			if (item && item.length > 0) {
				// We loop over contents (which lists props) from 'H2' to 'H2'
				let newCheck = true;
				while (newCheck) {
					item = $(item).next();
					if ($(item).prop("tagName") == "H2") {
						newCheck = false;
					} else {
						if ($(item).prop("tagName") == "H4") {
							let props = item.text();
							for (let prop of props.split(",")) {
								for (let prope of prop.split("\n")) {
									// sorry if this is ugly
									let thisProp = prope
										.trim()
										.match(/\'(.*)\'/);
									if (thisProp && thisProp[1]) {
										if (
											thisProp[1] &&
											cleanProp(thisProp[1], sheet)
										) {
											allProps.push(
												cleanProp(thisProp[1], sheet),
											);
										}
									}
								}
							}
						}
					}
				}
				if (allProps.length > 0) {
					return allProps;
				}
			}
		}

		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/TR/REC-CSS1/
			// Specail case for early CSS1 WD
			const allProps: string[] = [];
			// This is our fingerprint
			let item = $(`h2:contains("CSS1 properties")`);
			if (item && item.length > 0) {
				// We loop over contents (which lists props) from 'H2' to 'H2'
				let newCheck = true;
				while (newCheck) {
					item = $(item).next();
					if ($(item).prop("tagName") == "H2") {
						newCheck = false;
					} else {
						if ($(item).prop("tagName") == "H4") {
							let props = item.text();
							for (let prop of props.split(",")) {
								for (let prope of prop.split("\n")) {
									if (
										prope &&
										cleanProp(prope, sheet) != "FAILED"
									) {
										allProps.push(cleanProp(prope, sheet));
									}
								}
							}
						}
					}
				}
				if (allProps.length > 0) {
					return allProps;
				}
			}
		}

		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/1999/06/WD-css3-iccprof-19990623
			// Specail case for super annoying Color Profiles sheet
			const allProps: string[] = [];
			// This is our fingerprint
			let defs = $(`body`).find("div.propdef");
			if (defs && defs.length > 0) {
				for (const item of defs) {
					let prop = $(item).find("span.index-def").prop("title");
					if (prop && cleanProp(prop, sheet) != "FAILED") {
						allProps.push(cleanProp(prop, sheet));
					}
				}
			}
			if (allProps.length > 0) {
				return allProps;
			}
		}

		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/TR/2001/WD-css3-color-20010305
			// Specail case for super annoying Color Profiles sheet
			const allProps: string[] = [];
			// This is our fingerprint
			let defs = $(`body`).find('em:contains("Name:")');
			if (defs && defs.length > 0) {
				for (const item of defs) {
					let prop = $(item).parent().next().text();
					if (prop && cleanProp(prop, sheet) != "FAILED") {
						allProps.push(cleanProp(prop, sheet));
					}
				}
			}
			if (allProps.length > 0) {
				return allProps;
			}
		}
		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/1999/06/WD-css3-multicol-19990623
			// Specail case for super annoying mulitcol sheet
			// This is v bad code, becuase it has loads of false positives
			const allProps: string[] = [];
			// This is our fingerprint
			let table = $(`body`).find("h4");
			if (
				table &&
				table.length > 0 &&
				$(`body`).find('*:contains("Index")').length < 1 &&
				$("body").find('a[name="contents"]').length < 1 &&
				$("body").find("nav#toc").length < 1 && // https://www.w3.org/TR/2018/PR-selectors-3-20180911/
				$("body").find('h2#contents:contains("Table of contents")')
					.length < 1 && // https://www.w3.org/TR/2009/PR-css3-selectors-20091215/
				$("body").find('h2#contents:contains("Table of Contents")')
					.length < 1 && // https://www.w3.org/TR/2011/REC-css3-selectors-20110929/ Because why wouldnt you change the spelling...
				$("body").find('h2 a[name="Contents"]:contains("Contents")')
					.length < 1 // https://www.w3.org/TR/1999/WD-i18n-format-19990127/
			) {
				for (const item of table) {
					let prop = $(item).text();
					if (prop) {
						if (prop && cleanProp(prop, sheet) != "FAILED") {
							allProps.push(cleanProp(prop, sheet));
						}
					}
				}
			}
			if (allProps.length > 0) {
				return allProps;
			}
		}

		if (!propertyIndexList || propertyIndexList.length < 1) {
			// e.g. https://www.w3.org/TR/2001/WD-css3-multicol-20010118/
			// Specail case for super annoying mulitcol sheet, this one is like even more annoying
			// This is v bad code, becuase it has loads of false positives
			const allProps: string[] = [];
			// This is our fingerprint
			let table = $(`body`).find('em:contains("Value:")');
			if (table && table.length > 0) {
				for (const item of table) {
					let title = $(item).parent().prev();
					if ($(title).prop("tagName") == "H3") {
						let text = $(title).text().trim();
						if (text[text.length - 1] == "'") {
							const propArray = text.match(/\'(.*)\'/);
							if (propArray) {
								let prop = propArray[1];
								if (
									prop &&
									cleanProp(prop, sheet) != "FAILED"
								) {
									allProps.push(cleanProp(prop, sheet));
								}
							}
						}
					}
				}
			}
			if (allProps.length > 0) {
				return allProps;
			}
		}

		// Super Super Special case, its a text file....
		// Deal with cover page e.g. https://www.w3.org/TR/WD-CSS2-971104/
		if ($("body").find('a:contains("HTML on line")').length > 0) {
			const allProps: string[] = [];

			const redirect =
				sheet +
				$("body").find('a:contains("plain text file")').first().attr()
					?.href;
			if (redirect) {
				// here we use fetch to get the txt file
				async function fetchText(url: URL | string): Promise<string> {
					const response = await fetch(url);
					if (!response.ok)
						throw new Error(`Response not OK (${response.status})`);
					return response.text();
				}
				let text = await fetchText(redirect);
				let propText = "Property name:";
				let i: number = 0;
				let total = 0;
				while (i - propText.length !== -1) {
					const defin = text.indexOf(propText, i);
					i = defin + propText.length;
					total++;
					const start = text.indexOf("'", i);
					const end = text.indexOf("'", start + 1);
					const prop = text.slice(start + 1, end);
					if (prop && cleanProp(prop, sheet) != "FAILED") {
						allProps.push(cleanProp(prop, sheet));
					}
				}
			}
			if (allProps.length > 0) {
				// deal with random extra ('Important')
				// probs due to bad js but to lazy today
				return allProps.slice(0, allProps.length - 1);
			}
		}

		// auto add to missing for specs that explicity say "No properties defined."
		if (
			$('[data-fill-with="property-index"]').text().trim() ===
				"No properties defined." ||
			$("h2#property-index").next().text().trim() ===
				"No properties defined."
		) {
			await addLink("props", sheet);
			return undefined;
		}

		logError("Props", sheet);
		return undefined;
	} catch {
		logError("Props & ERROR", sheet);
		return undefined;
	}
};

// Test to check that we actaully get real CSS Props
const cleanProp = (prop: string, sheet: string) => {
	prop = prop.trim();
	if (prop[0] === "'") {
		prop = prop.slice(1, prop.length);
	}
	if (prop[prop.length - 1] === "'") {
		prop = prop.slice(0, prop.length - 1);
	}

	prop = prop.replace("(Descriptor)", "");
	prop = prop.replaceAll("[another name?]", "");
	// Here we check that MDN lists this as a Property based off the getAllProps.ts Scrape
	if (
		prop &&
		!/\d/.test(prop) &&
		!prop.includes("<") &&
		!prop.includes("property-name")
		//REMOVED BECUASE WE LOSE OLD PROPS
		// &&
		// MDNProps.some((goodProp: string) => {
		// 	return goodProp == prop;
		// })
	) {
		return prop;
	} else {
		return "FAILED";
	}
};
