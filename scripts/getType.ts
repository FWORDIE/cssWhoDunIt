import * as cheerio from "npm:cheerio@^1.0.0";
import { ignore, logError } from "./basics.ts";

export const getType = async ($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called or is a known issue
	if (await ignore("type", sheet)) {
		return undefined;
	}
	return undefined;
};
