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
        ['cc', 'countrycode', 'country-code', 'country_code'],
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
        ['dategt', 'date-gt', 'date_gt'],
        QueryParam.DateGt,
        validateDate
    ],
    [
        ['dategte', 'date-gte', 'date_gte'],
        QueryParam.DateGte,
        validateDate
    ],
    [
        ['datelt', 'date-lt', 'date_lt'],
        QueryParam.DateLt,
        validateDate
    ],
    [
        ['datelte', 'date-lte', 'date_lte'],
        QueryParam.DateLte,
        validateDate
    ],
    [
        ['page'],
        QueryParam.Page,
        (value) => isNaN(Number(value)) ? 'Not a number. Should be an integer greater than 0.' : null
    ],
    [
        ['sortby', 'sort-by', 'sort_by'],
        QueryParam.SortBy,
        (value) => {
            if (!value) {
                return 'Cannot be empty.';
            }
            const [dimension, order = ''] = value.split(' ');
            if (!['id', 'timestamp'].includes(dimension.toLowerCase())) {
                return `'${dimension}' is not an acceptable dimension name. Must be one of: 'id', 'timestamp'.`
            }
            if (!['asc', 'desc'].includes(order.toLowerCase())) {
                return order ? `${order} is not an acceptable order value. Must be either 'asc' or 'desc'.` : null;
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
    if (['general'].some((el) => el === req.params.category))
    for (const [key, value] of Object.entries(req.query)) {
        for (const [acceptableParams, targetParam, validate] of queryParams) {
            if (acceptableParams.some((el) => el.toLowerCase() === key.toLowerCase())) {
                const rejectReason = validate(value?.toString());
                if (rejectReason) {
                    res.status(400).send({ reason: `Incorrect value '${value}' of parameter ${key}. ${rejectReason}` })
                    return;
                }
                req.query[targetParam] = value;
            }
        }
    }

    const page = req.query[QueryParam.Page];
    if (page && (isNaN(Number(page)) || Number(page) < 1)) {
        const { baseUrl, url } = req;
        res.redirect(`${baseUrl}${url.replace(`page=${page}`, "page=1")}`);
        return;
    }

    const locale = req.query[QueryParam.Locale];
    if (locale) {
        const [country, lang] = locale.toString().split('-');
        req.query[QueryParam.Country] = country;
        req.query[QueryParam.Lang] = lang;
    }

    next();
};
