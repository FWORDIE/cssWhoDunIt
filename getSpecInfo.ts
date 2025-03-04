// This function will scrape all the info from the spec sheets
// Our approach will be to run this unction itervaily and when it fails, fix the failure
// This is becuase spec sheets are differently formated

import * as cheerio from "npm:cheerio@^1.0.0";
import { specSheetLinkArray, testArray } from "./basics.ts";
import type { ErrorLink, SpecSheet } from "./types.ts";
import moment from "npm:moment";

let brokenLinks: ErrorLink[] = [];

let allSpecInfo: SpecSheet[] = [];

const getSpecInfo = async (specSheet: string) => {
	console.log("Scraping: ", specSheet);
	try {
		//Make a cheerio object from each url
		const $specSheet = await cheerio.fromURL(specSheet);

		let thisSpecsInfo: SpecSheet = {
			authors: await getAuthors($specSheet, specSheet),
			editors: await getEditors($specSheet, specSheet),
			date: await getDate($specSheet, specSheet),
			thisSpecUrl: specSheet,
			thisDocName: await getDocName($specSheet, specSheet),
			type: await getType($specSheet, specSheet),
			properties: await getProps($specSheet, specSheet),
			abstract: await getAbstract($specSheet, specSheet),
		};

		console.log("Finished Scraping: ", specSheet);

		allSpecInfo.push(thisSpecsInfo);
		// console.log(thisSpecsInfo);
	} catch (e: any) {
		//catch erros but continue
		console.log(e.message, " --- ", specSheet);
		brokenLinks.push({ type: "ERROR ERROR", sheet: specSheet });
	}
	await Deno.writeTextFile(
		"./jsons/allSpecInfo.json",
		JSON.stringify(allSpecInfo, null, 2),
	);
};

const getAuthors = ($: cheerio.CheerioAPI, sheet: string) => {

    
	return undefined;
};

const getEditors = ($: cheerio.CheerioAPI, sheet: string) => {
	return undefined;
};

const getDate = ($: cheerio.CheerioAPI, sheet: string) => {
	try {
		// find date with time tag
		let date = $(".head").find("time").text();
		let formatedDate = moment(date, "DD MMMM YYYY").format();
		if (formatedDate && formatedDate != "Invalid date") {
			// console.log(formatedDate);
			return formatedDate;
		}

		// For no time tag
		let thisVersion = $(".head")
			.find("dt:contains('This version:')")
			.next()
			.find("a")
			.attr()?.href;

		// Alt Spelling
		if (!thisVersion) {
			thisVersion = $(".head")
				.find("dt:contains('This Version:')")
				.next()
				.find("a")
				.attr()?.href;
		}

		if (thisVersion) {
			// Deals with trailig slashes at the end of URLs
			let change = thisVersion[thisVersion.length - 1] === "/" ? 1 : 0;

			date = thisVersion.slice(
				thisVersion.length - (8 + change),
				thisVersion.length - change,
			);

			formatedDate = moment(date, "YYYYMMDD").format();

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

const getDocName = ($: cheerio.CheerioAPI, sheet: string) => {
	return undefined;
};

const getType = ($: cheerio.CheerioAPI, sheet: string) => {
	return undefined;
};

const getProps = ($: cheerio.CheerioAPI, sheet: string) => {
	return [];
};

const getAbstract = ($: cheerio.CheerioAPI, sheet: string) => {
	try {
		let abstract = $('[data-fill-with="abstract"]').find("p").text().trim();

		if (!abstract) {
			abstract = $("#abstract").next().text().trim();
		}
		if (!abstract) {
			abstract = $("#Abstract").next().text().trim();
		}
		if (!abstract) {
			abstract = $("#Abstract").parent().next().text().trim();
		}
		if (!abstract) {
			abstract = $('[name="abstract"]').parent().next().text().trim();
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

const logError = (type: string, sheet: string) => {
	const issue: ErrorLink = {
		type: type,
		sheet: sheet,
	};

	brokenLinks.push(issue);
	console.log(`${type} FAILED FOR ${sheet}`);
};

const scrapeAll = async () => {
	let specs = specSheetLinkArray;

	if (Deno.args[0] == "test") {
		specs = testArray(Number(Deno.args[1]) || 10);
		console.log(`Running ${specs.length} test sheets`);
	} else if (Deno.args[0] == "spec") {
		specs = [Deno.args[1]];
		console.log(`Running just ${Deno.args[1]} test sheets`);
	} else if (Deno.args[0] == "old") {
		specs = JSON.parse(await Deno.readTextFile("./jsons/oldSpecs.json"));
		console.log(`Running ${specs.length} old specs sheets`);
	} else if (Deno.args[0] == "broken") {
		specs = JSON.parse(
			await Deno.readTextFile("./jsons/brokenSpecs.json"),
		).map(function (el: ErrorLink) {
			return el.sheet;
		});
		console.log(`Running ${specs.length} broken specs sheets`);
	} else {
		console.log(`Running all ${specs.length} sheets`);
	}

	for (const specSheet of specs) {
		await getSpecInfo(specSheet);
	}

	console.log(`Finished with only ${brokenLinks.length} Specs Failing`);

	// Save Broken Links
	await Deno.writeTextFile(
		"./jsons/brokenSpecs.json",
		JSON.stringify(brokenLinks, null, 2),
	);

	// Save all run links
	if (Deno.args[0] != "broken") {
		await Deno.writeTextFile(
			"./jsons/oldSpecs.json",
			JSON.stringify(specs, null, 2),
		);
	}

	//Function that removes the working urls
};

scrapeAll();
