import * as cheerio from "npm:cheerio@^1.0.0";
import moment from "npm:moment";

type CssInfo = {
  authors: Authors[] | null;
  date: string | null;
  thisSpecUrl: string | null;
  previousSpecUrls: string[] | null;
  about: string | null;
};

type Authors = {
  name: string;
  company: string | null;
  link: string | null;
};

let property = "border";
let cssInfoArray: CssInfo[] = [];

const getFromMoz = async (property: string) => {
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
    let tempCssInfo = getCSSInfo(sheetHTML);

    // if(tempCssInfo.previousSpecUrls.length > 0){

    // }
  }

  return true;
};

const getCSSInfo = (sheetHTML: cheerio.CheerioAPI) => {
  let thisCssInfo: CssInfo = {
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
  //works for doc type: https://drafts.csswg.org/css-backgrounds/#index
  //Find index title
  let indexTitle = sheetHTML("#index-defined-here").next();

  //Finds Index of attributes and turn it into an aray becuase nodelist confusing
  let index = [...indexTitle.find("li a")];

  //check if property is present
  let isPresent = index.some((elm: any) => {
    return elm.children[0].data == property;
  });

  if (isPresent) {
    return true;
  }
  //Add another check for other doc formats

  return false;
};

const init = async (property: string) => {
  let arrayOfSpecs = await getFromMoz(property);

  console.log("Got Spec Sheets", arrayOfSpecs);

  // exit if array of specs is 0
  if (arrayOfSpecs.length == 0) {
    console.log("THIS SHIT EMPTY!");
    return;
  }

  //Loop Spec sheets to find css info
  for (let x = 0; x < arrayOfSpecs.length; x++) {
    await scrapeSpecSheet(arrayOfSpecs[x], property);
  }

  //   console.log(cssInfo);
};

init(property);
