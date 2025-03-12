import * as cheerio from "npm:cheerio@^1.0.0";
import { ignore,logError } from "./basics.ts";

export const getAbstract = async ($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called or is a known issue
	if (await ignore("abstract", sheet)) {
		return undefined;
	}

	try {
		// List of different ways to find abstract

		// e.g. https://www.w3.org/TR/2024/WD-css-conditional-5-20240723/
		let abstract = $('[data-fill-with="abstract"]').find("p").text().trim();

		// e.g. https://www.w3.org/TR/2014/WD-css-masking-1-20140213/
		if (!abstract) {
			abstract = $("#abstract").next().text().trim();
		}

		// e.g. https://www.w3.org/TR/2001/WD-css3-box-20010726/
		if (!abstract) {
			abstract = $("#Abstract").next().text().trim();
		}

		// e.g. https://www.w3.org/TR/2003/CR-css3-ruby-20030514
		if (!abstract) {
			abstract = $("#Abstract").parent().next().text().trim();
		}
		// e.g. https://www.w3.org/TR/2009/WD-css3-selectors-20090310
		if (!abstract) {
			abstract = $('[name="abstract"]').parent().next().text().trim();
		}

		// e.g. https://www.w3.org/1999/06/WD-css3-page-19990623
		if (!abstract) {
			abstract = $("h2:contains('Abstract')").next().text().trim();
		}

		if (abstract) {
			return abstract;
		}
		logError("ABSTRACT", sheet);
		return undefined;
	} catch {
		logError("ABSTRACT & ERROR", sheet);
		return undefined;
	}
};
