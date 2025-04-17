import * as cheerio from "npm:cheerio@^1.0.0";
import { logError } from "./basics.ts";
import { ignore } from "../getSpecInfo.ts";

export const getEditors = async ($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called or is a known issue
	if (await ignore("editors", sheet)) {
		return undefined;
	}

	return undefined;
};
