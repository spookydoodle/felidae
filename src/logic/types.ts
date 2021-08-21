type Environment = "production" | "staging" | "development";

interface SearchConfig {
  environment?: Environment;
  engine: "google" | "bing";
  maxPageIndex?: ResultPage;
  updateFreqInHrs?: number
}

type ResultPage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

type Category =
  | "general"
  | "business"
  | "entertainment"
  | "sport"
  | "health"
  | "science";
type Lang = "en" | "de" | "nl" | "pl";
type Country = "gb" | "us" | "de" | "nl" | "pl";

interface HeadlineData {
  headline: string;
  provider: string;
  url: string;
  timestamp: number;
}
interface Headline extends HeadlineData {
  id?: number;
  category: Category;
  country: Country;
  lang: Lang;
}

type HeadlineColumn = keyof Headline;

type Headlines = Headline[];

interface SearchResult {
  error: null | string | number;
  results: Headlines;
}

type UpdateTime = [number, number, number, number];

type Engine = "google" | "bing";
// type Environment = "production" | "local";
interface UrlSelectorData {
  url: string;
  selector: string;
  transform: (headlines: any[], config: SearchConfig) => HeadlineData[];
}
type EnvUrlSelectorData = {
  [key in Environment]: UrlSelectorData;
};
type SelectorData = {
  [key in Engine]: EnvUrlSelectorData;
};

export {
  Environment,
  SearchConfig,
  ResultPage,
  Lang,
  Country,
  HeadlineData,
  Headlines,
  Headline,
  HeadlineColumn,
  Category,
  SearchResult,
  UpdateTime,
  Engine,
  UrlSelectorData,
  EnvUrlSelectorData,
  SelectorData,
};
