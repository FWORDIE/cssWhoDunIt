import * as cheerio from "npm:cheerio@^1.0.0";
import { ignore, logError } from "./basics.ts";


export const getType = async ($: cheerio.CheerioAPI, sheet: string) => {
  // Ignore if focus is called or is a known issue
  if (await ignore("type", sheet)) {
    return undefined;
  }
  try {
    const specType = $("time").first().prev().text();
    console.log(specType);
    if (specType && checkSpecType(specType, sheet) != "Failed") {
      return checkSpecType(specType,sheet);
    }
    if (!specType) {
      const specType = $("#suptitle").children().first().text();
      // thıs checks to see ıf what u returnıng ıs actually defıned
      // ıf (specType != undefıned)
      // != means not equal
      // thıs ıs the same as ıf(specType)
      // ıf(Var) means ıf Var ıs not falsey
      // falsey can mean False, Null, Undefeıned
      if (specType) {
        // thıs ıs now returnıgn somethıng that ıs a strıng
        return specType;
      }
    }
    if (!specType) {
      const getType = $("h2.no-num.no-toc").text().split(/\d/)[0].trim();
      // Thıs wıll always return somethıng
      // eıther undıfeıned or the thıng you want
      // so ıt never faıls and hence never reports and error
      // can I just ask it to get rid of W3C and then give this (/\d/)[0] comment
      // break it into smaller parts :)
      if (specType) {
        return getType;
        //note to self, there are some specs this should work but are not currently, I would at least
        // expect a few W since all start with W but I haven't seen that at all yet I am confused it is late
      }
    }
    if (!specType) {
      const specTypeString = $("h1").next().text();
      const specType = specTypeString.split(/\d/)[1].trim();
      if (specType) {
        return specType;
      }
    }
    logError("specType", sheet);
    return undefined;
  } catch {
    logError("Type", sheet);
    return undefined;
  }
};
const checkSpecType = (specType: string, sheet: string) => {
  specType = specType.trim();
  if (specType[0] === "'") {
    specType = specType.slice(1, specType.length);
  }
  if (specType[specType.length - 1] === "'") {
    specType = specType.slice(0, specType.length - 1);
  }
  if (specType.includes("W3C")) {
    specType = specType.replace("W3C", "").trim();
  }
  if (specType) {
    if (
      !specType.match(
        "Editor's Draft|Working Draft|Reccomendation|First Public Working Draft|Candidate Recommendation Draft|Group Note|Proposed Recommendation",
      )
    ) {
      return "Failed";
    }
    return specType;
  }
};
//export const getAbstract = async ($: cheerio.CheerioAPI, sheet: string) => {
// Ignore if focus is called or is a known issue
//	if (await ignore("abstract", sheet)) {
//		return undefined;
//	}

//	try {
// List of different ways to find abstract

// e.g. https://www.w3.org/TR/2024/WD-css-conditional-5-20240723/
//		let abstract = $('[data-fill-with="abstract"]').find("p").text().trim();

// e.g. https://www.w3.org/TR/2014/WD-css-masking-1-20140213/
//		if (!abstract) {
//			abstract = $("#abstract").next().text().trim();
//		}

// e.g. https://www.w3.org/TR/2001/WD-css3-box-20010726/
//		if (!abstract) {
//			abstract = $("#Abstract").next().text().trim();
//		}

// e.g. https://www.w3.org/TR/2003/CR-css3-ruby-20030514
//	if (!abstract) {
//			abstract = $("#Abstract").parent().next().text().trim();
//		}
// e.g. https://www.w3.org/TR/2009/WD-css3-selectors-20090310
//		if (!abstract) {
//			abstract = $('[name="abstract"]').parent().next().text().trim();
//		}

// e.g. https://www.w3.org/1999/06/WD-css3-page-19990623
//		if (!abstract) {
//			abstract = $("h2:contains('Abstract')").next().text().trim();
//		}

//		if (abstract) {
//			return abstract;
//		}
//		logError("ABSTRACT", sheet);
//		return undefined;
//	} catch {
//		logError("ABSTRACT & ERROR", sheet);
//		return undefined;
//	}
