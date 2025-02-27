import * as cheerio from "npm:cheerio@^1.0.0";
import moment from "npm:moment";
import type { Authors, CssProperty, History } from "./types.ts";
import { CSSDrafts } from "./basics.ts";

const property = "margin";
let propertyInfo: CssProperty = {
	name: property,
	history: [],
	mdnLink: `https://developer.mozilla.org/en-US/docs/Web/CSS/${property}`,
	about: "await getAboutfromMDN(property)",
};

let searches: string[] = [];

// UPDATE:
// We changed approach and are now grabbing all docs first
// We will then search for all properties in these
// See getSpecs.ts

// PLAN:
// Create an array of the history of Each CSS property (See Type
// CssProperty and History for details) This list can then be sorted by date and
// create a history of each property Can be used for A, a add-on, e.g. this site
// was designed by Erik from Google Or B, an api that others can add to or use
// for their own projects

const getFromMDN = async (property: string) => {
	//This block trys stuff, and if it fails it tells us why hopefully
	try {
		//Grab CSS info from Moz with Cheerio
		const $ = await cheerio.fromURL(
			`https://developer.mozilla.org/en-US/docs/Web/CSS/${property}`,
		);

		//Find Spec Table
		const specTable = $(".standard-table").find("a");

		let arrayOfSpecs = [];

		//Loop Spec Table to find all spec sheets
		for (let x = 0; x < specTable.length; x++) {
			arrayOfSpecs.push(specTable[x].attribs.href);
		}

		return arrayOfSpecs;
	} catch (e) {
		// Over engineered Error Logging
		if (typeof e === "string") {
			console.log(e.toUpperCase()); // works, `e` narrowed to string
		} else if (e instanceof Error) {
			console.log(e.message); // works, `e` narrowed to Error
		}

		//Returns Empty array if fails
		return [];
	}
};

const scrapeSpecSheet = async (sheet: string, property: string) => {
	// This function will scrape all our Specs
	console.log("Started Scrapping: ", sheet);

	// Add this top a list of spec sheet urls
	// This way we don't do the same sheet twice
	searches.push(sheet);

	const sheetHTML = await cheerio.fromURL(sheet);

	// IDEA: We Could try and look for a fingerprint for each doc type so we can
	// pass that as an arguemnt for scrapping

	// Is the css property refrenced in this sheet
	const isPresentandType = checkIfPresentandType(sheetHTML, property, sheet);

	//If property is present scrape info
	if (isPresentandType.isPresent) {
		//Add scraped info to its History Array
		let thisSpecsInfo = await getCSSInfo(
			sheetHTML,
			isPresentandType.type,
			sheet,
		);

		// console.log(thisSpecsInfo);
		//Ignore Type error will be fixed in future
		propertyInfo.history.push(thisSpecsInfo);

		//Here we check if the doc had previous specs mentioned
		if (thisSpecsInfo.previousSpecUrls.length > 0) {
			// Now we run this functional recersively for all those docs HERE
			// loop through previous spec sheets
			// in the loop run this fucntion again
			for (let x = 0; x < thisSpecsInfo.previousSpecUrls.length; x++) {
				const thisSpec = thisSpecsInfo.previousSpecUrls[x];

				// Check if this sheet has been searched
				const alreadySerched = searches.some((specUrl) => {
					return specUrl == thisSpec;
				});

				if (!alreadySerched) {
					await scrapeSpecSheet(
						thisSpecsInfo.previousSpecUrls[x],
						property,
					);
				} else {
					console.log(
						"This sheet has lready been serached:",
						thisSpec,
					);
				}
			}
		} else {
			// If no Specs are refrence but the property was present, we check
			// the process again with CSS2.1 This needs to also handle CSS2 and
			// CSS1 And handle when it is an orginal Properrty
		}
	} else {
	}
	// This code will recussively dig into the spec sheets till the property is
	// not present

	// If not return
	return;
};

