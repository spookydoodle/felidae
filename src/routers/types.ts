import { SourceLocation } from "graphql";
import { Category, Headline } from "../logic/types";

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

export interface NewsRequestParamsBase {
    category: Category;
}

export interface NewsRequestParams extends NewsRequestParamsBase {
    format?: NewsRequestFormat;
}

export type NewsRequestFormat = 'json' | 'pbf';

export type NewsResponseBodySuccess = Headline[];
export interface NewsResponseError {
    reason: string;
}
export type NewsResponseBody = NewsResponseBodySuccess | NewsResponseError;
export type NewsRequestBody = undefined;

export type NewsRequestQuery = { [key in QueryParam]?: string; };
export type NewsRequestQueryAliases = {
    [key in
    'locale' |
    'cc' |
    'country' |
    'countrycode' |
    'country_code' |
    'lang' |
    'language' |
    'page' |
    'items' |
    'date' |
    'dategt' |
    'date_gt' |
    'dategte' |
    'date_gte' |
    'datelt' |
    'date_lt' |
    'datelte' |
    'date_lte' |
    'sortby' |
    'sort_by'
    ]?: string;
};

export interface NewsRequestQueryGraphQL extends NewsRequestQuery {
    query: string;
}

export interface NewsResponseBodyGraphQLSuccess {
    headlines: Partial<Headline>[];
};
export interface NewsResponseBodyGraphQLError {
    errors: {
        message: string,
        locations?: SourceLocation[];
    }[]
};

export type NewsResponseBodyGraphQL = NewsResponseBodyGraphQLSuccess | NewsResponseBodyGraphQLError;
