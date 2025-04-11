//Takes the data and formats it as an output for a dot matrix printer

//TODO: ADD BOLD FOR PRINTER
//TODO: CENTER DATE AND MOVE IT ABOVE TITLE

import { italic } from "jsr:@std/fmt@1.0.3/colors";
import { SpecSheet } from "./types.ts";
import moment from "npm:moment";

const chrLimit = 96;
let string = "";
const orgList: {
	name: string;
	num: number;
}[] = [];
const nameList: {
	name: string;
	num: number;
}[] = [];

type SpecialChrs = {
	bold: { value: string; key: string };
	normal: { value: string; key: string };
	italic: { value: string; key: string };
	misc: { value: string; key: string };
};

const specialChrs = {
	bold: { key: "", value: "" },
	normal: { key: "", value: "" },
	italic: { key: "", value: "" },
	misc: { key: "", value: "" },
};

//Takes the JSON file filled with all the data and turns it into an array of objects
let specSheetInfoArray = JSON.parse(
	await Deno.readTextFile("jsons/AllSpecInfo.json"),
);

specSheetInfoArray = specSheetInfoArray.reverse().slice(222,224);


//don't hate me for the amount of breaks
//FIXME: I do not understand how to fix the errors
// or why they are there to begin with AAAAAA
// okay ,I fixed some and have no idea how to figure out center.lenght
// length is a read only property..... i don't think I can assign it a value
// I changed the places of center.lenght to fix it
//but it now wants a semi colon up its ass I think
//But okay some other questions 1) how to position the stuff
// like does it make sense to write this function in the begining,
// what to do with the loops for author and properties??

// I thınk ıts all good now....

const lengthWithOut = (string: string) => {
	let tempString = string;

	for (const chr in specialChrs) {
		tempString = tempString.replaceAll(specialChrs[chr].key, "");
	}

	return tempString.length;
};

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

function centerText(string: string) {
	const centerPoint = (chrLimit - lengthWithOut(string)) / 2;
	let center = "";
	for (let i = 0; i < centerPoint; i++) {
		center += " ";
	}
	center += string;
	return center;
}

function breakItDown(string: string) {
	let returnString = "";

	let count = 0;

	//break down string into words on spaces
	let words = string.split(" ");

	//loop over each word
	words.forEach((word, i) => {
		// check if it will go over line count
		if (word.length + count + 1 > chrLimit) {
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

const addToList = (array: any[], item: string | null) => {
	if (item) {
		let index = array.findIndex((currentItem) => currentItem.item === item);
		if (index == -1) {
			array.push({
				item: item,
				num: 1,
			});
			return 1;
		} else {
			array[index].num++;
			return array[index].num;
		}
	}
	return "NaN";
};

//loop through specSheetInfoArray to add it all together in a string
for (let i = 0; i < specSheetInfoArray.length; i++) {
	//this is the sting we add the specs to and return
	const item: SpecSheet = specSheetInfoArray[i];
	//the loop after this goes through item author to seperate it into names and orgs
	//and because the string is declared before now we can add them to it
	const formatedDate = moment(item.date).format("DD/MM/YYYY");

	// Here we center the text and also add special characters to command the printer
	string += centerText(
		specialChrs.bold.key + specialChrs.italic.key + formatedDate,
	);

	// set the text to normal
	string += specialChrs.normal.key;

	// line break
	string += "\n";

	//Add Name
	const docName =
		specialChrs.bold.key +
		(item.thisDocName?.trim() || "Name Unknown") +
		specialChrs.normal.key;

	// Add Type
	const type =
		specialChrs.bold.key +
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

	//FIXME: I also don't know where to write the function(editor,org) outside or inside the loop
	if (item.authors) {
		for (let i = 0; i < item.authors.length; i++) {
			// write name of editor
			const name = item.authors[i].name;

			let editor =
				specialChrs.bold.key +
				"Editor: " +
				specialChrs.normal.key +
				name +
				specialChrs.italic.key +
				" [Num:" +
				addToList(nameList, name) +
				"]" +
				specialChrs.normal.key;

			let org = "";
			if (item.authors[i].org) {
				org +=
					specialChrs.italic.key +
					"[Num:" +
					addToList(orgList, item.authors[i].org) +
					"] " +
					specialChrs.normal.key;
			}
			org += item.authors[i].org || "Org Unknown";
			if (org == "Invited Expert") {
				org = org + " - Unknown Funding";
			}

			string += makeLine(editor.trim(), org.trim());
		}
	}
	string += "\n\n";
}

const correctString = (string: string) => {
	let tempString = string;

	for (const chr in specialChrs) {
		tempString = tempString.replaceAll(
			specialChrs[chr].key,
			specialChrs[chr].value
		);
	}

	return tempString;
};
await Deno.writeTextFile("output.txt", correctString(string));

