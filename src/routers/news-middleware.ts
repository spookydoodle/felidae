import express from "express";
import { DateTime } from 'luxon';
import { capitalize } from "../utils/stringTransform";
import { NewsRequestBody, NewsRequestParams, NewsRequestQuery, NewsResponseBody, QueryParam } from "./types";

const validateDate = (value?: string): string | null => {
    if (!value) {
        return 'Cannot be empty.';
    }
    const formatted = DateTime.fromFormat(value, 'yyyy-MM-dd');
    if (formatted.isValid) {
        return null;
    }
    return capitalize((formatted.invalidReason ?? 'Invalid value') + '.');
};

/**
 * Pairs of lowercase accepted query parameters and the property name to which the value should be assigned, together with a validation method.
 */
const queryParams: [string[], QueryParam, (value?: string) => string | null][] = [
    [
        ['locale'],
        QueryParam.Locale,
        (value) => ['de-de', 'gb-en', 'nl-nl', 'pl-pl', 'us-en'].some((el) => value === el)
            ? null
            : "Must be one of: 'de-de', 'gb-en', 'nl-nl', 'pl-pl', 'us-en'."
    ],
    [
        ['cc', 'countrycode', 'country_code'],
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
                ? 'Page number should be an integer greater than 0'
                : null
    ],
    [
        ['items'],
        QueryParam.Items,
        (value) => {
            const n = Number(value);
            const min = 1;
            const max = 500;
            if (isNaN(n)) {
                return `Not a number. Should be an integer greater than ${min - 1} and less than or equal ${max}.`;
            }
            if (n < 1) {
                return `Must be greater than ${min - 1}.`;
            }
            if (n > 500) {
                return `Must be less than ${max}.`;
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
            const [dimension, order = 'asc'] = value.split(' ');
            if (!['id', 'timestamp'].includes(dimension.toLowerCase())) {
                return `'${dimension}' is not an acceptable dimension name. Must be one of: 'id', 'timestamp'.`
            }
            if (!['asc', 'desc'].includes(order.toLowerCase())) {
                return `${order} is not an acceptable order value. Must be either 'asc' or 'desc'.`;
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
export const validateNewsQueryParams = (req: express.Request<NewsRequestParams, NewsResponseBody, NewsRequestBody, NewsRequestQuery>, res: express.Response, next: express.NextFunction) => {
    try {
        validateFilter(req.query);
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
export const validateFilter = (filter: NewsRequestQuery): NewsRequestQuery => {
    for (const [key, value] of Object.entries(filter)) {
        for (const [acceptableParams, targetParam, validate] of queryParams) {
            if (acceptableParams.some((el) => el.toLowerCase() === key.toLowerCase())) {
                const rejectReason = validate(value?.toString());
                if (rejectReason) {
                    console.log({rejectReason})
                   throw new Error(`Incorrect value '${value}' of parameter '${key}'. ${rejectReason}`)
                }
                filter[targetParam] = value;
            }
        }
    }

    const locale = filter[QueryParam.Locale];
    if (locale) {
        const [country, lang] = locale.toString().split('-');
        filter[QueryParam.Country] = country;
        filter[QueryParam.Lang] = lang;
    }

    return filter;
};
