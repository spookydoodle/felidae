import express from "express";
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import path from 'path';
import { createHandler } from 'graphql-http/lib/use/express';
import { Pool } from "pg";
import { getPool } from "../db";
import { selectNewsData } from "../db/postNewsData";
import { DB_NAME } from "../db/constants";
import createLogMsg from "../utils/createLogMsg";
import { NewsFilterCondition, OrderBy, OrderType } from "../db/queries";
import { validateNewsQueryParams } from "./news-middleware";
import { Headline } from "../logic/types";
import { NewsRequestBody, NewsRequestParams, NewsRequestQuery, NewsResponseBody } from "./types";

let pool: Pool | undefined;
setTimeout(async () => {
    pool = await getPool(DB_NAME);
    createLogMsg(
        `Connection between router 'News' and database '${DB_NAME}' established.`,
        "info"
    );
}, 5000);

const router = express.Router();

router.use('/', swaggerUi.serve, swaggerUi.setup(
    YAML.load(path.join(__dirname, '../docs', 'news-api.yml')) as swaggerUi.JsonObject,
    {
        swaggerUrl: 'https://spookydoodle.com', 
        customSiteTitle: 'Felidae News API',
        customCss: `
            div, button, span, p, h1, h2, h3, h4, td, th { color: rgba(255, 255, 255, .8) !important; }
            body { background-color: #1C191C; } 
            .opblock.opblock-get, .swagger-ui .opblock.opblock-get .opblock-summary { border-color: rgba(255, 255, 255, .6) !important; border-bottom: 1px solid rgba(255, 255, 255, .6) !important; }
            .swagger-ui .opblock.opblock-get { background-color: #303341; }
            .scheme-container, .opblock-section-header { background-color: #303341 !important; } 
            .btn.execute.opblock-control__btn, .execute-wrapper button, button.opblock-summary-control > span { background-color: purple !important; border-color: purple !important; }
            button.models-control, button.model-box-control:focus, button.model-box-control:active { border-color: black !important; outline: none !important; }
            .opblock-title > span::after { background-color: purple !important; }
            .model-container { background-color: #303341 !important; }
            .example.microlight { background-color: #474A58 !important; }
            svg.arrow, .models-control path { stroke: rgba(255, 255, 255, .6); fill: rgba(255, 255, 255, .6); }
            .model-toggle::after { background-color: rgba(255, 255, 255, .6) !important; border-radius: 50%; }
            .loading::before { border-color: rgba(255, 255, 255, .1) !important; border-top-color: rgba(255, 255, 255, .6) !important }
            .loading::after { color: rgba(255, 255, 255, .6) !important }
            select, input { background-color: #ECEBE8 !important; color: #474A58 !important; }
            .response-control-media-type__accept-message { color: #7FB069 !important; }
            .swagger-ui .topbar { display: none; }
        `
    }
));

router.all('/graphql', createHandler({
    schema: new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'News',
            fields: {
                hello: {
                    type: GraphQLString,
                    resolve: () => 'world',
                },
            },
        }),
    })
}));

router.get<string, NewsRequestParams, NewsResponseBody, NewsRequestBody, NewsRequestQuery>(
    "/:category",
    validateNewsQueryParams,
    async (req, res) => {
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

        if (pool) {
            const data = await selectNewsData(pool, {
                filters: filters,
                orderBy: orderBy,
                top: top,
                skip: skip,
            });

            res.status(200).send(data);
        } else {
            res.status(500).send({ message: 'Database connection failed.' });
        }
    });

export default router;
