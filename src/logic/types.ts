type ResultPage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type Lang = "lang_en" | "lang_de" | "lang_nl" | "lang_pl";

interface SearchResult {
  error: null | string;
  results: Array<{ heading: string; author: string; url: string; date: Date }>;
}

export { ResultPage, Lang, SearchResult };
