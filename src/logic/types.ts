type ResultPage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type Category = "general" | "business" | "entertainment" | "geography";
type Lang = "lang_en" | "lang_de" | "lang_nl" | "lang_pl";

interface Headline {
  id?: number;
  category: Category;
  lang: Lang;
  headline: string;
  provider: string;
  url: string;
  timestamp: number;
}

type HeadlineColumn = keyof Headline;

type Headlines = Headline[];

interface SearchResult {
  error: null | string;
  results: Headlines;
}

type UpdateTime = [number, number, number, number];

export { ResultPage, Lang, Headlines, Headline, HeadlineColumn, Category, SearchResult, UpdateTime, };
