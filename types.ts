export type History = {
	authors: Authors[] | null;
	date: string | null;
	thisSpecUrl: string | null;
	previousSpecUrls: string[];
	thisDocName: string | null;
	type: string | "Unknwon";
};

export type SpecSheet = {
	authors: Authors[] | undefined;
	editors: Authors[] | undefined;
	date: string | undefined;
	thisSpecUrl: string | undefined;
	thisDocName: string | undefined;
	type: string | undefined;
	abstract: string | undefined;
	properties: string[] | undefined;
	//keywords: oneDay;
};

export type CssProperty = {
	history: History[];
	about: string | null; // Note Take from mdn Docs
	name: string | null;
	mdnLink: string | null;
};

export type Authors = {
	name: string | null;
	org: string | null;
	link: string | null;
	type: string | null;
};

export type ErrorLink = { types: string[]; sheet: string };
