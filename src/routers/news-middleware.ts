import { Pool } from "pg";
import express from "express";
import { DateTime } from 'luxon';
import { capitalize } from "../utils/stringTransform";
import { NewsRequestBody, NewsRequestFormat, NewsRequestParams, NewsRequestQuery, NewsRequestQueryAliases, NewsResponseBody, QueryParam } from "./types";
import { NewsFilterCondition, OrderBy, OrderType } from "../db/queries";
import { selectNewsData } from "../db/postNewsData";
import { Headline } from "../logic/types";
import { categories } from "../scrapers/constants";

export const MAX_ITEMS_PER_PAGE = 500;

const validateDate = (value?: string): string | null => {
    if (!value) {
        return 'Cannot be empty.';
    }
    const formatted = DateTime.fromFormat(value, 'yyyy-MM-dd');
    if (formatted.isValid) {
        return null;
    }
    return capitalize((formatted.invalidReason ?? 'Invalid value') + '. Must follow format yyyy-MM-dd.');
};

/**
 * Pairs of lowercase accepted query parameters and the property name to which the value should be assigned, together with a validation method.
 */
const queryParams: [string[], QueryParam, (value?: string) => string | null][] = [
    [
        ['locale'],
        QueryParam.Locale,
        (value) => ['de_de', 'gb_en', 'nl_nl', 'pl_pl', 'us_en'].some((el) => value === el)
            ? null
            : "Must be one of: 'de_de', 'gb_en', 'nl_nl', 'pl_pl', 'us_en'."
    ],
    [
        ['cc', 'country', 'countrycode', 'country_code'],
        QueryParam.Country,
        (value) => ['de', 'gb', 'nl', 'pl', 'us'].some((el) => value === el)
            ? null
            : "Must be one of: 'de', 'gb', 'nl', 'pl', 'us'."
    ],
    [
        ['language', 'lang'],
        QueryParam.Lang,
        (value) => ['de', 'en', 'nl', 'pl'].some((el) => value === el)
            ? null
            : "Must be one of: 'de', 'en', 'nl', 'pl'."
    ],
    [
        ['date'],
        QueryParam.Date,
        validateDate
    ],
    [
        ['dategt', 'date_gt'],
        QueryParam.DateGt,
        validateDate
    ],
    [
        ['dategte', 'date_gte'],
        QueryParam.DateGte,
        validateDate
    ],
    [
        ['datelt', 'date_lt'],
        QueryParam.DateLt,
        validateDate
    ],
    [
        ['datelte', 'date_lte'],
        QueryParam.DateLte,
        validateDate
    ],
    [
        ['page'],
        QueryParam.Page,
        (value) => isNaN(Number(value))
            ? 'Not a number. Should be an integer greater than 0.'
            : Number(value) < 1
                ? 'Page number should be an integer greater than 0.'
                : null
    ],
    [
        ['items'],
        QueryParam.Items,
        (value) => {
            const n = Number(value);
            const min = 1;
            const max = MAX_ITEMS_PER_PAGE;
            if (isNaN(n)) {
                return `Not a number. Should be an integer greater than ${min - 1} and less than or equal ${max}.`;
            }
            if (n < 1) {
                return `Must be greater than ${min - 1}.`;
            }
            if (n > 500) {
                return `Must be less than or equal ${max}.`;
            }
            return null;
        }
    ],
    [
        ['sortby', 'sort_by'],
        QueryParam.SortBy,
        (value) => {
            if (!value) {
                return 'Cannot be empty.';
            }
            const [dimension, order = 'asc'] = value.split('_');
            if (!['id', 'timestamp'].includes(dimension.toLowerCase())) {
                return `'${dimension}' is not an acceptable dimension name. Must be one of: 'id', 'timestamp'.`
            }
            if (!['asc', 'desc'].includes(order.toLowerCase())) {
                return `'${order}' is not an acceptable order value. Must be either 'asc' or 'desc'.`;
            }
            return null;
        }
    ],
];

/**
 * Validates the query parameters in a case insensitive manner accommodating various casing styles.
 * Modifies the expected queries to match camel case
 * @example `fOo-bar`, `foo_bar`, `FOO_BAR` and `fooBar` will all be rewritten to `fooBar`.
 */
