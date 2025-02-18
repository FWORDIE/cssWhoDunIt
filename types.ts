export type CssInfo = {
  authors: Authors[] | null;
  date: string | null;
  thisSpecUrl: string | null;
  previousSpecUrls: string[] | null;
  about: string | null;
};

export type Authors = {
  name: string;
  company: string | null;
  link: string | null;
};