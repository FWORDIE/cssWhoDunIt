import { flags } from "../getSpecInfo.ts";
import * as cheerio from "npm:cheerio@^1.0.0";
import { logError } from "./logger.ts";

export const getAuthors = ($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called and not relevent
	if (!flags.focus.match("all|authors")) {
		return undefined;
	}
	return undefined;
};
