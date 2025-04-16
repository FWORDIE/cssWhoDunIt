//Takes the data and formats it as an output for a dot matrix printer

import { SpecSheet } from "./types.ts";
import moment from "npm:moment";

const chrLimit = 96;
let string = "";
const forPrint = true;
let lastDate = '';

let orgList: {
	name: string;
	num: number;
}[] = [];
let nameList: {
	name: string;
	num: number;
}[] = [];

// Special Commands for IBM Proline
const lineBreakReturn = String.fromCharCode(10);
const returnChr = String.fromCharCode(13);
const half = String.fromCharCode(27, 60);
const fast = String.fromCharCode(27, 62);
const italic = String.fromCharCode(27, 37, 71);
const underline = String.fromCharCode(27, 45, 49);
const normal =
	String.fromCharCode(27, 45, 48) +
	String.fromCharCode(27, 37, 72) +
	String.fromCharCode(27, 84); // No underline + no italics + np super/sub Script
const gothic = String.fromCharCode(27, 49);
const courir = String.fromCharCode(27, 51);
const utility = String.fromCharCode(27, 48);
const superscript = String.fromCharCode(27, 83, 48);
const popSpacing = String.fromCharCode(27, 80, 49);
const noPopSpacing = String.fromCharCode(27, 80, 48);
const overscore = String.fromCharCode(27, 95, 49);
const noOverscore = String.fromCharCode(27, 95, 48);

// Set Spacing to n/72"
const setLineHeight =
	String.fromCharCode(27, 65, 15) + " " + String.fromCharCode(27, 50);
const setSize = String.fromCharCode(27, 58);

type SpecialChrs = {
	bold: { value: string; key: string };
	normal: { value: string; key: string };
	italic: { value: string; key: string };
	misc: { value: string; key: string };
};

// Sets line height
const setLineHeightFunc = (number = 15) => {
	return String.fromCharCode(27, 65, number) + String.fromCharCode(27, 50);
};

let specialChrs = {
	bold: { key: "≐", value: underline },
	normal: {
		key: "≑",
		value: normal,
	},
	italic: { key: "≒", value: italic },
	misc: { key: "≓", value: superscript },
};

//  specialChrs = {
// 	bold: { key: "", value: "" },
// 	normal: { key: "", value: "" },
// 	italic: { key: "", value: "" },
// 	misc: { key: "", value: "" },
// };

// String Reset Area
string +=
	setLineHeight +
	" " +
	normal +
	" " +
	noPopSpacing +
	" " +
	noOverscore +
	"" +
	lineBreakReturn;

//Takes the JSON file filled with all the data and turns it into an array of objects
let specSheetInfoArray = JSON.parse(
	await Deno.readTextFile("jsons/AllSpecInfo.json"),
);

// Slice the sheet
specSheetInfoArray = specSheetInfoArray.reverse().slice(50, 60);

// Works out length without specail characters
const lengthWithOut = (string: string) => {
	let tempString = string;

	for (const chr in specialChrs) {
		//@ts-ignore
		tempString = tempString.replaceAll(specialChrs[chr].key, "");
	}

	return tempString.length;
};

// Makes left/right lines
function makeLine(left: string, right: string) {
	const centerLength = chrLimit - lengthWithOut(left) - lengthWithOut(right);

	let center = "";

	for (let i = 0; i < centerLength; i++) {
		center += " ";
	}

	let line = left + center + right;

	line = line.trim();

	return line + "\n";
}

// Centers text
function centerText(string: string) {
	const centerPoint = (chrLimit - lengthWithOut(string)) / 2;
	let center = "";
	for (let i = 0; i < centerPoint; i++) {
		center += " ";
	}
	center += string;
	return center;
}

// Justifys text
function breakItDown(string: string) {
	let returnString = "";

	let count = 0;

	//break down string into words on spaces
	let words = string.split(" ");

	//loop over each word
	words.forEach((word, i) => {
		// check if it will go over line count
		if (word.length + count + 2 > chrLimit) {
			// break line
			returnString += "\n";
			// add  word
			returnString += word;
			// reset count
			count = 0;
		} else {
			// add word
			returnString += word;
		}

		// add word length to count
		count += word.length;

		// add punctation if not lst or first words
		if (
			i != 0 &&
			i != 1 &&
			i != words.length - 1 &&
			i != words.length - 2
		) {
			returnString += ", ";
			count += 2;
		} else if (i == 0 || i == 1) {
			returnString += " ";
			count += 1;
		}
	});

	// return string
	return returnString;
}

