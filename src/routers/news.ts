import express from "express";
import { Pool } from "pg";
import { getPool } from "../db";
import { selectNewsData } from "../db/postNewsData";
import { DB_NAME } from "../db/constants";
import generatePage from "../pages/generatePage";
import createLogMsg from "../utils/createLogMsg";
import { NewsFilterCondition, OrderBy, OrderType } from "../db/queries";
import { Headline } from "../logic/types";

const addQuery = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    const { page } = req.query;
    if (page && (isNaN(Number(page)) || Number(page) < 1)) {
        const { baseUrl, url } = req;
        res.redirect(`${baseUrl}${url.replace(`page=${page}`, "page=1")}`);
    } else {
        next();
    }
};

// Initialize router
const router = express.Router();

// Initialize PostgreSQL - give timeout for the first run, if DB_NAME does not exist, it will first need to be created
let pool: Pool | undefined;
setTimeout(async () => {
    pool = await getPool(DB_NAME);
    createLogMsg(
        `Connection between router 'News' and database '${DB_NAME}' established.`,
        "info"
    );
}, 5000);

router.get("/", (_req, res) => {
    res.status(200).send(generatePage("Hello from Felidae's News Scraper API."));
});

router.get("/:category", addQuery, async (req, res) => {
    const { category } = req.params;
    const {
        cc,
        lang,
        date,
        page
    } = req.query;

    const dateGt = req.query.dateGt || req.query['date-gt'] || req.query.date_gt;
    const dateGte = req.query.dateGte || req.query['date-gte'] || req.query.date_gte;
    const dateLt = req.query.dateLt || req.query['date-lt'] || req.query.date_lt;
    const dateLte = req.query.dateLte || req.query['date-lte'] || req.query.date_lte;
    const sortBy = req.query.sortBy || req.query['sort-by'] || req.query.sort_by;

    const pageNum = Number(page);

    const pg = page && !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
    const [top, skip] = [100, (pg - 1) * 100];

    const filters: NewsFilterCondition[] = [["category", "eq", category]];
    const orderBy: OrderBy[] = [];

    if (cc) filters.push(["country", "eq", cc.toString()]);
    if (lang) filters.push(["lang", "eq", lang.toString()]);
    if (date) filters.push(["timestamp", "eq", date.toString()]);
    if (dateGt) filters.push(["timestamp", "gt", dateGt.toString()]);
    if (dateGte) filters.push(["timestamp", "gte", dateGte.toString()]);
    if (dateLt) filters.push(["timestamp", "lt", dateLt.toString()]);
    if (dateLte) filters.push(["timestamp", "lte", dateLte.toString()]);

    if (sortBy) {
        const [name, order] = String(sortBy).split(' ');
        const names = ['id', 'timestamp'];
        if (names.includes(name)) {
            orderBy.push([
                name as keyof Headline,
                (["ASC", "DESC"].includes(order.toUpperCase()) ? order.toUpperCase() as OrderType : "DESC")
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
