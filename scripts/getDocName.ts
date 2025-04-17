import * as cheerio from "npm:cheerio@^1.0.0";
import { logError } from "./basics.ts";
import { ignore } from "../getSpecInfo.ts";

//Finding docnames
export const getDocName = async($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called or is a known issue
	if (await ignore("name", sheet)) {
		return undefined;
	}
	try {
		//from the title in the head
		let docName = $("title").text().trim();
		if (docName) {
			return docName;
		}
		logError("DOCNAME", sheet);
		return undefined;
	} catch {
		logError("DOCNAME & ERROR", sheet);
		return undefined;
	}
};
