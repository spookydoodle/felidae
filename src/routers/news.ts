import fs from 'fs';
import path from 'path';
import { Pool } from "pg";
import protobuf from "protobufjs";
import express from "express";
import rateLimit from 'express-rate-limit';
import swaggerUi from 'swagger-ui-express';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { createHandler, parseRequestParams } from "graphql-http";
import { dateScalar, itemsScalar, pageScalar } from '../graphql/scalars';
import { getPool } from "../db";
import { DB_NAME } from "../db/constants";
import { getNewsHeadlines, validateRequestFilter, validateNewsQueryParams, validateRequestParameters, validateNewsParams } from "./news-middleware";
import { Category } from "../logic/types";
import { NewsRequestBody, NewsRequestParams, NewsRequestParamsBase, NewsRequestQuery, NewsRequestQueryAliases, NewsRequestQueryGraphQL, NewsResponseBody, NewsResponseBodyGraphQL, NewsResponseBodyGraphQLError, NewsResponseBodyGraphQLSuccess } from "./types";
import createLogMsg from "../utils/createLogMsg";

let pool: Pool | undefined;
setTimeout(async () => {
    pool = await getPool(DB_NAME);
    createLogMsg(
        `Connection between router 'News' and database '${DB_NAME}' established.`,
        "info"
    );
}, 1000);

const router = express.Router();

router.use(rateLimit({
    windowMs: 1000,
    max: 10,
    message: "Give me a break or I'll scratch you.",
}));

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

const newsHeadlinesSchema = makeExecutableSchema({
        typeDefs: fs.readFileSync(path.join(__dirname, '../graphql/schemas/news.graphql'), 'utf-8'),
        resolvers: {
            Date: dateScalar,
            Page: pageScalar,
            Items: itemsScalar,
        }
    });

const newsGraphQLHandler = createHandler<unknown, unknown, { category: Category }>({
    schema: newsHeadlinesSchema,
    context: async (req, _params) => {
        const category = (req as unknown as { params?: { category?: Category } })?.params?.['category'];
        if (!category) {
            throw new Error('Category value missing');
        }
        validateRequestParameters({ category });
        return { category }
    },
    rootValue: {
        headlines: async (filter: NewsRequestQuery & NewsRequestQueryAliases, context: { category: Category }) => {
            const validatedFilter = validateRequestFilter(filter);
            const headlines = await getNewsHeadlines(pool!, context, validatedFilter);
            return headlines;
        }
    },
});

router.all<string, NewsRequestParamsBase, NewsResponseBodyGraphQL | unknown, NewsRequestBody, NewsRequestQueryGraphQL>(
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

            res.status(200).send(body['data'] as unknown as NewsResponseBodyGraphQLSuccess);
        } catch (err) {
            res.status(400).send({ errors: [{ message: (err as Error).message || 'Unknown error', }] });
        }
    }
);

router.use<string, NewsRequestParamsBase, NewsResponseBodyGraphQL, NewsRequestBody, NewsRequestQueryGraphQL>(
    '/:category/graphiql',
    (_req, res) => {
        res.sendFile(path.join(__dirname, '../../public/html/graphiql.html'));
    }
);


router.get<string, NewsRequestParams, NewsResponseBody | Uint8Array<ArrayBufferLike>, NewsRequestBody, NewsRequestQuery & NewsRequestQueryAliases>(
    "/:category/:format?",
    validateNewsParams,
    validateNewsQueryParams,
    async (req, res) => {
        if (!pool) {
            res.status(500).send({ reason: 'Database connection failed.' });
            return;
        };

        const { category, format = 'json' } = req.params;
        const { country, lang, date, dateGt, dateGte, dateLt, dateLte, page, items = '100', sortBy } = req.query;
        try {
            const data = await getNewsHeadlines(pool, { category }, { country, lang, date, dateGt, dateGte, dateLt, dateLte, page, items, sortBy });
            switch (format) {
                case 'json':
                    res.status(200).send(data);
                    break;
                case 'pbf': {
                    protobuf.load(path.join(__dirname, '../proto/news.proto'), function (err, root) {
                        if (err) {
                            throw err;
                        }
                        if (!root) {
                            throw Error('No pbf root');
                        }
                        const AwesomeMessage = root.lookupType("newspackage.Headlines");
                        const errMsg = AwesomeMessage.verify(data);
                        if (errMsg)
                            throw Error(errMsg);
                        const message = AwesomeMessage.create({ headlines: data.map(({ timestamp, ...rest }) => ({ timestamp: timestamp.valueOf(), ...rest })) }); // or use .fromObject if conversion is necessary
                        const buffer = AwesomeMessage.encode(message).finish();
                        res.status(200).send(buffer);

                        const messageDecoded = AwesomeMessage.decode(buffer);
                        console.log({messageDecoded: Object.values(messageDecoded.toJSON())[0]})
                        // const object = AwesomeMessage.toObject(messageDecoded, {
                        //     longs: String,
                        //     enums: String,
                        //     bytes: String,
                        //     // see ConversionOptions
                        // });
                    });   
                    break;
                }
            }
        } catch (err) {
            res.status(400).send({ reason: (err as Error).message || 'Unknown error' });
        }
    }
);

export default router;
