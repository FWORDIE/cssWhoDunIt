import * as cheerio from "npm:cheerio@^1.0.0";
import { ignore, logError, orgTable } from "./basics.ts";
import { Authors } from "../types.ts";

export const getAuthors = async ($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called or is a known issue
	if (await ignore("authors", sheet)) {
		return undefined;
	}

	try {
		const editors: Authors[] = [];

		// This code fails becuase it also finds former Editors
		// e.g. https://www.w3.org/TR/css-paint-api-1/
		// //e.g. https://www.w3.org/TR/css-contain-3/
		// let editorsTags = $(".vcard.editor");

		// if (editorsTags) {
		// 	for (const editor of editorsTags) {
		// 		let editorInfo = {
		// 			name: $(editor).find(".p-name").text().trim(),
		// 			org: $(editor).find(".p-org").text().trim(),
		// 			link: $(editor).find(".p-name").prop("href"),
		// 		};
		// 		if (editorInfo) {
		// 			editors.push(editorInfo);
		// 		}
		// 	}
		// 	if (editors.length > 0) {
		// 		return cleaner(editors);
		// 	}
		// }

		// This code fails becuase it also finds former Editors
		// e.g. https://www.w3.org/TR/2020/WD-css-position-3-20200519/
		//  //e.g. https://www.w3.org/TR/2007/WD-css3-box-20070809/
		// let editorsTags = $('dt:contains("Editors:")').parent().find(".vcard");

		// if (editorsTags) {
		// 	for (const item of editorsTags) {
		// 		const name = $(item).find(".fn").text().trim() || "";
		// 		const org = $(item).find(".org").text().trim() || "";
		// 		const link = $(item).find(".email").prop("href") || "";
		// 		if (name && org) {
		// 			const editorInfo = {
		// 				name: name,
		// 				org: org,
		// 				link: link,
		// 			};
		// 			editors.push(editorInfo);
		// 		}
		// 	}
		// 	if (editors.length > 0) {
		// 		return cleaner(editors);
		// 	}
		// }
		//e.g. https://www.w3.org/TR/2011/WD-css3-grid-layout-20110407/
		let editorsHeader = $('dt:contains("Editors:")').first();
		if (editorsHeader && !$(editorsHeader).text().includes("Former")) {
			let stillSearching = true;

			let item = $(editorsHeader);
			while (stillSearching) {
				item = $(item).next();
				if (item.length < 1 || item.prop("tagName") == "DT") {
					stillSearching = false;
				} else {
					const string = $(item).text().split(",");
					if (
						string.length > 1 &&
						!$(item).text().includes("Adobe Systems, Inc")
					) {
						const name = $(item).text().split(",")[0]?.trim() || "";
						const org = $(item).text().split(",")[1]?.trim() || "";
						const link = $(item).find("a")?.prop("href") || "";
						if (name && org) {
							const editorInfo = {
								name: name,
								org: org,
								link: link,
							};
							editors.push(editorInfo);
						}
					}
				}
			}

			if (editors.length > 0) {
				return cleaner(editors);
			}
		}
		//e.g. https://www.w3.org/TR/2009/WD-css3-animations-20090320/
		editorsHeader = $('dt:contains("Editors:")').first();
		if (editorsHeader && !$(editorsHeader).text().includes("Former")) {
			let stillSearching = true;
			let item = $(editorsHeader);

			while (stillSearching) {
				item = $(item).next();
				if (
					item.length < 1 ||
					item.prop("tagName") == "DT" ||
					$(item).children().length < 2
				) {
					stillSearching = false;
				} else {
					const name = $(item).children().first().text().trim() || "";
					const org = $(item).children().last().text().trim() || "";
					const link = $(item).find("a").prop("href") || "";
					if (name) {
						const editorInfo = {
							name: name,
							org: org,
							link: link,
						};
						editors.push(editorInfo);
					}
				}
			}
			if (editors.length > 0) {
				return cleaner(editors);
			}
		}

		//e.g. https://www.w3.org/TR/css-paint-api-1/
		if (editorsHeader && !$(editorsHeader).text().includes("Former")) {
			let stillSearching = true;
			let item = $(editorsHeader);

			while (stillSearching) {
				item = $(item).next();
				if (
					item.length < 1 ||
					item.prop("tagName") == "DT" ||
					$(item).children().length < 2
				) {
					stillSearching = false;
				} else {
					const name = $(item).children().first().text().trim() || "";
					const org = $(item).children().next()?.text().trim() || "";
					const link = $(item).find("a").prop("href") || "";
					// TODO: Write a function to get org from email
					if (name) {
						const editorInfo = {
							name: name,
							org: org,
							link: link,
						};
						editors.push(editorInfo);
					}
				}
			}
			if (editors.length > 0) {
				return cleaner(editors);
			}
		}

		//e.g. https://www.w3.org/TR/2012/WD-css3-transforms-20120228/
		if (editorsHeader && !$(editorsHeader).text().includes("Former")) {
			let stillSearching = true;
			let item = $(editorsHeader);

			while (stillSearching) {
				item = $(item).next();
				if (
					item.length < 1 ||
					item.prop("tagName") == "DT" ||
					$(item).text().split(")")[1] == undefined ||
					$(item).find("a").length > 0
				) {
					stillSearching = false;
				} else {
					const name = $(item).text().split("(")[0].trim() || "";
					const org = $(item).children().first().text().trim() || "";
					const link = $(item).text().split(")")[1].trim() || "";
					// TODO: Write a function to get org from email
					if (name) {
						const editorInfo = {
							name: name,
							org: org,
							link: link,
						};
						editors.push(editorInfo);
					}
				}
			}
			if (editors.length > 0) {
				return cleaner(editors);
			}
		}

		//e.g. https://www.w3.org/TR/2011/WD-css3-values-20110906/
		if (editorsHeader && !$(editorsHeader).text().includes("Former")) {
			let stillSearching = true;
			let item = $(editorsHeader);

			while (stillSearching) {
				item = $(item).next();
				if (
					item.length < 1 ||
					item.prop("tagName") == "DT" ||
					$(item).text().split("(")[1] === undefined
				) {
					stillSearching = false;
				} else {
					const name = $(item).text().split("(")[0].trim() || "";
					const org = $(item).text().split("(")[1].trim() || "";
					const link = $(item).find("a").prop("href") || "";
					// TODO: Write a function to get org from email
					if (name) {
						const editorInfo = {
							name: name,
							org: org,
							link: link,
						};
						editors.push(editorInfo);
					}
				}
			}
			if (editors.length > 0) {
				return cleaner(editors);
			}
		}

		// e.g. https://www.w3.org/TR/2016/WD-css-properties-values-api-1-20160607/
		if (editorsHeader && !$(editorsHeader).text().includes("Former")) {
			let stillSearching = true;
			let item = $(editorsHeader);

			while (stillSearching) {
				item = $(item).next();
				if (
					item.length < 1 ||
					item.prop("tagName") == "DT" ||
					$(item).find(".p-name").length < 1
				) {
					stillSearching = false;
				} else {
					const name = $(item).children().first().text() || "";
					const org = $(item).find("a").prop("href") || "";
					const link = $(item).find("a").prop("href") || "";
					// TODO: Write a function to get org from email
					// TODO: Write fucntion to clean Org, name BIG PATTERN MATCH
					if (name) {
						const editorInfo = {
							name: name,
							org: org,
							link: link,
						};
						editors.push(editorInfo);
					}
				}
			}
			if (editors.length > 0) {
				return cleaner(editors);
			}
		}

		// e.g. https://www.w3.org/TR/2012/WD-css3-ui-20120117/
		editorsHeader = $('dt:contains("Editor:")').first();
		if (editorsHeader && !$(editorsHeader).text().includes("Former")) {
			let stillSearching = true;
			let item = $(editorsHeader);
			while (stillSearching) {
				item = $(item).next();
				if (item.length < 1 || item.prop("tagName") == "DT") {
					stillSearching = false;
				} else {
					const name = $(item).children().first().text().trim() || "";
					const org =
						$(item).children().first().next()?.text().trim() || "";
					const link = $(item).find("a").prop("href") || "";
					// TODO: Write a function to get org from email
					// TODO: Write fucntion to clean Org, name BIG PATTERN MATCH
					if (name) {
						const editorInfo = {
							name: name,
							org: org,
							link: link,
						};
						editors.push(editorInfo);
					}
				}
			}
			if (editors.length > 0) {
				return cleaner(editors);
			}
		}

		//e.g. https://www.w3.org/TR/2005/WD-css3-cascade-20051215/
		if (editorsHeader && !$(editorsHeader).text().includes("Former")) {
			let stillSearching = true;
			let item = $(editorsHeader);
			while (stillSearching) {
				item = $(item).next();
				if (item.length < 1 || item.prop("tagName") == "DT") {
					stillSearching = false;
				} else {
					let strings = $(item).text().split(",");
					if (strings.length > 1) {
						const name = strings[0]?.trim() || "";
						const org = strings[1]?.trim() || "";
						const link = strings[2]?.trim() || "";
						// TODO: Write a function to get org from email
						// TODO: Write fucntion to clean Org, name BIG PATTERN MATCH
						if (name) {
							const editorInfo = {
								name: name,
								org: org,
								link: link,
							};
							editors.push(editorInfo);
						}
					}
				}
			}
			if (editors.length > 0) {
				return cleaner(editors);
			}
		}

		//e.g. https://www.w3.org/TR/2011/WD-css3-ruby-20110630/
		if (editorsHeader && !$(editorsHeader).text().includes("Former")) {
			let stillSearching = true;
			let item = $(editorsHeader);
			while (stillSearching) {
				item = $(item).next();
				if (item.length < 1 || item.prop("tagName") == "DT") {
					stillSearching = false;
				} else {
					let strings = $(item).text().split("(");
					if (strings.length > 1) {
						const name = strings[0]?.trim() || "";
						const org = strings[1]?.trim() || "";
						const link = strings[2]?.trim() || "";
						// TODO: Write a function to get org from email
						// TODO: Write fucntion to clean Org, name BIG PATTERN MATCH
						if (name) {
							const editorInfo = {
								name: name,
								org: org,
								link: link,
							};
							editors.push(editorInfo);
						}
					}
				}
			}
			if (editors.length > 0) {
				return cleaner(editors);
			}
		}

		//e.g. https://www.w3.org/1999/06/25/WD-css3-namespace-19990625/
		editorsHeader = $('dt:contains("Editor")').first();
		if (editorsHeader && !$(editorsHeader).text().includes("Former")) {
			let stillSearching = true;
			let item = $(editorsHeader);

			while (stillSearching) {
				item = $(item).next();
				if (item.length < 1 || item.prop("tagName") == "DT") {
					stillSearching = false;
				} else {
					let strings = $(item).text().split(",");
					if (strings.length > 1) {
						const name =
							$(item).children().first().text().trim() || "";
						const org =
							$(item).children().first().next()?.text().trim() ||
							"";
						const link = $(item).find("a").prop("href") || "";
						// TODO: Write a function to get org from email
						// TODO: Write fucntion to clean Org, name BIG PATTERN MATCH
						if (name) {
							const editorInfo = {
								name: name,
								org: org,
								link: link,
							};
							editors.push(editorInfo);
						}
					}
				}
			}
			if (editors.length > 0) {
				return cleaner(editors);
			}
		}

		//e.g. https://www.w3.org/TR/WD-css1-951117.html
		let addresses = $("address");
		if (editorsHeader && !$(editorsHeader).text().includes("Former")) {
			for (let item of addresses) {
				let strings = $(item).text().split("(");
				if (strings.length > 1) {
					const name = strings[0]?.trim() || "";
					const org = strings[1]?.trim() || "";
					const link = $(item).find("a").prop("href") || "";
					// TODO: Write a function to get org from email
					// TODO: Write fucntion to clean Org, name BIG PATTERN MATCH
					if (name) {
						const editorInfo = {
							name: name,
							org: org,
							link: link,
						};
						editors.push(editorInfo);
					}
				}
			}
			if (editors.length > 0) {
				return cleaner(editors);
			}
		}

		// NOTE: AUTHORS NOT EDITORS
		//e.g. https://www.w3.org/TR/WD-css1-960418.html
		let editorsTags = $('dt:contains("Authors:")').first().next();
		if (editorsTags) {
			let item = $(editorsTags).first().text().trim();
			let items = item.split(")");
			if (items.length > 0) {
				for (let author of items) {
					let strings = author.split("(");
					if (strings.length > 1) {
						const name = strings[0]?.trim() || "";
						const org = strings[1]?.trim() || "";
						const link = strings[1]?.trim() || "";
						if (name) {
							const editorInfo = {
								name: name,
								org: org,
								link: link,
							};
							editors.push(editorInfo);
						}
					}
				}
			}

			if (editors.length > 0) {
				return cleaner(editors);
			}
		}

		// NOTE; AUTHORS
		//e.g. https://www.w3.org/TR/2001/WD-css3-mediaqueries-20010517/
		editorsHeader = $('dt:contains("Authors")').first();
		if (editorsHeader && !$(editorsHeader).text().includes("Former")) {
			let stillSearching = true;
			let item = $(editorsHeader);

			while (stillSearching) {
				item = $(item).next();
				if (!$(item).html()?.includes("<br>")) {
					if (item.length < 1 || item.prop("tagName") == "DT") {
						stillSearching = false;
					} else {
						let strings = $(item).text().split(",");
						if (strings.length > 1) {
							const name = strings[0]?.trim() || "";
							const org = strings[1]?.trim() || "";
							const link = strings[2]?.trim() || "";
							// TODO: Write a function to get org from email
							// TODO: Write fucntion to clean Org, name BIG PATTERN MATCH
							if (name) {
								const editorInfo = {
									name: name,
									org: org,
									link: link,
								};
								editors.push(editorInfo);
							}
						}
					}
				} else {
					stillSearching = false;
				}
			}
			if (editors.length > 0) {
				return cleaner(editors);
			}
		}

		// NOTE; AUTHORS
		//e.g. https://www.w3.org/TR/1999/REC-CSS1-19990111
		editorsTags = $('td:contains("Authors:")').first().next();
		if (editorsTags) {
			let item = $(editorsTags).first().text().trim();
			let items = item.split(")");
			if (items.length > 0) {
				for (let author of items) {
					let strings = author.split("(");
					if (strings.length > 1) {
						const name = strings[0]?.trim() || "";
						const org = strings[1]?.trim() || "";
						const link = strings[1]?.trim() || "";
						if (name) {
							const editorInfo = {
								name: name,
								org: org,
								link: link,
							};
							editors.push(editorInfo);
						}
					}
				}
			}

			if (editors.length > 0) {
				return cleaner(editors);
			}
		}

		// NOTE AUTHORS
		//e.g. https://www.w3.org/TR/1999/WD-font-19990902
		editorsTags = $('dt:contains("Authors:")').first().next();
		if (editorsTags) {
			let item = $(editorsTags).html()?.trim();
			let items = item?.split("<br>");
			if (items && items.length > 0) {
				for (let author of items) {
					let strings = author.split(",");
					if (strings.length > 1) {
						const name = strings[0]?.trim() || "";
						const org = strings[1]?.trim() || "";
						const link = strings[2]?.trim() || "";
						if (name) {
							const editorInfo = {
								name: name,
								org: org,
								link: link,
							};
							editors.push(editorInfo);
						}
					}
				}
			}

			if (editors.length > 0) {
				return cleaner(editors);
			}
		}

		logError("Authors", sheet);
		return undefined;
	} catch {
		logError("Authors & ERROR", sheet);
		return undefined;
	}
};

const cleaner = (authors: Authors[]) => {
	for (let author of authors) {
		author.name = cleanString(author.name);
		author.org = cleanOrg(author.org);
		//@ts-ignore
		author.link = cleanString(author.link);
		if (author.org === "" && author.link) {
			author.org = author.link;
		}
	}
	return authors;
};

const cleanOrg = (string: string | null) => {
	if (string?.includes("@")) {
		const domain = string.split("@")[1];

		string = domain;
	}
	let org = cleanString(string);
	return lookUpfunction(org, orgTable);
};

const cleanString = (string: string | null) => {
	if (string) {
		string = string
			.replace("\n", "")
			.replace("'", "")
			.replace("(", "")
			.replace(")", "")
			.replace(",", "")
			.replace(">", "")
			.replace("<", "");
		string = string[0].toUpperCase() + string.slice(1);
		string = string.replace(/\s+/g, " ").trim();
	}
	return string;
};

const lookUpfunction = (string: string | null, table: string[][]) => {
	if (string) {
		for (const array of table) {
			if (array.includes(string)) {
				return array[0];
			}
		}
	}
	return string;
};
