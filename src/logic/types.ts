type ResultPage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type Lang = "lang_en" | "lang_de" | "lang_nl" | "lang_pl";

interface Headline {
  headline: string;
  provider: string;
  url: string;
  timestamp: number;
}

type Headlines = Array<Headline>;

interface SearchResult {
  error: null | string;
  results: Headlines;
}

type UpdateTime = [number, number, number, number];

export { ResultPage, Lang, Headlines, Headline, SearchResult, UpdateTime };
