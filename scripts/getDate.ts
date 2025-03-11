import { flags } from "../getSpecInfo.ts";
import * as cheerio from "npm:cheerio@^1.0.0";
import { logError } from "./logger.ts";
import moment from "npm:moment";

export const getDate = ($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called and not relevent
	if (!flags.focus.match("all|date")) {
		return undefined;
	}
	try {
		// find date with time tag
		// e.g. https://www.w3.org/TR/css-shadow-parts-1/
		let date = $(".head").find("time").text();
		let formatedDate = moment(date, "DD MMMM YYYY").format();
		if (formatedDate && formatedDate != "Invalid date") {
			// await progress.console(formatedDate);
			return formatedDate;
		}

		// For no time tag
		// e.g. https://www.w3.org/TR/2012/WD-css3-text-20121113/
		let thisVersion = $(".head")
			.find("dt:contains('This version:')")
			.next()
			.find("a")
			.attr()?.href;

		// Alt Spelling
		// e.g. https://www.w3.org/TR/2012/REC-css3-mediaqueries-20120619/
		if (!thisVersion) {
			thisVersion = $(".head")
				.find("dt:contains('This Version:')")
				.next()
				.find("a")
				.attr()?.href;
		}

		if (thisVersion) {
			// Deals with trailig slashes at the end of URLs
			// e.g. https://www.w3.org/TR/2007/CR-CSS21-2007071919
			const change = thisVersion[thisVersion.length - 1] === "/" ? 1 : 0;

			date = thisVersion.slice(
				thisVersion.length - (8 + change),
				thisVersion.length - change,
			);

			formatedDate = moment(date, "YYYYMMDD").format();

			if (formatedDate && formatedDate != "Invalid date") {
				return formatedDate;
			}
		}

		// fall back to get date from URL
		// with .html
		// e.g. https://www.w3.org/pub/WWW/TR/WD-css1-951123.html
		date = sheet.slice(sheet.length - 11, sheet.length - 5);
		formatedDate = moment(date, "YYMMDD").format();
		if (formatedDate && formatedDate != "Invalid date") {
			return formatedDate;
		}

		// with /fonts.html
		// e.g. https://www.w3.org/TR/1998/REC-CSS2-19980512/fonts.html
		date = sheet.slice(sheet.length - 19, sheet.length - 11);
		formatedDate = moment(date, "YYYYMMDD").format();
		if (formatedDate && formatedDate != "Invalid date") {
			return formatedDate;
		}

		// other
		// e.g. https://www.w3.org/TR/2018/SPSD-CSS1-20180913/
		const change = sheet[sheet.length - 1] === "/" ? 1 : 0;
		date = sheet.slice(sheet.length - (8 + change), sheet.length - change);
		formatedDate = moment(date, "YYYYMMDD").format();
		if (formatedDate && formatedDate != "Invalid date") {
			return formatedDate;
		}

		logError("DATE", sheet);
		return undefined;
	} catch {
		logError("DATE & ERROR", sheet);
		return undefined;
	}
};