const getCSSInfo = (
	sheetHTML: cheerio.CheerioAPI,
	type: string | null,
	sheet: string,
) => {
	// console.log("Getting CSS Spec Info for type ", type);
	let thisSpecsInfo: History = {
		authors: null,
		date: null, //done
		thisSpecUrl: sheet, //done
		thisDocName: null,
		type: "Unknown", //done
		previousSpecUrls: [],
	};

	// Below here are is all the document scrapping

	switch (type) {
		case "A": {
			// find date (may not work)
			let date = sheetHTML(".head").find("time").text();
			let formatedDate = moment(date, "DD MMMM YYYY").format();
			if (formatedDate) {
				thisSpecsInfo.date = formatedDate;
			} else {
				thisSpecsInfo.date = null;
				console.log("Error Finding data for: ", sheet);
			}

			// find type of doc
			let docType = sheetHTML("#w3c-state").find("a").text();
			docType = docType.trim();
			if (docType) {
				thisSpecsInfo.type = docType;
			} else {
				console.log("Error Finding doc type for: ", sheet);
				thisSpecsInfo.type = "Unknown";
			}

			// find doc name
			const docName = sheetHTML("#title").text();
			if (docName) {
				thisSpecsInfo.thisDocName = docName;
			} else {
				thisSpecsInfo.thisDocName = null;
				console.log("Error Finding name for: ", sheet);
			}

			// find authors
			const allAuthors = sheetHTML("body").find(".editor");
			const authors: Authors[] = [];

			// loop through all the tags with author class
			for (let x = 0; x < allAuthors.length; x++) {
				const innerText = allAuthors[x].children[0].data;

				// stop when one is found with Former Editor String
				if (
					(innerText && innerText.trim() === "Former Editor:") ||
					(innerText && innerText.trim() === "Former Editors:")
				) {
					break;
				}

				//scrape author info
				if (!innerText) {
					const author = allAuthors[x].children[0].children[0].data;
					const org = allAuthors[x].children[2].children[0].data;
					const link = allAuthors[x].children[0].attribs.href;
					authors.push({
						name: author,
						org: org,
						type: "Editor",
						link: link,
					});
				}
			}

			// check we found somethin
			if (authors.length > 0) {
				thisSpecsInfo.authors = authors;
			} else {
				thisSpecsInfo.authors = null;
				console.log("Error Finding authors for: ", sheet);
			}

			// LAst one woop woop
			// find previous spec sheets
			const previousVersionsArray: string[] = [];

			// find latest published verison
			const lastestPub = sheetHTML(".head")
				.find("dt:contains('Latest published version:')")
				.next()
				.text();
			if (lastestPub) {
				previousVersionsArray.push(lastestPub.trim());
			}

			// find previous published versions
			const allPreviousVersions = sheetHTML(".head").find("[rel='prev']");

			//loop through all to find their links
			for (let x = 0; x < allPreviousVersions.length; x++) {
				const link = allPreviousVersions[x].children[0].data;
				if (link) {
					previousVersionsArray.push(link.trim());
				}
			}

			if (previousVersionsArray.length > 0) {
				// remove duplicates
				thisSpecsInfo.previousSpecUrls = [
					...new Set(previousVersionsArray),
				];
			} else {
				// Is this whewre we shopuld add links to css2.1/2/1
				thisSpecsInfo.previousSpecUrls = [];
			}

			// console.log(allPreviousVersions)
			break;
		}
		case "B": {
			console.log("type B");
			break;
		}
		default:
			break;
	}

	//Returns the Doc info it finds
	return thisSpecsInfo;
};

const checkIfPresentandType = (
	sheetHTML: cheerio.CheerioAPI,
	property: string,
	sheet: string,
) => {
	// This function will check if a css properrty is mentiond in a Doc Will
	// have to be added to as more types of Doc are found

	let isPresent = false;

	// This Works for doc type: https://drafts.csswg.org/css-backgrounds/#index

	// Find title for section of the Index listed properties
	const indexTitle = sheetHTML("#index-defined-here");

	// Continually checks if we are finding these elements
	if (indexTitle) {
		const indexSection = indexTitle.next();
		if (indexSection) {
			// Finds index of attributes and turn it into an array Also convert
			// it into an Array
			let index = [...indexSection.find("li a")];
			isPresent = index.some((elm: any) => {
				return elm.children[0].data == property;
			});
			//Double check for things that aren't links
			//e.g. margin in https://drafts.csswg.org/css-box/#margin

			if (!isPresent) {
				let indexNew = [...indexSection.find("li")];
				isPresent = indexNew.some((elm: any) => {
					if (elm.children[0].data) {
						return elm.children[0].data.trim() == property;
					}
				});
			}
		}
	}

	// Bellow here we can try another check for other doc formats

	// Check if property is present
	if (isPresent) {
		return { isPresent: true, type: "A" };
	}
	console.log("Property not present in ", sheet);
	return { isPresent: false, type: null };
};

const getAboutfromMDN = (property: string) => {
	// This will grab info about a property from MDN
	return "we will write this function later";
};

const init = async (property: string) => {
	console.log("Working on: ", property);

	// Initial Look up from MDN
	const intialArrayOfSpecs = await getFromMDN(property);

	console.log("Got thse Spec Sheets from MDN: ", intialArrayOfSpecs);

	// Exit if array of specs is 0
	if (intialArrayOfSpecs.length == 0) {
		console.log("No Spec Sheets from MDN Found");
		return;
	}

	// Loop Spec sheets to find spec info
	for (let x = 0; x < intialArrayOfSpecs.length; x++) {
		await scrapeSpecSheet(intialArrayOfSpecs[x], property);
	}

	//TODO: After we have all the specs, we can order by date to get the origin
	//spec of each property

	console.log("DONE!!!");
	console.log(
		`It's history is ${propertyInfo.history.length} Spec sheets long`,
	);
	await Deno.writeTextFile(
		`infos/${property}-Info.json`,
		JSON.stringify(propertyInfo),
	);
};

// This can be run on every property from a list/array Complied to a an array of
// CssProperty Objects and their History Arrays IDEA: This can be used to do
// various things. E.g. mabye it makes more sense to just have a list of specs
// sorted by date that mention the css properties mentioned
init(property);
