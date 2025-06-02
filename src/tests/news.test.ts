import express from "express";
import { getMockReq, getMockRes } from '@jest-mock/express'
import { validateNewsQueryParams, validateRequestFilter } from "../routers/news-middleware";
import { NewsRequestBody, NewsRequestParams, NewsRequestQuery, NewsResponseBody } from "../routers/types";
import { getResults } from "../search/searchHTML";

describe('News', () => {
    test("Check bing result objects key structure", async () => {
        const res = await getResults("news", {
            category: "general",
            country: "de",
            lang: "de"
        }, {
            environment: "production",
            engine: "bing",
        });
        const keys = Object.keys(res.results[0] || {});
        const { headline, url } = res.results[0] || {};

        expect(keys).toStrictEqual([
            "category",
            "country",
            "lang",
            "headline",
            "url",
            "provider",
            "img",
            "age",
            "timestamp",
        ]);
        expect(typeof headline).toBe("string");
        expect(headline.length > 0).toBe(true);
        expect(url.substring(0, 4)).toBe("http");
    });

    describe('Query params validation', () => {
        const { res, next, mockClear } = getMockRes();
        const getReq = (category: string, query: { [key in string]: string | string[] | undefined }) => getMockReq({ 
            params: { category },
            query
        }) as unknown as express.Request<NewsRequestParams, NewsResponseBody, NewsRequestBody, NewsRequestQuery>;

        beforeEach(() => {
            mockClear();
        });

        describe('locale ok', () => {
            test('validate', () => {
                const filter = validateRequestFilter({ locale: 'de_de' });
                expect(filter.locale).toBe('de_de');
            });

            test('request', () => {
                validateNewsQueryParams(getReq('sport', { locale: 'de_de' }), res, next);
                expect(next).toHaveBeenCalled();
            });
        });

        describe('locale not ok', () => {
            test('validate', () => {
                expect(() => validateRequestFilter({ locale: 'a' })).toThrow("Incorrect value 'a' of parameter 'locale'. Must be one of: 'de_de', 'gb_en', 'nl_nl', 'pl_pl', 'us_en'.");
            });
            test('request', () => {
                validateNewsQueryParams(getReq('sport', { locale: 'a' }), res, next);
                expect(next).not.toHaveBeenCalled();
            });
        });

        describe('country code ok', () => {
            test('validate', () => {
                let filter = validateRequestFilter({ cc: 'gb' });
                expect(filter.country).toBe('gb');
                filter = validateRequestFilter({ country: 'us' });
                expect(filter.country).toBe('us');
                filter = validateRequestFilter({ countrycode: 'nl' });
                expect(filter.country).toBe('nl');
                filter = validateRequestFilter({ country_code: 'de' });
                expect(filter.country).toBe('de');
            });
            test('request', () => {
                validateNewsQueryParams(getReq('entertainment', { cc: 'gb' }), res, next);
                expect(next).toHaveBeenCalled();
                validateNewsQueryParams(getReq('health', { country: 'us' }), res, next);
                expect(next).toHaveBeenCalled();
                validateNewsQueryParams(getReq('general', { countrycode: 'nl' }), res, next);
                expect(next).toHaveBeenCalled();
                validateNewsQueryParams(getReq('sport', { country_code: 'de' }), res, next);
                expect(next).toHaveBeenCalled();
            });
        });

        describe('country code not ok', () => {
            test('validate', () => {
                expect(() => validateRequestFilter({ country: '53245' })).toThrow("Incorrect value '53245' of parameter 'country'. Must be one of: 'de', 'gb', 'nl', 'pl', 'us'.");
            });
            test('request', () => {
                validateNewsQueryParams(getReq('entertainment', { cc: '53245' }), res, next);
                expect(next).not.toHaveBeenCalled();
                validateNewsQueryParams(getReq('sport', { country: '5423' }), res, next);
                expect(next).not.toHaveBeenCalled();
                validateNewsQueryParams(getReq('sport', { countrycode: '5423' }), res, next);
                expect(next).not.toHaveBeenCalled();
                validateNewsQueryParams(getReq('science', { country_code: 'fdsgv' }), res, next);
                expect(next).not.toHaveBeenCalled();
            });
        });

        describe('language ok', () => {
            test('validate', () => {
                let filter = validateRequestFilter({ language: 'en' });
                expect(filter.lang).toBe('en');
                filter = validateRequestFilter({ lang: 'nl' });
                expect(filter.lang).toBe('nl');
            });
            test('request', () => {
                validateNewsQueryParams(getReq('general', { language: 'en' }), res, next);
                expect(next).toHaveBeenCalled();
                validateNewsQueryParams(getReq('sport', { lang: 'nl' }), res, next);
                expect(next).toHaveBeenCalled();
            });
        });

        describe('language not ok', () => {
            test('validate', () => {
                expect(() => validateRequestFilter({ lang: '53245' })).toThrow("Incorrect value '53245' of parameter 'lang'. Must be one of: 'de', 'en', 'nl', 'pl'.");
            });
            test('request', () => {
                validateNewsQueryParams(getReq('general', { language: 'gb' }), res, next);
                expect(next).not.toHaveBeenCalled();
                validateNewsQueryParams(getReq('health', { lang: '5423' }), res, next);
                expect(next).not.toHaveBeenCalled();
            });
        });

        describe('date ok', () => {
            test('validate', () => {
                const filter = validateRequestFilter({ date: '2025-01-01' });
                expect(filter.date).toBe('2025-01-01');
            });
            test('request', () => {
                validateNewsQueryParams(getReq('general', { date: '2025-01-01' }), res, next);
                expect(next).toHaveBeenCalled();
            });
        });

        describe('date not ok', () => {
            test('validate', () => {
                expect(() => validateRequestFilter({ date: '' })).toThrow("Incorrect value '' of parameter 'date'. Cannot be empty.");
            });
            test('request', () => {
                validateNewsQueryParams(getReq('sport', { date: '' }), res, next);
                expect(next).not.toHaveBeenCalled();
            });
        });

        describe('dategt ok', () => {
            test('validate', () => {
                let filter = validateRequestFilter({ dategt: '2025-01-01' });
                expect(filter.dateGt).toBe('2025-01-01');
                filter = validateRequestFilter({ date_gt: '2025-02-02' });
                expect(filter.dateGt).toBe('2025-02-02');
            });
            test('request', () => {
                validateNewsQueryParams(getReq('general', { dategt: '2025-01-01' }), res, next);
                expect(next).toHaveBeenCalled();
                validateNewsQueryParams(getReq('entertainment', { date_gt: '2025-01-01' }), res, next);
                expect(next).toHaveBeenCalled();
            });
        });

        describe('dategt not ok', () => {
            test('validate', () => {
                expect(() => validateRequestFilter({ dategt: '20250102' })).toThrow("Incorrect value '20250102' of parameter 'dategt'. Unparsable. Must follow format yyyy-MM-dd.");
            });
            test('request', () => {
                validateNewsQueryParams(getReq('sport', { dategt: 'fs' }), res, next);
                expect(next).not.toHaveBeenCalled();
                validateNewsQueryParams(getReq('sport', { date_gt: 'fs' }), res, next);
                expect(next).not.toHaveBeenCalled();
            });
        });

        describe('dategte ok', () => {
            test('validate', () => {
                let filter = validateRequestFilter({ dategte: '2025-01-01' });
                expect(filter.dateGte).toBe('2025-01-01');
                filter = validateRequestFilter({ date_gte: '2025-02-02' });
                expect(filter.dateGte).toBe('2025-02-02');
            });
            test('request', () => {
                validateNewsQueryParams(getReq('general', { dategte: '2025-01-01' }), res, next);
                expect(next).toHaveBeenCalled();
                validateNewsQueryParams(getReq('entertainment', { 'date_gte': '2025-01-01' }), res, next);
                expect(next).toHaveBeenCalled();
            });
        });

        describe('dategte not ok', () => {
            test('validate', () => {
                expect(() => validateRequestFilter({ dategte: '20250102' })).toThrow("Incorrect value '20250102' of parameter 'dategte'. Unparsable. Must follow format yyyy-MM-dd.");
            });
            test('request', () => {
                validateNewsQueryParams(getReq('sport', { dategte: 'fs' }), res, next);
                expect(next).not.toHaveBeenCalled();
                validateNewsQueryParams(getReq('sport', { date_gte: 'fs' }), res, next);
                expect(next).not.toHaveBeenCalled();
            });
        });

        describe('datelt ok', () => {
            test('validate', () => {
                let filter = validateRequestFilter({ datelt: '2025-01-01' });
                expect(filter.dateLt).toBe('2025-01-01');
                filter = validateRequestFilter({ date_lt: '2025-02-02' });
                expect(filter.dateLt).toBe('2025-02-02');
            });
            test('request', () => {
                validateNewsQueryParams(getReq('general', { datelt: '2025-01-01' }), res, next);
                expect(next).toHaveBeenCalled();
                validateNewsQueryParams(getReq('entertainment', { 'date_lt': '2025-01-01' }), res, next);
                expect(next).toHaveBeenCalled();
            });
        });

        describe('datelt not ok', () => {
            test('validate', () => {
                expect(() => validateRequestFilter({ datelt: 'abc' })).toThrow("Incorrect value 'abc' of parameter 'datelt'. Unparsable. Must follow format yyyy-MM-dd.");
            });
            test('request', () => {
                validateNewsQueryParams(getReq('sport', { datelt: 'fs' }), res, next);
                expect(next).not.toHaveBeenCalled();
                validateNewsQueryParams(getReq('sport', { date_lt: 'fs' }), res, next);
                expect(next).not.toHaveBeenCalled();
            });
        });

        describe('datelte ok', () => {
            test('validate', () => {
                let filter = validateRequestFilter({ datelte: '2025-01-01' });
                expect(filter.dateLte).toBe('2025-01-01');
                filter = validateRequestFilter({ date_lte: '2025-02-02' });
                expect(filter.dateLte).toBe('2025-02-02');
            });
            test('request', () => {
                validateNewsQueryParams(getReq('general', { datelte: '2025-01-01' }), res, next);
                expect(next).toHaveBeenCalled();
                validateNewsQueryParams(getReq('entertainment', { 'date_lte': '2025-01-01' }), res, next);
                expect(next).toHaveBeenCalled();
            });
        });

        describe('datelte not ok', () => {
            test('validate', () => {
                expect(() => validateRequestFilter({ datelte: 'abc' })).toThrow("Incorrect value 'abc' of parameter 'datelte'. Unparsable. Must follow format yyyy-MM-dd.");
            });
            test('request', () => {
                validateNewsQueryParams(getReq('sport', { datelte: 'fs' }), res, next);
                expect(next).not.toHaveBeenCalled();
                validateNewsQueryParams(getReq('sport', { date_lte: 'fs' }), res, next);
                expect(next).not.toHaveBeenCalled();
            });
        });

        describe('page ok', () => {
            test('validate', () => {
                const filter = validateRequestFilter({ page: '5' });
                expect(filter.page).toBe('5');
            });
            test('request', () => {
                validateNewsQueryParams(getReq('health', { page: '5' }), res, next);
                expect(next).toHaveBeenCalled();
            });
        });

        describe('page not ok', () => {
            test('validate', () => {
                expect(() => validateRequestFilter({ page: 'a' })).toThrow("Incorrect value 'a' of parameter 'page'. Not a number. Should be an integer greater than 0.");
                expect(() => validateRequestFilter({ page: '-1' })).toThrow("Incorrect value '-1' of parameter 'page'. Page number should be an integer greater than 0.");
            });
            test('request', () => {
                validateNewsQueryParams(getReq('health', { page: 'a' }), res, next);
                expect(next).not.toHaveBeenCalled();
                validateNewsQueryParams(getReq('health', { page: '-1' }), res, next);
                expect(next).not.toHaveBeenCalled();
            });
        });

        describe('items ok', () => {
            test('validate', () => {
                const filter = validateRequestFilter({ items: '5' });
                expect(filter.items).toBe('5');
            });
            test('request', () => {
                validateNewsQueryParams(getReq('health', { items: '5' }), res, next);
                expect(next).toHaveBeenCalled();
            });
        });

        describe('items not ok', () => {
            test('validate', () => {
                expect(() => validateRequestFilter({ items: 'a' })).toThrow("Incorrect value 'a' of parameter 'items'. Not a number. Should be an integer greater than 0 and less than or equal 500.");
                expect(() => validateRequestFilter({ items: '-1' })).toThrow("Incorrect value '-1' of parameter 'items'. Must be greater than 0.");
                expect(() => validateRequestFilter({ items: '502' })).toThrow("Incorrect value '502' of parameter 'items'. Must be less than or equal 500.");
            });
            test('request', () => {
                validateNewsQueryParams(getReq('health', { items: 'a' }), res, next);
                expect(next).not.toHaveBeenCalled();
                validateNewsQueryParams(getReq('health', { items: '-10' }), res, next);
                expect(next).not.toHaveBeenCalled();
                validateNewsQueryParams(getReq('health', { items: '501' }), res, next);
                expect(next).not.toHaveBeenCalled();
            });
        });

        describe('sortby ok', () => {
            test('validate', () => {
                let filter = validateRequestFilter({ sortby: 'id' });
                expect(filter.sortBy).toBe('id');
                filter = validateRequestFilter({ sort_by: 'timestamp_asc' });
                expect(filter.sortBy).toBe('timestamp_asc');
            });
            test('request', () => {
                validateNewsQueryParams(getReq('health', { sortby: 'id' }), res, next);
                expect(next).toHaveBeenCalled();
                validateNewsQueryParams(getReq('health', { sort_by: 'timestamp_asc' }), res, next);
                expect(next).toHaveBeenCalled();
            });
        });

        describe('sortby not ok', () => {
            test('validate', () => {
                expect(() => validateRequestFilter({ sortby: 'id_abc' })).toThrow("Incorrect value 'id_abc' of parameter 'sortby'. 'abc' is not an acceptable order value. Must be either 'asc' or 'desc'.");
                expect(() => validateRequestFilter({ sort_by: 'fsds' })).toThrow("Incorrect value 'fsds' of parameter 'sort_by'. 'fsds' is not an acceptable dimension name. Must be one of: 'id', 'timestamp'.");
            });
            test('request', () => {
                validateNewsQueryParams(getReq('health', { sortby: 'id_abc' }), res, next);
                expect(next).not.toHaveBeenCalled();
                validateNewsQueryParams(getReq('health', { sort_by: 'fsds' }), res, next);
                expect(next).not.toHaveBeenCalled();
            });
        });
    });
})