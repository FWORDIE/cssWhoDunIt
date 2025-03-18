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

		//e.g. https://www.w3.org/TR/css-contain-3/
		let editorsTags = $(".vcard.editor");

		if (editorsTags) {
			for (const editor of editorsTags) {
				let editorInfo = {
					name: $(editor).find(".p-name").text().trim(),
					org: $(editor).find(".p-org").text().trim(),
					link: $(editor).find(".p-name").prop("href"),
				};
				if (editorInfo) {
					editors.push(editorInfo);
				}
			}
			if (editors.length > 0) {
				return editors;
			}
		}

		// e.g. https://www.w3.org/TR/2007/WD-css3-box-20070809/
		editorsTags = $('dt:contains("Editors:")').parent().find(".vcard");

		if (editorsTags) {
			for (const editor of editorsTags) {
				let editorInfo = {
					name: $(editor).find(".fn").text().trim(),
					org: $(editor).find(".org").text().trim(),
					link: $(editor).find(".email").prop("href"),
				};
				if (editorInfo) {
					editors.push(editorInfo);
				}
			}
			if (editors.length > 0) {
				return editors;
			}
		}
		//e.g. https://www.w3.org/TR/2011/WD-css3-grid-layout-20110407/
		const editorsHeader = $('dt:contains("Editors:")');

		if (editorsHeader) {
			let stillSearching = true;
			let item = $(editorsHeader);
			while (stillSearching) {
				item = $(item).next();
				if (item.length < 1 || item.prop('tagName') == 'DT') {
					stillSearching = false;
				} else {
					console.log(item.text())

					// let editorInfo = {
					// 	name: $(item).find("a").text().trim(),
					// 	org: $(item).text().split(",")[1].trim(),
					// 	link: $(item).find("a").prop("href"),
					// };
					// editors.push(editorInfo);
				}
			}
			if (editors.length > 0) {
				return editors;
			}
		}

		logError("Authors", sheet);
		return undefined;
	} catch {
		logError("Authors & ERROR", sheet);
		return undefined;
	}
};
