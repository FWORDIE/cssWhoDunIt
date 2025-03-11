// This function will scrape all the info from the spec sheets
// Our approach will be to run this unction itervaily and when it fails, fix the failure
// This is becuase spec sheets are differently formated

import * as cheerio from "npm:cheerio@^1.0.0";
import { specSheetLinkArray, testArray } from "./basics.ts";
import type { ErrorLink, SpecSheet } from "./types.ts";
import moment from "npm:moment";
import ProgressBar from "jsr:@deno-library/progress";
import { delay, retry } from "jsr:@std/async";
import { parseArgs } from "jsr:@std/cli/parse-args";
const brokenLinks: ErrorLink[] = [];
const allSpecInfo: SpecSheet[] = [];

// Get URLs of scrapped Spec Sheets
// See getSpecs.ts
let specs = specSheetLinkArray;

// General Set Up

const flags = parseArgs(Deno.args, {
	string: ["force", "focus"],
	default: { force: "false", focus: "all" },
});

// Progress Bar Set Up
let completed = 0;
const title = "Progress:";
const total = specs.length;
const progress = new ProgressBar({
	title,
	total,
	complete: "=",
	incomplete: "-",
	display: ":title :completed/:total :time [:bar] :percent ETA :eta",
});

// Main Function
const scrapeAll = async () => {
	//handle focus arguemnt
	if (
		!flags.focus.match(
			"all|authors|editors|date|url|name|type|props|abstract",
		)
	) {
		await progress.console(`Unkown focus '${flags.focus}'`);
		await progress.console(
			'Focus must equalone of "all|authors|editors|date|url|name|type|props|abstract" ',
		);
		return false;
	}

	// A list of functions that help with debuggind
	if (Deno.args[0] == "test") {
		// Run for a random selection of Specs
		specs = testArray(Number(Deno.args[1]) || 10);
		await progress.console(
			`Running ${specs.length} test sheets for ${flags.focus}`,
		);
	} else if (Deno.args[0] == "spec") {
		// Run for a specific Spec
		specs = [Deno.args[1]];
		await progress.console(
			`Running just ${Deno.args[1]} test sheets for ${flags.focus}`,
		);
	} else if (Deno.args[0] == "old") {
		// Run the last batch again
		specs = JSON.parse(await Deno.readTextFile("./jsons/oldSpecs.json"));
		await progress.console(
			`Running ${specs.length} old specs sheets for ${flags.focus}`,
		);
	} else if (Deno.args[0] == "broken") {
		// Run any that failed last time
		// See brokenSpecs.json
		// Here we parse the json, so we only get the links
		specs = JSON.parse(
			await Deno.readTextFile("./jsons/brokenSpecs.json"),
		).map(function (el: ErrorLink) {
			return el.sheet;
		});
		await progress.console(
			`Running ${specs.length} broken specs sheets for ${flags.focus}`,
		);
	} else {
		// defualt run with all specs from AllSpecs.json
		await progress.console(
			`Running all ${specs.length} sheets for ${flags.focus}`,
		);
	}

	progress.total = specs.length;

	// Loop to go over all Spec Urls
	for (const specSheet of specs) {
		//pause for for time out issues
		await delay(100);
		await getSpecInfo(specSheet);
	}

	await progress.console(
		`Finished with only ${brokenLinks.length} Specs Failing`,
	);

	await progress.complete;

	await delay(1000);
	await progress.render(completed++);

	// Save all run links
	if (Deno.args[0] != "broken") {
		await Deno.writeTextFile(
			"./jsons/oldSpecs.json",
			JSON.stringify(specs, null, 2),
		);
	}
	// Rerun broken incase of 429: Too Many Requests
	// Only if Forced --force=true
	if (flags.force === "true") {
		await progress.console("Rerunning Broken Links");
		progress.total = brokenLinks.length;
		completed = 0;
		// Rerun broken incase of 429: Too Many Requests
		for (const specSheet of brokenLinks.map(function (el: ErrorLink) {
			return el.sheet;
		})) {
			await getSpecInfo(specSheet);
		}
	}

	// TODO: Function that removes the working urls
};

