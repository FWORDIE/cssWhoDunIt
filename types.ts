export type History = {
	authors: Authors[] | null;
	date: string | null;
	thisSpecUrl: string | null;
	previousSpecUrls: string[];
	thisDocName: string | null;
	type: "Draft" | "Reccomendation" | "Unkown";
};

export type CssProperty = {
	history: History[];
	about: string | null; // Note Take from mdn Docs
	name: string |null;
	mdnLink: string |null;
};

export type Authors = {
	name: string;
	company: string | null;
	link: string | null;
};
