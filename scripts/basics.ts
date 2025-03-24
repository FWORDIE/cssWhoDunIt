// These are used when we run out of CSS3 Draft Links Module Links to explore
// e.g. We run out of previous versions of a property to explore,
// therefore it must be part of CSS2.1. If the property is still present in all
// the 2.1 drafts then it must be in 2 etc

import type { ErrorLink } from "../types.ts";
import { flags } from "../getSpecInfo.ts";
import { progress } from "../getSpecInfo.ts";

export const CSSDrafts = [
	"https://www.w3.org/TR/CSS1/",
	"https://www.w3.org/TR/2008/REC-CSS2-20080411/",
	"https://www.w3.org/TR/CSS2/",
];

export const specSheetLinkArray = JSON.parse(
	await Deno.readTextFile("./jsons/AllSpecs.json"),
);

export const testArray = (num = 10) => {
	const shuffled = [...specSheetLinkArray].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, num);
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const brokenLinks: ErrorLink[] = [];

export const ignore = async (focus: string, sheet: string) => {
	// Ignore if focus is called and not relevent
	if (!flags.focus.match(`all|${focus}`)) {
		return true;
	}

	// Ignore if type is known broken for thing
	const linksThatAreMissing = JSON.parse(
		await Deno.readTextFile("./jsons/missing.json"),
	)[focus];

	if (linksThatAreMissing && linksThatAreMissing.length > 0) {
		return linksThatAreMissing.some((link: string) => {
			return link == sheet;
		});
	}

	return false;
};

//Function we use to log erros and back up problem links
export const logError = async (type: string, sheet: string) => {
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

	await progress.console(`${type} FAILED FOR ${sheet}                      `);

	// Save Broken Links
	await Deno.writeTextFile(
		"./jsons/brokenSpecs.json",
		JSON.stringify(brokenLinks, null, 2),
	);
};

export const compileList = (array: any[], items: any[]) => {
	for (let item of items) {
		let index = array.findIndex((currentItem) => currentItem.item === item);
		if (index == -1) {
			array.push({
				item: item,
				num: 1,
			});
		} else {
			array[index].num++;
		}
	}
};

export const orgTable = [
	[
		"Google",
		"Google Inc",
		"GoogleInc.",
		"Chromium.org",
		"Google Inc.",
		"Google.com",
	],
	["Invited Expert"],
	["Apple", "Apple Inc", "Apple.com", "Apple Inc."],
	["Bloomberg", "On behalf of Bloomberg"],
	["Mozilla", "Mozilla Foundation", "Mozilla Japan"],
	["Microsoft", "Microsoft Corporation", "Microsoft.com"],
	["W3C", "W3", "W3.org"],
	["Opera Software", "opera", "Opera Software ASA", "Opera.com"],
	[
		"Adobe",
		"Adobe Systems",
		"Adobe SystemsInc.",
		"Adobe Inc.",
		"Adobe Systems Inc",
		"Adobe SystemsInc",
		"Adobe Inc",
		"Adobe Systems Inc.",
		"Then of Adobe Systems Inc.",
	],
	["Netscape/AOL", "Netscape Communications"],
	["Igalia"],
	["Stanford", "stanford", "Cs.stanford.edu"],
	["Hewlett-Packard", "Boi.hp.com","HP"],
];
