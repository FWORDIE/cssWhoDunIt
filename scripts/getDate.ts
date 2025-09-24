import * as cheerio from "npm:cheerio@^1.0.0";
import { logError } from "./basics.ts";
import moment from "npm:moment";
import { ignore } from "../getSpecInfo.ts";

export const getDate = async ($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called or is a known issue
	if (await ignore("date", sheet)) {
		return undefined;
	}

	try {
		// Code to get HTML from https://www.w3.org/TR/WD-CSS2-971104/
		if ($("body").find('a:contains("HTML on line")').length > 0) {
			const redirect =
				sheet +
				$("body").find('a:contains("HTML on line")').first().attr()
					?.href;
			sheet = redirect;
			if (redirect) {
				$ = await cheerio.fromURL(redirect);
			}
		}

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
			// this part somehow can't get the date of https://www.w3.org/TR/1999/REC-CSS1-19990111 and I can not tell why!! wait actually maybe I can.
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

		// Check if string contains only numbers
		// https://www.fwait.com/how-to-check-if-string-does-not-contain-letters-in-javascript/
		//the first chech
		let regExp = /[a-z]/i;

		date = sheet.slice(sheet.length - 19, sheet.length - 11);

		formatedDate = moment(date, "YYYYMMDD").format();
		if (
			formatedDate &&
			formatedDate != "Invalid date" &&
			!regExp.test("1" + date)
		) {
			return formatedDate;
		}

		// other
		// e.g. https://www.w3.org/TR/2018/SPSD-CSS1-20180913/
		const change = sheet[sheet.length - 1] === "/" ? 1 : 0;
		date = sheet.slice(sheet.length - (8 + change), sheet.length - change);
		formatedDate = moment(date, "YYYYMMDD").format();
		if (
			formatedDate &&
			formatedDate != "Invalid date" &&
			!regExp.test(date)
		) {
			return formatedDate;
		}

		//NOTE: What is this meant to be doing and for what spec 2 lets see if this works
		//why is it not working???
		date = $(".head").find("h2.no-num.no-toc").children().text().trim();
		formatedDate = moment(date, "DDMMMMYYYY").format();
		if (formatedDate && formatedDate != "Invalid date") {
			return formatedDate;
		}

		// superLazy fix, but im done
		if (sheet == "https://www.w3.org/pub/WWW/TR/PR-CSS1") {
			date = "11/04/2008";
			formatedDate = moment(date, "DD/MM/YYYY").format();

			if (formatedDate && formatedDate != "Invalid date") {
				return formatedDate;
			}
		}

		if (sheet == "https://www.w3.org/TR/WD-CSS2-971104/cover.html") {
			date = "04/11/1997";
			formatedDate = moment(date, "DD/MM/YYYY").format();

			if (formatedDate && formatedDate != "Invalid date") {
				return formatedDate;
			}
		}

		logError("DATE", sheet);
		return undefined;
	} catch {
		logError("DATE & ERROR", sheet);
		return undefined;
	}
};
