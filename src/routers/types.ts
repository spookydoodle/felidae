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

export interface NewsRequestParams {
    category: Category;
}

export type NewsResponseBodySuccess = Headline[];
export interface NewsResponseError {
    reason: string;
}
export type NewsResponseBody = NewsResponseBodySuccess | NewsResponseError;
export type NewsRequestBody = undefined;

export type NewsRequestQuery = { [key in QueryParam]?: string; };

export interface NewsRequestQueryGraphQL extends NewsRequestQuery {
    query: string;
}

export type NewsResponseBodyGraphQLSuccess = Partial<Headline>[];
export interface NewsResponseBodyGraphQLError {
    errors: {
        message: string,
        locations?: SourceLocation[];
    }[]
};

export type NewsResponseBodyGraphQL = NewsResponseBodyGraphQLSuccess | NewsResponseBodyGraphQLError;
