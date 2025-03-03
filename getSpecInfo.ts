// This function will scrape all the info from the spec sheets
// Our approach will be to run this unction itervaily and when it fails, fix the failure
// This is becuase spec sheets are differently formated

import { specSheetLinkArray } from "./basics.ts";
import type { SpecSheet } from "./types.ts";



const getSpecInfo = (specsSheet: string) => {
	let thisSpecsInfo: SpecSheet = {
		authors: null,
		date: null, //done
		thisSpecUrl: specsSheet, //done
		thisDocName: null,
		type: "Unknown", //done
		properties: [],
		abstract: null,
	};
};

const scrapeAll = () => {
	for (const specSheet of specSheetLinkArray) {
		console.log(specSheet);
	}
};

scrapeAll()
