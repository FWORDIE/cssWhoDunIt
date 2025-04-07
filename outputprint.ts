//Takes the data and formats it as an output for a dot matrix printer

//TODO: ADD BOLD FOR PRINTER
//TODO: CENTER DATE AND MOVE IT ABOVE TITLE

import { SpecSheet } from "./types.ts";
import moment from "npm:moment";

const chrLimit = 80;
let string = "";
const orgList:{
	name:string,
	num:number
}[] = []
const nameList:{
	name:string,
	num:number
}[] = []

//Takes the JSON file filled with all the data and turns it into an array of objects
const specSheetInfoArray = JSON.parse(
	await Deno.readTextFile("jsons/AllSpecInfo.json"),
);

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

function makeLine(left: string, right: string) {
	const centerLength = chrLimit - left.length - right.length;

	let center = "";

	for (let i = 0; i < centerLength; i++) {
		center += " ";
	}

	let line = left + center + right;

	line = line.trim();

	return line + "\n";
}

function centerText(string: string) {
	const centerPoint = (chrLimit - string.length) / 2;
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
		if (word.length + count > chrLimit) {
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

const addToList = (array: any[], item: string) => {
	let index = array.findIndex((currentItem) => currentItem.item === item);
	if (index == -1) {
		array.push({
			item: item,
			num: 1,
		});
		return 1
	} else {
		array[index].num++;
		return array[index].num
	}
	
};

//loop through specSheetInfoArray to add it all together in a string
for (let i = 0; i < specSheetInfoArray.length; i++) {
	//this is the sting we add the specs to and return
	const item: SpecSheet = specSheetInfoArray[i];
	//the loop after this goes through item author to seperate it into names and orgs
	//and because the string is declared before now we can add them to it
	const formatedDate = moment(item.date).format("DD/MM/YYYY");
	const docName = item.thisDocName || "Name Unknown";

	// string += makeLine(docName.trim(), "");

	//TODO: turn the date thibgies to a dte thıngy

	// const date = "Date: " + formatedDate;

	string += centerText(formatedDate);
	string += "\n";

	const type = "" + item.type;

	string += makeLine("" + docName.trim(), type.trim());
	let tempString = "Properties Defined: ";

	if (item.properties && item.properties.length > 0) {
		for (let i = 0; i < item.properties.length; i++) {
			const prop = item.properties[i];
			tempString += prop + " ";
		}
	} else {
		tempString = "No properties defined";
	}

	string += breakItDown(tempString);
	string += "\n";

	//FIXME: I also don't know where to write the function(editor,org) outside or inside the loop
	if (item.authors) {
		for (let i = 0; i < item.authors.length; i++) {
			const name = item.authors[i].name;
			let org = "[Num:" + addToList(orgList, item.authors[i].org) +'] ';
			org += item.authors[i].org || "Org Unknown";
			if (org == "Invited Expert") {
				org = org + " - Unknown Funding";
			}
			
			let editor = "Editor: " + name + " [Num:" + addToList(nameList, name) +']';
			//FIXME: should this be outside of this loop?
			string += makeLine(editor.trim(), org.trim());
		}
	}
	string += "\n\n";
}

await Deno.writeTextFile("output.txt", string);

//TODO: Bug over line, title and type
//TODO: add in bold