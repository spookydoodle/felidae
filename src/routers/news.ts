import fs from 'fs';
import path from 'path';
import express, { Request, Response } from "express";
import swaggerUi from 'swagger-ui-express';
import { buildSchema } from 'graphql';
import { createHandler, parseRequestParams } from "graphql-http";
import { Pool } from "pg";
import { getPool } from "../db";
import { selectNewsData } from "../db/postNewsData";
import { DB_NAME } from "../db/constants";
import createLogMsg from "../utils/createLogMsg";
import { NewsFilterCondition, OrderBy, OrderType } from "../db/queries";
import { validateNewsQueryParams } from "./news-middleware";
import { Headline } from "../logic/types";
import { NewsRequestBody, NewsRequestParams, NewsRequestQuery, NewsRequestQueryGraphQL, NewsResponseBody, NewsResponseBodyGraphQL, NewsResponseBodyGraphQLError, NewsResponseBodyGraphQLSuccess } from "./types";

let pool: Pool | undefined;
setTimeout(async () => {
    pool = await getPool(DB_NAME);
    createLogMsg(
        `Connection between router 'News' and database '${DB_NAME}' established.`,
        "info"
    );
}, 5000);

const router = express.Router();

router.get('/', (_req, res) => res.redirect('/news/docs'));
router.use('/docs', swaggerUi.serve);
router.get('/docs', swaggerUi.setup(
    null,
    {
        swaggerUrl: '/docs/news-api.yml',
        customCssUrl: '/css/news-docs.css',
        customSiteTitle: 'Felidae News API'
    }
));

const newsGraphQLHandler = createHandler<unknown, unknown, { headlines: Headline[] }>({
    schema: buildSchema(fs.readFileSync(path.join(__dirname, './news.graphql'), 'utf-8')),
    rootValue: { headlines: (_: unknown, context: { headlines: Headline[] }) => context.headlines },
    context: async (req) => {
        const headlines = await getNewsHeadlines(pool!, req as unknown as Request<NewsRequestParams, NewsResponseBody, undefined, NewsRequestQuery>);
        return { headlines };
    },
});

router.all<string, NewsRequestParams, NewsResponseBodyGraphQL, NewsRequestBody, NewsRequestQueryGraphQL>(
    '/:category/graphql',
    async (req, res) => {
        if (!pool) {
            res.status(500).send({ errors: [{ message: 'Database connection failed', }] });
            return;
        };
        try {
            const maybeParams = await parseRequestParams(req as unknown as (Parameters<typeof parseRequestParams>[0]));
            console.log({ maybeParams, params: req.params, query: req.query })
            if (!maybeParams) {
                throw new Error('Missing query data');
            }

            const response = await newsGraphQLHandler(req as unknown as (Parameters<typeof parseRequestParams>[0]));
            if (!response?.[0]) {
                throw new Error('Could not get data');
            }
            const body = JSON.parse(response[0]);
            const status = response?.[1]?.status ?? 500;
            if (status !== 200 || 'errors' in body) {
                res.status(status).send(body as NewsResponseBodyGraphQLError);
                return;
            }
            const headlines = body['data']['headlines'] as unknown as NewsResponseBodyGraphQLSuccess;
            res.status(200).send(headlines);
        } catch (err) {
            res.status(400).send({ errors: [{ message: (err as Error).message || 'Unknown error', }] });
        }
    });

router.get<string, NewsRequestParams, NewsResponseBody, NewsRequestBody, NewsRequestQuery>(
    "/:category",
    validateNewsQueryParams,
    async (req: Request<NewsRequestParams, NewsResponseBody, undefined, NewsRequestQuery>, res: Response<NewsResponseBody>) => {
        if (!pool) {
            res.status(500).send({ reason: 'Database connection failed.' });
            return;
        };
        try {
            const data = await getNewsHeadlines(pool, req);
            res.status(200).send(data);
        } catch (err) {
            res.status(400).send({ reason: (err as Error).message || 'Unknown error' });
        }
    }
);

const getNewsHeadlines = async (pool: Pool, req: Request<NewsRequestParams, NewsResponseBody, undefined, NewsRequestQuery>) => {
    if (!pool) {
        throw new Error('Database connection failed.')
    };
    const { category } = req.params;
    const { country, lang, date, dateGt, dateGte, dateLt, dateLte, page, items = '100', sortBy } = req.query;

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
        const [name, order = 'asc'] = sortBy.toString().split(' ');
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

export default router;
