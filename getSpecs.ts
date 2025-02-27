import * as cheerio from "npm:cheerio@^1.0.0";

// URL used to make links direct properly
const baseURL = "https://www.w3.org";

let specs: string[] = [];

const checkedHistory: string[] = [];

const getspecsFromList = async () => {
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

	console.log(specs.length);

	/// Write a JSON of the links
	await Deno.writeTextFile(
		`infos/AllSpecs.json`,
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

const checkforFile = (specs: string[], checkFile: string) => {
	return specs.some((url) => url == checkFile);
};

await getspecsFromList();

console.log(
	checkforFile(
		specs,
		"https://www.w3.org/TR/2022/WD-scroll-animations-1-20221025/",
	),
);
