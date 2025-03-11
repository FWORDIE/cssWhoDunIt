import { flags } from "../getSpecInfo.ts";
import * as cheerio from "npm:cheerio@^1.0.0";
import { logError } from "./logger.ts";

//Finding docnames
export const getDocName = ($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called and not relevent
	if (!flags.focus.match("all|name")) {
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
