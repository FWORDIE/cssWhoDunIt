import * as cheerio from "npm:cheerio@^1.0.0";
import { ignore,logError } from "./basics.ts";


export const getAuthors = async ($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called or is a known issue
	if (await ignore("authors", sheet)) {
		
		return undefined;
	}
	return undefined;
};
