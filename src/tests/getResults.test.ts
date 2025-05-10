import express from "express";
import { getMockReq, getMockRes } from '@jest-mock/express'
import { validateNewsQueryParams } from "../routers/news-middleware";
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

        test('locale ok', () => {
            validateNewsQueryParams(getReq('sport', { locale: 'de-de' }), res, next);
            expect(next).toHaveBeenCalled();
            // expect(res.statusCode).toBe(200);
        });

        test('locale not ok', () => {
            validateNewsQueryParams(getReq('sport', { locale: 'a'}), res, next);
            expect(next).not.toHaveBeenCalled();
            // expect(res.statusCode).toBe(400);
        });

        test('country code ok', () => {
            validateNewsQueryParams(getReq('entertainment', { cc: 'gb' }), res, next);
            expect(next).toHaveBeenCalled();
            validateNewsQueryParams(getReq('general', { countrycode: 'nl' }), res, next);
            expect(next).toHaveBeenCalled();
            validateNewsQueryParams(getReq('business', { 'country-code': 'pl' }), res, next);
            expect(next).toHaveBeenCalled();
            validateNewsQueryParams(getReq('sport', { country_code: 'de' }), res, next);
            expect(next).toHaveBeenCalled();
        });

        test('country code not ok', () => {
            validateNewsQueryParams(getReq('entertainment', { cc: '53245' }), res, next);
            expect(next).not.toHaveBeenCalled();
            validateNewsQueryParams(getReq('sport', { countrycode: '5423' }), res, next);
            expect(next).not.toHaveBeenCalled();
            validateNewsQueryParams(getReq('business', { 'country-code': '532' }), res, next);
            expect(next).not.toHaveBeenCalled();
            validateNewsQueryParams(getReq('science', { country_code: 'fdsgv' }), res, next);
            expect(next).not.toHaveBeenCalled();
        });

        test('language ok', () => {
            validateNewsQueryParams(getReq('general', { language: 'en' }), res, next);
            expect(next).toHaveBeenCalled();
            validateNewsQueryParams(getReq('sport', { lang: 'nl' }), res, next);
            expect(next).toHaveBeenCalled();
        });

        test('language not ok', () => {
            validateNewsQueryParams(getReq('general', { language: 'gb' }), res, next);
            expect(next).not.toHaveBeenCalled();
            validateNewsQueryParams(getReq('health', { lang: '5423' }), res, next);
            expect(next).not.toHaveBeenCalled();
        });

        test('date ok', () => {
            validateNewsQueryParams(getReq('general', { date: '2025-01-01' }), res, next);
            expect(next).toHaveBeenCalled();
        });

        test('date not ok', () => {
            validateNewsQueryParams(getReq('sport', { date: ''}), res, next);
            expect(next).not.toHaveBeenCalled();
        });

        test('dategt ok', () => {
            validateNewsQueryParams(getReq('general', { dategt: '2025-01-01' }), res, next);
            expect(next).toHaveBeenCalled();
            validateNewsQueryParams(getReq('business', { 'date-gt': '2024-02-05' }), res, next);
            expect(next).toHaveBeenCalled();
            validateNewsQueryParams(getReq('entertainment', { 'date_gt': '2025-01-01' }), res, next);
            expect(next).toHaveBeenCalled();
        });

        test('dategt not ok', () => {
            validateNewsQueryParams(getReq('sport', { dategt: 'fs'}), res, next);
            expect(next).not.toHaveBeenCalled();
            validateNewsQueryParams(getReq('sport', { 'date-gt': 'fs'}), res, next);
            expect(next).not.toHaveBeenCalled();
            validateNewsQueryParams(getReq('sport', { date_gt: 'fs'}), res, next);
            expect(next).not.toHaveBeenCalled();
        });

        test('dategte ok', () => {
            validateNewsQueryParams(getReq('general', { dategte: '2025-01-01' }), res, next);
            expect(next).toHaveBeenCalled();
            validateNewsQueryParams(getReq('business', { 'date-gte': '2024-02-05' }), res, next);
            expect(next).toHaveBeenCalled();
            validateNewsQueryParams(getReq('entertainment', { 'date_gte': '2025-01-01' }), res, next);
            expect(next).toHaveBeenCalled();
        });

        test('dategte not ok', () => {
            validateNewsQueryParams(getReq('sport', { dategte: 'fs'}), res, next);
            expect(next).not.toHaveBeenCalled();
            validateNewsQueryParams(getReq('sport', { 'date-gte': 'fs'}), res, next);
            expect(next).not.toHaveBeenCalled();
            validateNewsQueryParams(getReq('sport', { date_gte: 'fs'}), res, next);
            expect(next).not.toHaveBeenCalled();
        });

        test('datelt ok', () => {
            validateNewsQueryParams(getReq('general', { datelt: '2025-01-01' }), res, next);
            expect(next).toHaveBeenCalled();
            validateNewsQueryParams(getReq('business', { 'date-lt': '2024-02-05' }), res, next);
            expect(next).toHaveBeenCalled();
            validateNewsQueryParams(getReq('entertainment', { 'date_lt': '2025-01-01' }), res, next);
            expect(next).toHaveBeenCalled();
        });

        test('datelt not ok', () => {
            validateNewsQueryParams(getReq('sport', { datelt: 'fs'}), res, next);
            expect(next).not.toHaveBeenCalled();
            validateNewsQueryParams(getReq('sport', { 'date-lt': 'fs'}), res, next);
            expect(next).not.toHaveBeenCalled();
            validateNewsQueryParams(getReq('sport', { date_lt: 'fs'}), res, next);
            expect(next).not.toHaveBeenCalled();
        });

        test('datelte ok', () => {
            validateNewsQueryParams(getReq('general', { datelte: '2025-01-01' }), res, next);
            expect(next).toHaveBeenCalled();
            validateNewsQueryParams(getReq('business', { 'date-lte': '2024-02-05' }), res, next);
            expect(next).toHaveBeenCalled();
            validateNewsQueryParams(getReq('entertainment', { 'date_lte': '2025-01-01' }), res, next);
            expect(next).toHaveBeenCalled();
        });

        test('datelte not ok', () => {
            validateNewsQueryParams(getReq('sport', { datelte: 'fs'}), res, next);
            expect(next).not.toHaveBeenCalled();
            validateNewsQueryParams(getReq('sport', { 'date-lte': 'fs'}), res, next);
            expect(next).not.toHaveBeenCalled();
            validateNewsQueryParams(getReq('sport', { date_lte: 'fs'}), res, next);
            expect(next).not.toHaveBeenCalled();
        });

        test('page ok', () => {
            validateNewsQueryParams(getReq('health', { page: '5' }), res, next);
            expect(next).toHaveBeenCalled();
        });

        test('page not ok', () => {
            validateNewsQueryParams(getReq('health', { page: 'a'}), res, next);
            expect(next).not.toHaveBeenCalled();
        });

        test('items ok', () => {
            validateNewsQueryParams(getReq('health', { items: '5' }), res, next);
            expect(next).toHaveBeenCalled();
        });

        test('items not ok', () => {
            validateNewsQueryParams(getReq('health', { items: 'a'}), res, next);
            expect(next).not.toHaveBeenCalled();
            validateNewsQueryParams(getReq('health', { items: '-10'}), res, next);
            expect(next).not.toHaveBeenCalled();
            validateNewsQueryParams(getReq('health', { items: '501'}), res, next);
            expect(next).not.toHaveBeenCalled();
        });

        test('sortby ok', () => {
            validateNewsQueryParams(getReq('health', { sortby: 'id' }), res, next);
            expect(next).toHaveBeenCalled();
            validateNewsQueryParams(getReq('health', { 'sort-by': 'id desc' }), res, next);
            expect(next).toHaveBeenCalled();
            validateNewsQueryParams(getReq('health', { sort_by: 'timestamp  asc' }), res, next);
            expect(next).toHaveBeenCalled();
        });

        test('sortby not ok', () => {
            validateNewsQueryParams(getReq('health', { sortby: 'id abc' }), res, next);
            expect(next).not.toHaveBeenCalled();
            validateNewsQueryParams(getReq('health', { 'sort-by': 'dsg' }), res, next);
            expect(next).not.toHaveBeenCalled();
            validateNewsQueryParams(getReq('health', { sort_by: 'fsds' }), res, next);
            expect(next).not.toHaveBeenCalled();
        });
    });
})