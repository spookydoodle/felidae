export type Environment = "production" | "staging" | "development";

export interface SearchParams {
    category: Category,
    country?: Country,
    lang?: Lang,
}

export interface SearchConfig {
    environment?: Environment;
    engine: Engine;
    maxPageIndex?: ResultPage;
    updateFreqInHrs?: number
}

export type ResultPage = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type Category =
    | "general"
    | "business"
    | "entertainment"
    | "sport"
    | "health"
    | "science";
export type Lang = "en" | "de" | "nl" | "pl";
export type Country = "gb" | "us" | "de" | "nl" | "pl";

export interface HeadlineData {
    headline: string;
    provider: string;
    url: string;
    age: string;
    timestamp: number;
}

export interface Headline extends HeadlineData {
    id?: number;
    category: Category;
    country: Country;
    lang: Lang;
}

export type HeadlineColumn = keyof Headline;

export type Headlines = Headline[];

export interface SearchResult {
    error: null | string | number;
    results: Headlines;
}

export type UpdateTime = [number, number, number, number];

export type Engine = "bing";

export interface UrlSelectorData {
    url: string;
    selector: string;
    transform: (headlines: Element[]) => HeadlineData[];
}

export type EnvUrlSelectorData = {
    [key in Environment]: UrlSelectorData;
};

export type SelectorData = {
    [key in Engine]: EnvUrlSelectorData;
};
