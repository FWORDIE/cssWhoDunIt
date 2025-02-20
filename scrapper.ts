import * as cheerio from "npm:cheerio@^1.0.0";
import moment from "npm:moment";
import type { CssProperty, History } from "./types.ts";
import { CSSDrafts } from "./basics.ts";

const property = "border";
let propertyInfo: CssProperty = {
	name: property,
	history: [],
	mdnLink: `https://developer.mozilla.org/en-US/docs/Web/CSS/${property}`,
	about: "await getAboutfromMDN(property)",
};

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

	const sheetHTML = await cheerio.fromURL(sheet);

	// IDEA: We Could try and look for a fingerprint for each doc type so we can pass that as an arguemnt for scrapping

	// Is the css property refrenced in this sheet
	const isPresent = checkIfPresent(sheetHTML, property);

	//If property is present scrape info
	if (isPresent) {
		//Add scraped info to its History Array
		let thisSpecsInfo = await getCSSInfo(sheetHTML);

		//Ignore Type error will be fixed in future
		propertyInfo.history.push(thisSpecsInfo);

		//Here we check if the doc had previous specs mentioned
		if (thisSpecsInfo.previousSpecUrls.length > 0) {
			// Now we run this functional recersively for all those docs
			// HERE IMRE WILL WRITE A FOR LOOP TO DO THIS
		} else {
			// If no Specs are refrence but the property was present, we check the process again with CSS2.1
			// This needs to also handle CSS2 and CSS1
			// And handle when it is an orginal Properrty
		}
	}
	// This code will recussively dig into the spec sheets till the property is not present

	// If not return
	return;
};

const getCSSInfo = (sheetHTML: cheerio.CheerioAPI) => {

	let thisSpecsInfo: History = {
		authors: null,
		date: null,
		thisSpecUrl: null,
		thisDocName: null,
		type: "Unkown",
		previousSpecUrls: [],
	};

	// Below here are is all the document scrapping

	//find date (may not work)
	let date = sheetHTML(".head").find("time").text();
	let formatedDate = moment(date, "DD MMMM YYYY").format();
	console.log(formatedDate);

	thisSpecsInfo.date = formatedDate || null;

	//Returns the Doc info it finds
	return thisSpecsInfo
};

const checkIfPresent = (sheetHTML: cheerio.CheerioAPI, property: string) => {
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
			let index = [...indexSection.find("li a")];
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

const getAboutfromMDN = (property:string) => {
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
};

init(property);
