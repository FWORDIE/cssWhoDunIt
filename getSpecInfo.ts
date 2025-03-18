// This function will scrape all the info from the spec sheets
// Our approach will be to run this unction itervaily and when it fails, fix the failure
// This is becuase spec sheets are differently formated

//NOTE Moved each function on file for collobrative reasons

import * as cheerio from "npm:cheerio@^1.0.0";
import {
	brokenLinks,
	specSheetLinkArray,
	testArray,
	logError,
} from "./scripts/basics.ts";
import type { ErrorLink, SpecSheet } from "./types.ts";
import ProgressBar from "jsr:@deno-library/progress";
import { delay } from "jsr:@std/async";
import { parseArgs } from "jsr:@std/cli/parse-args";
import { getAuthors } from "./scripts/getAuthors.ts";
import { getEditors } from "./scripts/getEditors.ts";
import { getDate } from "./scripts/getDate.ts";
import { getDocName } from "./scripts/getDocName.ts";
import { getType } from "./scripts/getType.ts";
import { getProps } from "./scripts/getProps.ts";
import { getAbstract } from "./scripts/getAbstract.ts";
import { getTerms } from "./scripts/getTerms.ts";

const allSpecInfo: SpecSheet[] = [];

// Get URLs of scrapped Spec Sheets
// See getSpecs.ts
let specs = specSheetLinkArray;

// General Set Up

export const flags = parseArgs(Deno.args, {
	string: ["force", "focus"],
	default: { force: "false", focus: "all" },
});

// Progress Bar Set Up
let completed = 0;
const title = "";
const total = specs.length;
export const progress = new ProgressBar({
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
			"all|authors|editors|date|url|name|type|props|abstract|terms",
		)
	) {
		await progress.console(`Unkown focus '${flags.focus}'`);
		await progress.console(
			'Focus must equalone of "all|authors|editors|date|url|name|type|props|abstract|terms" ',
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
	} else if (Deno.args[0] == "from") {
		// Run the a selction from all
		specs = specSheetLinkArray.slice(
			Deno.args[1] || 0,
			Deno.args[2] || specs.length - 1,
		);
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

	// Save all run links
	if (Deno.args[0] && !Deno.args[0].match("broken|spec")) {
		await Deno.writeTextFile(
			"./jsons/oldSpecs.json",
			JSON.stringify(specs, null, 2),
		);
	}

	// Loop to go over all Spec Urls
	for (const specSheet of specs) {
		//pause for for time out issues
		await delay(250);
		await getSpecInfo(specSheet);
	}

	await progress.console(`Sorting all finished Sheets`);

	allSpecInfo.sort(function (a, b) {
		// Turn your strings into dates, and then subtract them
		// to get a value that is either negative, positive, or zero.
		return new Date(b.date) - new Date(a.date);
	});
	await Deno.writeTextFile(
		"./jsons/allSpecInfo.json",
		JSON.stringify(allSpecInfo, null, 2),
	);

	await progress.console(
		`Finished with only ${brokenLinks.length} Specs Failing`,
	);
	await progress.render(completed++);
	await progress.complete;

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

const getSpecInfo = async (specSheet: string, atttempt2 = false) => {
	// await progress.console(`Scraping: ${specSheet}`);

	try {
		// add trailing slashes to ever url for consistencey
		if (
			specSheet[specSheet.length - 1] !== "/" &&
			specSheet.slice(specSheet.length - 4, specSheet.length) !==
				"html" &&
			!atttempt2
		) {
			specSheet += "/";
		}

		//Make a cheerio object from each url
		let $specSheet = await cheerio.fromURL(specSheet);

		//Deal with redirecting e.g. https://w3c.github.io/web-animations/

		if ($specSheet("title").text().trim() === "Redirecting...") {
			const redirect = $specSheet("body p a").attr()?.href;
			if (redirect) {
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
			properties: [...new Set(await getProps($specSheet, specSheet))], // Fred
			terms: await getTerms($specSheet, specSheet), // Fred
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

		if (msg == "Response status code 404: Not Found" && !atttempt2) {
			getSpecInfo(specSheet.slice(0, specSheet.length - 1), true);
		} else {
			logError(`ERROR: ${msg}`, specSheet);
		}
		// await progress.console(`${msg} --- ${specSheet}`);
	}
	await progress.render(completed++);

	await Deno.writeTextFile(
		"./jsons/allSpecInfo.json",
		JSON.stringify(allSpecInfo, null, 2),
	);
};

scrapeAll();
