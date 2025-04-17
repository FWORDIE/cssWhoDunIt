//Takes the data and formats it as an output for a dot matrix printer

import { retry } from "jsr:@std/async/retry";
import { removeDiacritics } from "./scripts/basics.ts";
import { SpecSheet } from "./types.ts";
import moment from "npm:moment";

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

let position = 0;
const chrLimit = 96;
// let string = "";
const forPrint = true;
let thisYear = "0";
let essayNotPrinted = true;

let orgList: {
	item: string;
	num: number;
}[] = [];
let nameList: {
	item: string;
	num: number;
}[] = [];

let yearNameList: {
	item: string;
	num: number;
}[] = [];

let yearOrgList: {
	item: string;
	num: number;
}[] = [];

// Special Commands for IBM Proline
const lineBreakReturn = String.fromCharCode(10);
const returnChr = String.fromCharCode(13);
const half = String.fromCharCode(27, 60);
const fast = String.fromCharCode(27, 62);
const italic = String.fromCharCode(27, 37, 71);
const underline = String.fromCharCode(27, 45, 49);
const double = String.fromCharCode(27, 87, 49);
const noDouble = String.fromCharCode(27, 87, 48);
const normal =
	String.fromCharCode(27, 45, 48) +
	String.fromCharCode(27, 37, 72) +
	String.fromCharCode(27, 84) +
	String.fromCharCode(27, 58) +
	String.fromCharCode(27, 70, 27, 72) +
	noDouble; // No underline + no italics + np super/sub Script + pitch 12 + enhanced
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
	double: { value: string; key: string };
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
	double: { key: "≝", value: double },
};

//Takes the JSON file filled with all the data and turns it into an array of objects
let specSheetInfoArray = JSON.parse(
	await Deno.readTextFile("jsons/AllSpecInfo.json"),
);

let allProps = JSON.parse(await Deno.readTextFile("jsons/allProps.json"));

// Slice the sheet
specSheetInfoArray = specSheetInfoArray.sort((a: SpecSheet, b: SpecSheet) => {
	if (a.date && b.date) return a.date < b.date ? -1 : a.date > b.date ? 1 : 0;
});

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
function centerText(string: string, double = false) {
	let centerPoint = (chrLimit - lengthWithOut(string)) / 2;
	if (double) {
		centerPoint = (chrLimit - lengthWithOut(string) * 2) / 2;
	}
	let center = "";
	for (let i = 0; i < centerPoint; i++) {
		center += " ";
	}
	center += string;
	return center;
}

