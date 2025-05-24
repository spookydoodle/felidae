import fs from 'fs';
import path from 'path';
import { Pool } from "pg";
import express, { Request, Response } from "express";
import swaggerUi from 'swagger-ui-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { createHandler, parseRequestParams } from "graphql-http";
import { dateScalar } from '../graphql/scalars';
import { getPool } from "../db";
import { DB_NAME } from "../db/constants";
import { selectNewsData } from "../db/postNewsData";
import { NewsFilterCondition, OrderBy, OrderType } from "../db/queries";
import { validateFilter, validateNewsQueryParams } from "./news-middleware";
import { Category, Headline } from "../logic/types";
import createLogMsg from "../utils/createLogMsg";
import { NewsRequestBody, NewsRequestParams, NewsRequestQuery, NewsRequestQueryGraphQL, NewsResponseBody, NewsResponseBodyGraphQL, NewsResponseBodyGraphQLError, NewsResponseBodyGraphQLSuccess } from "./types";

let pool: Pool | undefined;
setTimeout(async () => {
    pool = await getPool(DB_NAME);
    createLogMsg(
        `Connection between router 'News' and database '${DB_NAME}' established.`,
        "info"
    );
}, 1000);

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

const newsGraphQLHandler = createHandler<unknown, unknown, { category: Category }>({
    schema: makeExecutableSchema({
        typeDefs: fs.readFileSync(path.join(__dirname, '../graphql/schemas/news.graphql'), 'utf-8'),
        resolvers: {
            Date: dateScalar
        },
    }),
    rootValue: {
        headlines: async (filter: NewsRequestQuery, context: { category: Category }) => {
            const validatedFilter = validateFilter(filter);
            const headlines = await getNewsHeadlines(pool!, context, validatedFilter);
            return headlines;
        }
    },
    context: async (req, _params) => {
        const category = (req as unknown as { params?: { category?: Category } })?.params?.['category'];
        if (!category) {
            throw new Error('Category value missing');
        }
        return { category }
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

            res.status(200).send(body['data']['headlines'] as unknown as NewsResponseBodyGraphQLSuccess);
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

        const { category } = req.params;
        const { country, lang, date, dateGt, dateGte, dateLt, dateLte, page, items = '100', sortBy } = req.query;
        try {
            const data = await getNewsHeadlines(pool, { category }, { country, lang, date, dateGt, dateGte, dateLt, dateLte, page, items, sortBy });
            res.status(200).send(data);
        } catch (err) {
            res.status(400).send({ reason: (err as Error).message || 'Unknown error' });
        }
    }
);

const getNewsHeadlines = async (pool: Pool, params: NewsRequestParams, query: NewsRequestQuery) => {
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