const getSpecInfo = async (specSheet: string) => {
	// await progress.console(`Scraping: ${specSheet}`);

	try {
		//Make a cheerio object from each url
		let $specSheet = await cheerio.fromURL(specSheet);

		//Deal with redirecting e.g. https://w3c.github.io/web-animations/

		if ($specSheet("title").text().trim() === "Redirecting...") {
			const redirect = $specSheet("body p a").attr()?.href;
			if (redirect) {
				await progress.console(
					`Redirecting from ${specSheet} to ${redirect}`,
				);
				$specSheet = await cheerio.fromURL(redirect);
			}
		}
		const thisSpecsInfo: SpecSheet = {
			authors: await getAuthors($specSheet, specSheet),
			editors: await getEditors($specSheet, specSheet), 
			date: await getDate($specSheet, specSheet), // Done
			thisSpecUrl: specSheet, // Done
			thisDocName: await getDocName($specSheet, specSheet),
			type: await getType($specSheet, specSheet), // Imre
			properties: await getProps($specSheet, specSheet), // Fred
			abstract: await getAbstract($specSheet, specSheet), // Done
		};

		// await progress.console("Finished Scraping: ", specSheet);

		allSpecInfo.push(thisSpecsInfo);
		// await progress.console(thisSpecsInfo);
	} catch (e) {
		let msg = "Unkown";
		//c atch erros but continue
		// Over engineered Error Logging

		if (typeof e === "string") {
			msg = e.toUpperCase(); // works, `e` narrowed to string
		} else if (e instanceof Error) {
			msg = e.message; // works, `e` narrowed to Error
		}
		// await progress.console(`${msg} --- ${specSheet}`);

		logError(`ERROR: ${msg}`, specSheet);
	}
	await progress.render(completed++, {
		title: `Errors: ${brokenLinks.length}`,
	});
	await Deno.writeTextFile(
		"./jsons/allSpecInfo.json",
		JSON.stringify(allSpecInfo, null, 2),
	);
};

const getAuthors = ($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called and not relevent
	if (!flags.focus.match("all|authors")) {
		return undefined;
	}
	return undefined;
};

const getEditors = ($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called and not relevent
	if (!flags.focus.match("all|editors")) {
		return undefined;
	}

	return undefined;
};

const getDate = async ($: cheerio.CheerioAPI, sheet: string) => {
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
//Finding docnames
const getDocName = ($: cheerio.CheerioAPI, sheet: string) => {
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

const getType = ($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called and not relevent
	if (!flags.focus.match("all|type")) {
		return undefined;
	}
	return undefined;
};

const getProps = ($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called and not relevent
	if (!flags.focus.match("all|props")) {
		return undefined;
	}
	return undefined;
};

const getAbstract = ($: cheerio.CheerioAPI, sheet: string) => {
	// Ignore if focus is called and not relevent
	if (!flags.focus.match("all|abstract")) {
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
            if(abstract){
                progress.console(`Flag 3: ${sheet}`)
            }
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

//Function we use to log erros and back up problem links
const logError = async (type: string, sheet: string) => {
	// Add to list of issues for Sheet if it already has a problem
	const found = brokenLinks.find((sheetObject: ErrorLink, index: number) => {
		if (sheetObject.sheet === sheet) {
			brokenLinks[index] = {
				types: [...brokenLinks[index].types, type],
				sheet: sheet,
			};
			return true; // stop searching
		}
	});

	if (!found) {
		//if not add a new link
		const issue: ErrorLink = {
			types: [type],
			sheet: sheet,
		};

		brokenLinks.push(issue);
	}

	await progress.console(`${type} FAILED FOR ${sheet}`);

	// Save Broken Links
	await Deno.writeTextFile(
		"./jsons/brokenSpecs.json",
		JSON.stringify(brokenLinks, null, 2),
	);
};

scrapeAll();