// Justifys text
function breakItDown(string: string, essay = false) {
	let returnString = "";

	let count = 0;

	//break down string into words on spaces
	let words = string.split(" ");
	//loop over each word
	words.forEach((word, i) => {
		// // check for line breaks
		// console.log(word)
		// if(word.includes('?linebreaker?')){
		// 	count = 0
		// 	returnString += "\n";
		// 	word = ''
		// }

		// check if it will go over line count
		if (lengthWithOut(word) + count + 2 > chrLimit) {
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
		count += lengthWithOut(word);

		// add punctation if not lst or first words
		if (
			i != 0 &&
			i != 1 &&
			i != words.length - 1 &&
			i != words.length - 2 &&
			!essay
		) {
			returnString += ", ";
			count += 2;
		} else if (i == 0 || i == 1 || essay) {
			returnString += " ";
			count += 1;
		}
	});

	// return string
	return returnString;
}

// Adds and returns ocunt
const addToList = (array: any[], item: string | null) => {
	let name = array == nameList;
	let yearArray = name ? yearNameList : yearOrgList;

	if (item) {
		let index = yearArray.findIndex(
			(currentItem) => currentItem.item === item,
		);
		if (index == -1) {
			yearArray.push({
				item: item,
				num: 1,
			});
		} else {
			yearArray[index].num++;
		}
	}

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

// Generates a set of tables for the most
const genTable = () => {
	let tempString = "";

	// Sort arrays by most contrribuatuins
	yearNameList = yearNameList.sort((a, b) => b.num - a.num);
	yearOrgList = yearOrgList.sort((a, b) => b.num - a.num);

	if (yearNameList.length > 0) {
		const title =
			specialChrs.bold.key +
			thisYear +
			"'s Most Active Editors" +
			specialChrs.normal.key;
		tempString += centerText(title);
		tempString += "\n";
		for (let i = 0; i < 5; i++) {
			if (yearNameList[i]) {
				const name = yearNameList[i].item;
				let editor = name || " Name Unknown";
				let editContribsName =
					specialChrs.italic.key +
					yearNameList[i].num +
					" Contributions" +
					specialChrs.normal.key;

				tempString += makeLine(
					(i + 1).toString() + ". " + editor.trim(),
					editContribsName,
				);
			}
		}
	}

	tempString += "\n";
	if (yearOrgList.length > 0) {
		const title =
			specialChrs.bold.key +
			thisYear +
			"'s Most Active Orginiations" +
			specialChrs.normal.key;
		tempString += centerText(title);
		tempString += "\n";

		for (let i = 0; i < 5; i++) {
			if (yearOrgList[i]) {
				const name = yearOrgList[i].item;
				let org = name || " Name Unknown";
				let orgContribsName =
					specialChrs.italic.key +
					yearOrgList[i].num +
					" Contributions" +
					specialChrs.normal.key;

				tempString += makeLine(
					(i + 1).toString() + ". " + org.trim(),
					orgContribsName,
				);
			}
		}
	}
	tempString += "\n";
	return tempString;
};

const printSpec = () => {
	let string = "";
	//this is the sting we add the specs to and return
	const item: SpecSheet = specSheetInfoArray[position];
	//the loop after this goes through item author to seperate it into names and orgs
	//and because the string is declared before now we can add them to it
	const formatedDate = moment(item.date).format("DD/MM/YYYY");

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
		(item.type?.trim() || "Unknown Type") +
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
			let prop = item.properties[i];
			if (!allProps.includes(prop)) {
				prop = specialChrs.italic.key + prop + specialChrs.normal.key;
			}
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
	// Load next position
	position++;
	return string;
};

const titleCard = () => {
	let tempString = "\n";
	let title =
		specialChrs.double.key + "A CSS WHODUNIT" + specialChrs.normal.key;
	let authors =
		specialChrs.italic.key +
		"Imre Ismen & Fred Wordie" +
		specialChrs.normal.key;
	tempString += centerText(title, true) + "\n";
	tempString += centerText(authors) + "\n\n";
	return tempString;
};

const essaySection = async() => {
	let string = "";
	const essay = await Deno.readTextFile("essay.txt");
	const essayBits = essay.split("\n");
	for (let bit of essayBits) {
		if (bit.length > 1) {
			string += breakItDown(bit, true);
			string += "\n";
			string += "\n";

		}
	}
	string += centerText(
		specialChrs.italic.key +
			"* All data presented is kinda accurate, like 95% ish *" +
			specialChrs.normal.key,
	);
	string += "\n";
	string += centerText(
		specialChrs.italic.key +
			"* https://github.com/FWORDIE/cssWhoDunIt *" +
			specialChrs.normal.key,
	);
	string += "\n";
	string += "\n";
	string += "\n";
	string += "\n";


	return string;
};

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
	tempString = removeDiacritics(tempString);
	return tempString;
};

let emuater = "";

while (position < 10) {
	let string = " ";
	string += "\n";
	string += "\n";

	if (position < 1 && essayNotPrinted) {
		string +=
			setLineHeight +
			" " +
			normal +
			" " +
			noPopSpacing +
			" " +
			noOverscore +
			" " +
			lineBreakReturn;
	}
	// Decoder thing
	const td = new TextDecoder();
	// Run command to see print queue
	const queue = await new Deno.Command("lpstat", {
		args: ["-R"],
	}).output();

	//Decode Print queue
	const queueData = td.decode(queue.stdout);

	// if print queue is bigger then 0
	if (queueData.length > 0 && forPrint) {
		console.log("Printer Busy");
		await delay(100);
	} else {
		// Print something

		string += "";

		//this is the sting we add the specs to and return
		const item: SpecSheet = specSheetInfoArray[position];

		const shortDate = moment(item.date).format("YYYY");

		if (shortDate != thisYear && thisYear != "0") {
			string += genTable();
			yearNameList = [];
			yearOrgList = [];
			console.log(thisYear);
		} else if (position % 50 == 0 && essayNotPrinted) {
			console.log("PRINTING ESSAY");
			string += titleCard();
			string += await essaySection()
			essayNotPrinted = false;
		} else {
			string += printSpec();
			essayNotPrinted = true;
		}

		thisYear = shortDate;
		emuater += string;

		if (forPrint) {
			await Deno.writeTextFile("output.txt", correctString(string));

			const process = await new Deno.Command("lpr", {
				args: ["-o raw", "output.txt"],
			}).output();

			console.log("POSITIONS: " + position, td.decode(process.stdout));
			await delay(1000);
		}
		await Deno.writeTextFile("emulater.txt", correctString(emuater));
	}
}
