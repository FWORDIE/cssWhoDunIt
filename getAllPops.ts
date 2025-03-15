import * as cheerio from "npm:cheerio@^1.0.0";
const string: string = "/en-US/docs/Web/CSS/";

let $ = await cheerio.fromURL(
	"https://developer.mozilla.org/en-US/docs/Web/CSS",
);
const props: string[] = [];
let allProps = $('summary:contains("Properties")').next().find("a");
console.log(allProps.length);
for (const posProp of allProps) {
	let href = $(posProp).attr()?.href;
	if (href && href?.includes(string)) {
		let prop = href.slice(string.length, href.length).trim();
		if (prop) {
			props.push(prop);
		}
	}
}

await Deno.writeTextFile(
	"./jsons/allProps.json",
	JSON.stringify(props, null, 2),
);
