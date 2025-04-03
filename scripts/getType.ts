import * as cheerio from "npm:cheerio@^1.0.0";
import { ignore, logError } from "./basics.ts";
import { progress } from "../getSpecInfo.ts";

export const getType = async ($: cheerio.CheerioAPI, sheet: string) => {
  // Ignore if focus is called or is a known issue
  if (await ignore("type", sheet)) {
    return undefined;
  }
  try {
    let specType = $("time").first().prev().text();
    //https://www.w3.org/TR/2025/WD-css-position-3-20250311/
    //    console.log(specType);
    if (specType && await checkSpecType(specType, sheet) != "Failed") {
      return checkSpecType(specType, sheet);
    }
    if (!specType) {
      specType = $("#suptitle").children().first().text();
      if (specType && await checkSpecType(specType, sheet) != "Failed") {
        console.log("2");
        return checkSpecType(specType, sheet);
      }
    }
	if (!specType) {
        // https://www.w3.org/TR/2012/WD-css3-grid-layout-20121106/ 
        const specTypeString = $("h1").next().text().replace("W3C", "");
        specType = specTypeString.split(/\d/)[0].trim();
        if (specType && await checkSpecType(specType, sheet) != "Failed") {
          return checkSpecType(specType, sheet);
        }
      }
    if (!specType) {
      //https://www.w3.org/TR/css-tables-3/
      const specTypeString = $("h2.no-num.no-toc").text().replace("W3C","");
      const specTypeWithAddOn = specTypeString.split(/\d/)[0];
      const specTypeWithBreak = specTypeWithAddOn.replace(/(\r\n|\n|\r)/gm, "").replace(
        ",",
        "",
      );
	  specType = specTypeWithBreak.replace(/\s+/g, " ").trim();
  if (specType && await checkSpecType(specType, sheet) != "Failed") {
        return checkSpecType(specType, sheet);
      }
	  
      logError("specType", sheet);
      return undefined;
    }} catch {
    logError("Type", sheet);
    return undefined;
  }
};
const checkSpecType = async (specType: string, sheet: string) => {
  specType = specType.trim();
  if (specType[0] === "'") {
    specType = specType.slice(1, specType.length);
  }
  if (specType[specType.length - 1] === "'") {
    specType = specType.slice(0, specType.length - 1);
  }
    specType = specType.replace("W3C", "").trim();
  
  if (specType) {
    if (
      !specType.match(
        "Editor's Draft|Working Draft|Reccomendation|First Public Working Draft|Candidate Recommendation Draft|Group Note|Proposed Recommendation|Candidate Recommendation Snapshot|Editor’s Draft|Candidate Recommendation,",
      ) &&
      !specType.match(
        "Working  Draft|Candidate Recommendation|Recommendation|Group Draft Note|CSS Working Group|",
      )
    ) {
      await progress.console(`FAILED CHECK FOR ${specType}`);

      return "Failed";
    }
    specType = specType.replace(",", "").trim();
    specType = specType.replace("-", "").trim();
    specType = specType.replace("\n", "").trim();
    specType = specType.replace(/\s+/g, " ").trim();
    return specType;
  }
};