export const validateNewsParams = (req: express.Request<NewsRequestParams, NewsResponseBody, NewsRequestBody, NewsRequestQuery>, res: express.Response, next: express.NextFunction) => {
    try {
        validateRequestParameters(req.params);
        next();
    } catch (err) {
        res.status(400).send({ reason: (err as Error).message || 'Incorrect params' })
    }
};

/**
 * Validates predefined request parameters.
 * Throws if any is invalid.
 * @param params 
 * @returns 
 */
export const validateRequestParameters = (params: NewsRequestParams) => {
    const { category, format = 'json' } = params;
    if (!categories.includes(category)) {
        throw new Error(`Category parameter '${category}' is not valid. Must be one of: ${categories.join(', ')}.`);
    }
    const validFormats: NewsRequestFormat[] = ['json', 'pbf'];
    if (!validFormats.includes(format)) {
        throw new Error(`Format parameter '${format}' is not valid. Must be one of: ${validFormats.join(', ')}.`)
    };
    return params;
}

/**
 * Validates the query parameters in a case insensitive manner accommodating various casing styles.
 * Modifies the expected queries to match camel case
 * @example `fOo-bar`, `foo_bar`, `FOO_BAR` and `fooBar` will all be rewritten to `fooBar`.
 */
export const validateNewsQueryParams = (req: express.Request<NewsRequestParams, NewsResponseBody, NewsRequestBody, NewsRequestQuery & NewsRequestQueryAliases>, res: express.Response, next: express.NextFunction) => {
    try {
        validateRequestFilter(req.query);
        next();
    } catch (err) {
        res.status(400).send({ reason: (err as Error).message || 'Incorrect query' })
    }
};

/**
 * Validates each query parameter and handles aliases.
 * If values are provided for a given alias, they will be assigned to the effective parameter name.
 * @param filter Filter object which will be mutated by validation methods.
 * @returns Modified `filter`.
 */
export const validateRequestFilter = (filter: NewsRequestQuery & NewsRequestQueryAliases): NewsRequestQuery => {
    for (const [key, value] of Object.entries(filter)) {
        for (const [acceptableParams, targetParam, validate] of queryParams) {
            if (acceptableParams.some((el) => el.toLowerCase() === key.toLowerCase())) {
                const rejectReason = validate(value?.toString());
                if (rejectReason) {
                   throw new Error(`Incorrect value '${value}' of parameter '${key}'. ${rejectReason}`)
                }
                filter[targetParam] = value;
            }
        }
    }

    const locale = filter[QueryParam.Locale];
    if (locale) {
        const [country, lang] = locale.toString().split('_');
        filter[QueryParam.Country] = country;
        filter[QueryParam.Lang] = lang;
    }

    return filter;
};

export const getNewsHeadlines = async (pool: Pool, params: NewsRequestParams, query: NewsRequestQuery) => {
    const { category } = params;
    const { country, lang, date, dateGt, dateGte, dateLt, dateLte, page, items = '100', sortBy } = query;
    const pg = isNaN(Number(page)) ? 1 : Math.max(1, Number(page));
    const itemsPerPage = Number(items);
    const [top, skip] = [itemsPerPage, (pg - 1) * itemsPerPage];

    const filters: NewsFilterCondition[] = [["category", "eq", category]];
    const orderBy: OrderBy[] = [];

    if (country) filters.push(["country", "eq", country.toString()]);
    if (lang) filters.push(["lang", "eq", lang.toString()]);
    if (date) filters.push(["timestamp", "eq", date.toString()]);
    if (dateGt) filters.push(["timestamp", "gt", dateGt.toString()]);
    if (dateGte) filters.push(["timestamp", "gte", dateGte.toString()]);
    if (dateLt) filters.push(["timestamp", "lt", dateLt.toString()]);
    if (dateLte) filters.push(["timestamp", "lte", dateLte.toString()]);

    if (sortBy) {
        const [name, order = 'asc'] = sortBy.toString().split('_');
        const names: (keyof Headline)[] = ['id', 'timestamp'];
        if ((names as string[]).includes(name)) {
            orderBy.push([
                name as keyof Headline,
                (["ASC", "DESC"].includes(order.toUpperCase()) ? order.toUpperCase() as OrderType : "ASC")
            ]);
        }
    }

    const data = await selectNewsData(pool, {
        filters: filters,
        orderBy: orderBy,
        top: top,
        skip: skip,
    });

    return data;
};
