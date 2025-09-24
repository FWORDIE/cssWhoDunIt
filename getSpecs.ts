// This script grabs all the spec sheets and drafts

import { delay } from "jsr:@std/async/delay";
import * as cheerio from "npm:cheerio@^1.0.0";
import { specSheetLinkArray } from "./scripts/basics.ts";
// import { delay } from "./scripts/basics.ts";

// URL used to make links direct properly
const baseURL = "https://www.w3.org";

let specs: string[] = [];

const checkedHistory: string[] = [];

const getSpecsFromList = async () => {
	console.log("Starting Scrape");

	//Grab W3C standards and drafts
	const $ = await cheerio.fromURL(
		`https://www.w3.org/TR/?filter-tr-name=&status[]=draftStandard&status[]=candidateStandard&status[]=standard&tags[]=css`,
	);

	// Get all list elements on first page
	const $listItems = $(".tr-list__item");

	// Loop over each
	// This is the equivolent of:
	// for (let x = 0; x < $listItems.length; x++)
	for (const element of $listItems) {
		// Find the name of the deliverer
		// This finds the element with text 'Deliverers'
		// and then goes to the next Element in the DOM, the text we want
		// This text tells us which working group was invloved, and we can
		// ignore anything that isn't the CSS working group
		const Deliverers = $(element)
			.find("dt:contains('Deliverers')")
			.next()
			.text();

		// We check if it is a CSS Group
		// Otherwise we ignore it
		if (Deliverers == "Cascading Style Sheets (CSS) Working Group") {
			//We find the main link to the spec
			const mainLink = $(element)
				.find(".tr-list__item__header h3 a")
				.attr()?.href;
			if (mainLink) {
				// we add this link to the master doc array
				specs.push(mainLink);
			}

			//We find the history link to the spec
			const historyURL = $(element)
				.find("a:contains('history')")
				.attr()?.href;
			if (historyURL) {
				//added it to checked links array
				checkedHistory.push(historyURL);
				//We send this to a recusive function that grabs links from history
				await searchHistory(baseURL + historyURL);
			}
		}
	}

	// Use the set trick to rmeove duplicates
	specs = [...new Set(specs)];

	console.log(`Found ${specs.length} Spec Sheets from first scrape`);

	specs = await getEditorDrafs(specs);

	// filters out on dupe
	specs = specs.filter((spec: string) => {
		return !spec.includes("/fonts.html");
	});

	specs = specs.filter((spec: string) => {
		return !spec.includes("/fonts.html");
	});

	// filters out on dupe
	specs = specs.filter((spec: string) => {
		return !spec.includes("//dvcs.w3.org/");
	});

	// filters out on dupe
	specs = specs.filter((spec: string) => {
		return !spec.includes("drafts.fxtf.org/web-animations/");
	});

		// filters out on dupe
		specs = specs.filter((spec: string) => {
			return !spec.includes("dev.w3.org/fxtf/web-animations/");
		});

	console.log(`Found ${specs.length} Spec Sheets after second scrape!`);

	console.log("Saving Scraped sheet urls");

	/// Write a JSON of the links
	await Deno.writeTextFile(
		`./jsons/AllSpecs.json`,
		JSON.stringify(specs, null, 2),
	);
};

const searchHistory = async (historyLink: string) => {
	// Make new Cheerio thing for history page
	const $$ = await cheerio.fromURL(historyLink);

	// Find History table and its rows
	const $tableElements = $$("table").find("td a");

	// on each row of the table
	// This is the equivolent of:
	// for (let x = 0; x < $tableElements.length; x++)
	for (const element of $tableElements) {
		// grab each link from table row
		const doc = $$(element).attr()?.href;
		if (doc) {
			specs.push(doc);
		}
	}

	// find the related section and its children
	// This finds the element with ID 'related-lable'
	// and then goes to the next Element in the DOM, the table we want
	const $moreSection = $$("#related-label").next().find("li a");

	//for each child
	// This is the equivolent of:
	// for (let x = 0; x < $moreSection.length; x++)
	for (const element of $moreSection) {
		// grab its link
		const historyURL = $$(element).attr()?.href;

		// check if we have already searched it by searching checkedHistory Array
		// check if link is valid
		if (
			!checkedHistory.some((url) => {
				return url == historyURL;
			}) &&
			historyURL
		) {
			//added it to checked links array
			checkedHistory.push(historyURL);

			//check its history
			await searchHistory(baseURL + historyURL);
		}
	}
};

// This function gets all the editors drafts from the main specs
const getEditorDrafs = async (specs: string[]) => {
	console.log("Scraping for editor drafts");

	let newSpecLinks: string[] = [];

	// used for debuggin
	let brokenLinks: string[] = [];

	for (const spec of specs) {
		// this adds a pause between our calls
		// due to getting 'Too Many Request' errors
		await delay(200);

		// we use try her incase we get errors
		try {
			// grabing the page with cheerio
			let $ = await cheerio.fromURL(spec);

			// here we try many ways to get the editor links
			let editorLink = $(`dt:contains("Editor's")`)
				.next()
				.find("a")
				.attr()?.href;
			if (!editorLink) {
				editorLink = $(`dt:contains("Editor’s")`)
					.next()
					.find("a")
					.attr()?.href;
			}
			if (!editorLink) {
				editorLink = $(`dt:contains("editor's")`)
					.next()
					.find("a")
					.attr()?.href;
			}
			if (!editorLink) {
				editorLink = $(`dt:contains("Editors draft")`)
					.next()
					.find("a")
					.attr()?.href;
			}
			if (!editorLink) {
				editorLink = $(`dt:contains("Editors' draft")`)
					.next()
					.find("a")
					.attr()?.href;
			}
			if (!editorLink) {
				editorLink = $(`dt:contains("Latest Editor Version")`)
					.next()
					.find("a")
					.attr()?.href;
			}
			if (!editorLink) {
				editorLink = $(`dt:contains("Latest Editor Draft")`)
					.next()
					.find("a")
					.attr()?.href;
			}
			if (!editorLink) {
				editorLink = $(`dt:contains("Editors Draft")`)
					.next()
					.find("a")
					.attr()?.href;
			}

			if (!editorLink) {
				// if we still don't get the editors link, it means
				// the spec doesn't have one
				// or the spec refrences it in a weird way
				// hence we add it to an array so we can debug

				brokenLinks.push(spec);
			} else {
				//if we do have a link we add it to an array
				newSpecLinks.push(editorLink);
			}
		} catch (e: any) {
			// Log any errors we get
			// but then continue
			console.log(e.message);
		}
	}

	// here we add the new editor draft links to the main spec array
	specs = [...new Set([...specs, ...newSpecLinks])];

	//  write file of broken? specs, for debugging
	await Deno.writeTextFile(
		"./brokenSpecs.json",
		JSON.stringify(brokenLinks, null, 2),
	);

	//return all specs
	return specs;
};

await getSpecsFromList();

// Small function to check if a certain Spec has been found
const checkforSpec = (specs: string[], checkSpec: string) => {
	if (specs.some((url) => url == checkSpec)) {
		return "Test Passed!";
	} else {
		return "Test Failed!";
	}
};

console.log(
	checkforSpec(
		specs,
		"https://www.w3.org/TR/2022/WD-scroll-animations-1-20221025/",
	),
);
