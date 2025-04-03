//Takes the data and formats it as an output for a dot matrix printer

import { SpecSheet } from "./types.ts";
import moment from "npm:moment";

const chrLimit = 80;

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

function breakItDown(string: string) {
  let returnString = '';
  let chunks = string.match(/.{1,80}/g);
  console.log(chunks)
  if (chunks) {
    chunks.forEach((chunk) => {
		returnString += chunk
		returnString += "\n"
    });

  }else{
	returnString += string
	returnString += "\n"

  }
  return returnString
}
let string = "";

console.log("Number of spec shets:", specSheetInfoArray.length);

//loop through specSheetInfoArray to add it all together in a string
for (let i = 0; i < specSheetInfoArray.length; i++) {
  //this is the sting we add the specs to and return
  const item: SpecSheet = specSheetInfoArray[i];
  //the loop after this goes through item author to seperate it into names and orgs
  //and because the string is declared before now we can add them to it
  const formatedDate = moment(item.date).format("DD/MM/YYYY");
  const docName = item.thisDocName || "Name Unknown";

  string += makeLine(docName.trim(), "");

  //TODO: turn the date thibgies to a dte thıngy

  const date = "Date: " + formatedDate;
  const type = "Type: " + item.type;

  string += makeLine(date.trim(), type.trim());
  let tempString = "PROPERTIES DEFINED: ";

  //FIXME:I have no idea how to add properties into the line function
  if (item.properties && item.properties.length > 0) {
    for (let i = 0; i < item.properties.length; i++) {
      const prop = item.properties[i];
      tempString += prop + ", ";
      //TODO: Dont add comma on last
    }
  } else {
     tempString = "No properties defined";
  }
  string += breakItDown(tempString)
  string += "\n";

  //FIXME: I also don't know where to write the function(editor,org) outside or inside the loop
  if (item.authors) {
    for (let i = 0; i < item.authors.length; i++) {
      const name = item.authors[i].name;
      let org = item.authors[i].org || "Org Unknown";
      if (org == "Invited Expert") {
        org = org + " - Unknown Funding";
      }
      // string += "\n Editor: " + name + "..................... ORG: " + org +
      //   "\n";
      let editor = "Editor: " + name;
      //FIXME: should this be outside of this loop?
      string += makeLine(editor.trim(), org.trim());
    }
  }
  string += "\n\n";
}

await Deno.writeTextFile("output.txt", string);
