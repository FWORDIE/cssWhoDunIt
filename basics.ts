// These are used when we run out of CSS3 Draft Links Module Links to explore
// e.g. We run out of previous versions of a property to explore,
// therefore it must be part of CSS2.1. If the property is still present in all
// the 2.1 drafts then it must be in 2 etc

export const CSSDrafts = [
	"https://www.w3.org/TR/CSS1/",
	"https://www.w3.org/TR/2008/REC-CSS2-20080411/",
	"https://www.w3.org/TR/CSS2/",
];

export const specSheetLinkArray = JSON.parse(
	await Deno.readTextFile("./jsons/AllSpecs.json"),
);

export const testArray = (num = 10) => {
	const shuffled = [...specSheetLinkArray].sort(() => 0.5 - Math.random());
	return shuffled.slice(0, num);
};

export const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));
