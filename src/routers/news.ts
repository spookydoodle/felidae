import express from "express";
import { Pool } from "pg";
import { getPool } from "../db";
import { selectNewsData } from "../db/postNewsData";
import { DB_NAME } from "../db/constants";
import generatePage from "../pages/generatePage";
import createLogMsg from "../utils/createLogMsg";
import dummyPageGoogle from "../search/dummyPageGoogle";
import dummyPageBing from "../search/dummyPageBing";
import { NewsFilterCondition } from "../db/queries";

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
setTimeout(() => {
  pool = getPool(DB_NAME);
  createLogMsg(
    `Connection between router 'News' and database '${DB_NAME}' established.`,
    "info"
  );
}, 5000);

router.get("/", (req: any, res: any) => {
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
  const { cc, lang, date, date_gt, date_gte, date_lt, date_lte, page } =
    req.query;
  const pageNum = Number(page);

  const pg = page && !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
  const [top, skip] = [100, (pg - 1) * 100];

  const filters: NewsFilterCondition[] = [["category", "eq", category]];

  if (cc) filters.push(["country", "eq", cc as string]);
  if (lang) filters.push(["lang", "eq", lang as string]);
  if (date) filters.push(["timestamp", "eq", date as string]);
  if (date_gt) filters.push(["timestamp", "gt", date_gt as string]);
  if (date_gte) filters.push(["timestamp", "gte", date_gte as string]);
  if (date_lt) filters.push(["timestamp", "lt", date_lt as string]);
  if (date_lte) filters.push(["timestamp", "lte", date_lte as string]);

  if (pool) {
    const data = await selectNewsData(pool, {
      filters: filters,
      top: top,
      skip: skip,
    });

    res.status(200).send(data);
  } else {
    res.status(200).send([]);
  }
});

export default router;