// Adds and returns ocunt
const addToList = (array: any[], item: string | null) => {
	if (item) {
		let index = array.findIndex((currentItem) => currentItem.item === item);
		if (index == -1) {
			array.push({
				item: item,
				num: 1,
			});
			return "First Ever Contribution";
		} else {
			array[index].num++;
			//TODO: IS THIS THE RIGHT VERBIAGE
			return array[index].num + " Contributions So Far";
		}
	}
	return "NaN";
};

const genTable = ()=> {
	let tempString = ''
	const title = specialChrs.bold.key + 'The Influencer Charts' 
	const date = specialChrs.italic.key + lastDate;
	tempString += centerText(title)
	tempString += centerText(date)
	tempString += '\n'
	nameList = nameList.sort((a, b) => b.num - a.num);
	orgList = orgList.sort((a, b) => b.num - a.num);
	console.log(nameList, orgList)

	
}

//loop through specSheetInfoArray to add it all together in a string
for (let i = 0; i < specSheetInfoArray.length; i++) {
	//this is the sting we add the specs to and return
	const item: SpecSheet = specSheetInfoArray[i];
	//the loop after this goes through item author to seperate it into names and orgs
	//and because the string is declared before now we can add them to it
	const formatedDate = moment(item.date).format("DD/MM/YYYY");

	lastDate = formatedDate

	// Here we center the text and also add special characters to command the printer
	string += centerText(specialChrs.bold.key + formatedDate);

	// set the text to normal
	string += specialChrs.normal.key;

	// line break
	string += "\n";
	string += "\n";

	//Add Name
	const docName =
		specialChrs.bold.key +
		(item.thisDocName?.trim() || "Name Unknown") +
		specialChrs.normal.key;

	// Add Type
	const type =
		specialChrs.italic.key +
		(item.type?.trim() || "Unkown Type") +
		specialChrs.normal.key;

	// make one line with left and right align for name and type
	string += makeLine("" + docName.trim(), type.trim());

	// make a list of all the properties
	let tempString =
		specialChrs.bold.key +
		"Properties Defined:" +
		specialChrs.normal.key +
		" ";

	if (item.properties && item.properties.length > 0) {
		for (let i = 0; i < item.properties.length; i++) {
			const prop = item.properties[i];
			tempString += prop + " ";
		}
	} else {
		tempString = "No properties defined";
	}

	// jusitfy this list
	string += breakItDown(tempString);

	// set the text to normal
	string += specialChrs.normal.key;

	string += "\n";

	let left = specialChrs.bold.key + "Editors:" + specialChrs.normal.key;
	let right =
		specialChrs.bold.key + "Organisations:" + specialChrs.normal.key;

	string += makeLine(left, right);
	//FIXME: I also don't know where to write the function(editor,org) outside or inside the loop
	if (item.authors) {
		for (let i = 0; i < item.authors.length; i++) {
			// write name of editor
			const name = item.authors[i].name;

			let editor = name || " Name Unknown";

			let org = "";
			org += item.authors[i].org || "Org Unknown";
			if (org == "Invited Expert") {
				org = org + " - Unknown Funding";
			}

			string += makeLine(editor.trim(), org.trim());

			let editContribsName =
				specialChrs.italic.key +
				specialChrs.misc.key +
				addToList(nameList, editor?.trim()) +
				specialChrs.normal.key;
			let editContribsOrg =
				specialChrs.italic.key +
				specialChrs.misc.key +
				addToList(orgList, org?.trim()) +
				specialChrs.normal.key;

			string += makeLine(editContribsName, editContribsOrg);
		}
	}
	string += "\n\n";
	genTable()
}



const correctString = (string: string) => {
	let tempString = string;

	for (const chr in specialChrs) {
		tempString = tempString.replaceAll(
			//@ts-ignore
			specialChrs[chr].key,
			//@ts-ignore
			forPrint ? specialChrs[chr].value : "",
		);
	}

	return tempString;
};

await Deno.writeTextFile("output.txt", correctString(string));
