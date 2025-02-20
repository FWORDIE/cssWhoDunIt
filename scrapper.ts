import * as cheerio from "npm:cheerio@^1.0.0";
import moment from "npm:moment";
import type { CssProperty, History } from "./type.ts";
import cssFiles from "./basics.ts";

let property = "border";
let cssInfoArray: CssInfo[] = [];

// PLAN:
// Create an array of the history of Each CSS property (See Type CssProperty and History for details)
// This list can then be sorted by date and create a history of each property
// Can be used for A, a add-on, e.g. this site was designed by Erik from Google
// Or B, an api that others can add to or use for their own projects

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
	} catch (e: any) {
		console.log(e.message);
		return [];
	}
};

const scrapeSpecSheet = async (sheet: string, property: string) => {
	console.log("SCRAPPING: ", sheet);

	const sheetHTML = await cheerio.fromURL(sheet);

	//is the css property refrenced in this sheet
	const isPresent = checkIfPresent(sheetHTML, property);

	if (isPresent) {
		let tempCssInfo = await getCSSInfo(sheetHTML);

		// if(tempCssInfo.previousSpecUrls.length > 0){

		// }
	}

	return true;
};

const getCSSInfo = async (sheetHTML: cheerio.CheerioAPI) => {
	let thisCssInfo: History = {
		authors: null,
		date: null,
		thisSpecUrl: null,
		about: null,
		previousSpecUrls: null,
	};

	//find date (may not work)
	let date = sheetHTML(".head").find("time").text();
	let formatedDate = moment(date, "DD MMMM YYYY").format();
	console.log(formatedDate);

	thisCssInfo.date = formatedDate || null;
};

const checkIfPresent = (sheetHTML: any, property: string) => {
	// This function will check if a css properrty is mentiond in a Doc
	// Will have to be added to as more types of Doc are found

	let isPresent = false;

	// This Works for doc type: https://drafts.csswg.org/css-backgrounds/#index

	// Find title for section of the Index listed properties
	const indexTitle = sheetHTML("#index-defined-here");

	// Continually checks if we are finding these elements
	if (indexTitle) {
		const indexSection = indexTitle.next();
		if (indexSection) {
			// Finds index of attributes and turn it into an array
			// Also convert it into an Array
			let index = [...indexTitle.find("li a")];
			isPresent = index.some((elm: any) => {
				return elm.children[0].data == property;
			});
		}
	}

	// Bellow here we can try another check for other doc formats

	// Check if property is present
	if (isPresent) {
		return true;
	}

	return false;
};

const getAboutfromMDN = (property) => {
	// This will grab info about a property from MDN
	return "we will write this function later";
};

const init = async (property: string) => {
	let propertyInfo: CssProperty = {
		name: property,
		history: [],
		mdnLink: `https://developer.mozilla.org/en-US/docs/Web/CSS/${property}`,
		about: await getAboutfromMDN(property),
	};

	console.log("Working on: ", property);

	// Initial Look up from MDN
	let intialArrayOfSpecs = await getFromMDN(property);
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
};

init(property);
