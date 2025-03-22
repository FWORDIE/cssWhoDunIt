import * as cheerio from "npm:cheerio@^1.0.0";
import { ignore, logError } from "./basics.ts";
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
		if (editorsHeader) {
			let stillSearching = true;

			let item = $(editorsHeader);
			while (stillSearching) {
				item = $(item).next();
				if (item.length < 1 || item.prop("tagName") == "DT") {
					stillSearching = false;
				} else {
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

			if (editors.length > 0) {
				return cleaner(editors);
			}
		}
		//e.g. https://www.w3.org/TR/2009/WD-css3-animations-20090320/
		editorsHeader = $('dt:contains("Editors:")').first();
		if (editorsHeader) {
			let stillSearching = true;
			let item = $(editorsHeader);

			while (stillSearching) {
				item = $(item).next();
				if (item.length < 1 || item.prop("tagName") == "DT") {
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
		if (editorsHeader) {
			let stillSearching = true;
			let item = $(editorsHeader);
			while (stillSearching) {
				item = $(item).next();
				if (item.length < 1 || item.prop("tagName") == "DT") {
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
		// e.g. https://www.w3.org/TR/2012/WD-css3-ui-20120117/
		editorsHeader = $('dt:contains("Editor:")').first();
		if (editorsHeader) {
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
		if (editorsHeader) {
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
		if (editorsHeader) {
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
		if (editorsHeader) {
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
		if (editorsHeader) {

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
		author.org = cleanString(author.org);
		//@ts-ignore
		author.link = cleanString(author.link);
	}
	return authors;
};

const cleanString = (string: string | null) => {
	if (string) {
		string = string
			.replace("\n", "")
			.replace("'", "")
			.replace("(", "")
			.replace(")", "");
		string = string.replace(/\s+/g, " ").trim();
	}
	return string;
};
