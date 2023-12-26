import express from "express";
import { Pool } from "pg";
import { getPool } from "../db";
import { selectNewsData } from "../db/postNewsData";
import { DB_NAME } from "../db/constants";
import generatePage from "../pages/generatePage";
import createLogMsg from "../utils/createLogMsg";
import dummyPageGoogle from "../search/dummyPageGoogle";
import dummyPageBing from "../search/dummyPageBing";
import { NewsFilterCondition, OrderBy, OrderType } from "../db/queries";
import { Headline } from "../logic/types";

const addQuery = (req: any, res: any, next: any) => {
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

router.get("/", (_req: any, res: any) => {
  res.status(200).send(generatePage("Hello from Felidae's News Scraper API."));
});

// Dummy page for local development - static page to avoid 429 error
router.get("/dummy/google", (req, res) => {
  res.status(200).send(dummyPageGoogle);
});
router.get("/dummy/bing", (req, res) => {
  res.status(200).send(dummyPageBing);
});

router.get("/:category", addQuery, async (req, res) => {
  const { category } = req.params;
  const { 
    cc, 
    lang, 
    date, 
    date_gt, 
    date_gte, 
    date_lt, 
    date_lte, 
    page, 
    sortBy 
  } =
    req.query;
  const pageNum = Number(page);

  const pg = page && !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
  const [top, skip] = [100, (pg - 1) * 100];

  const filters: NewsFilterCondition[] = [["category", "eq", category]];
  const orderBy: OrderBy[] = [];

  // Filtering
  if (cc) filters.push(["country", "eq", cc as string]);
  if (lang) filters.push(["lang", "eq", lang as string]);
  if (date) filters.push(["timestamp", "eq", date as string]);
  if (date_gt) filters.push(["timestamp", "gt", date_gt as string]);
  if (date_gte) filters.push(["timestamp", "gte", date_gte as string]);
  if (date_lt) filters.push(["timestamp", "lt", date_lt as string]);
  if (date_lte) filters.push(["timestamp", "lte", date_lte as string]);

  // Sorting
  if (sortBy) {
    const [name, order] = String(sortBy).split(' ');
    const names = ['id', 'timestamp'];
    if (names.includes(name)) {
      orderBy.push([
        name as keyof Headline, 
        (["ASC", "DESC"].includes(order.toUpperCase()) ? order.toUpperCase() : "DESC") as OrderType
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
