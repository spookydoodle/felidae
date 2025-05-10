import { Category, Headlines } from "../logic/types";

export enum QueryParam {
    Locale = 'locale',
    Country = 'country',
    Lang = 'lang',
    Date = 'date',
    DateGt = 'dateGt',
    DateGte = 'dateGte',
    DateLt = 'dateLt',
    DateLte = 'dateLte',
    Page = 'page',
    Items = 'items',
    SortBy = 'sortBy'
}

export interface NewsRequestParams {
    category: Category;
}

export type NewsResponseBody = Headlines | { message: string };
export type NewsRequestBody = undefined;

export type NewsRequestQuery = { [key in QueryParam]: string; };
