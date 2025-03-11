import { brokenLinks } from "../basics.ts";
import type { ErrorLink } from "../types.ts";
import { progress } from "../getSpecInfo.ts";

//Function we use to log erros and back up problem links
export const logError = async (type: string, sheet: string) => {
	// Add to list of issues for Sheet if it already has a problem
	const found = brokenLinks.find((sheetObject: ErrorLink, index: number) => {
		if (sheetObject.sheet === sheet) {
			brokenLinks[index] = {
				types: [...brokenLinks[index].types, type],
				sheet: sheet,
			};
			return true; // stop searching
		}
	});

	if (!found) {
		//if not add a new link
		const issue: ErrorLink = {
			types: [type],
			sheet: sheet,
		};

		brokenLinks.push(issue);
	}

	await progress.console(`${type} FAILED FOR ${sheet}`);

	// Save Broken Links
	await Deno.writeTextFile(
		"./jsons/brokenSpecs.json",
		JSON.stringify(brokenLinks, null, 2),
	);
};
