import express from "express";
import { getPool } from "../db";
import { selectNewsData } from "../db/postNewsData";
import { DB_NAME } from "../db/constants";
import generatePage from "../pages/generatePage";
// import { SearchResult } from "../logic/types";

const addQuery = (req: any, res: any, next: any) => {
  const { page } = req.query;
  if (page && (isNaN(Number(page)) || Number(page) < 1)) {
    const { baseUrl, url } = req;
    res.redirect(`${baseUrl}${url.replace(`page=${page}`, "page=1")}`);
  } else {
    next();
  }
};

const router = express.Router();
const pool = getPool(DB_NAME);

router.get("/", (req: any, res: any) => {
  res.status(200).send(generatePage("Hello from the News Scraper API."));
});

router.get("/:category", addQuery, async (req, res) => {
  const { category } = req.params;
  const { lang, page } = req.query;
  const pageNum = Number(page);

  const pg = (page && !isNaN(pageNum) && pageNum > 0) ? pageNum : 1;
  const [top, skip] = [100, (pg - 1) * 100];

  const data = await selectNewsData(pool, {
    filters: [
      ["category", "equal", category],
      ["lang", "equal", (lang as string) || "lang_en"],
      // ["timestamp", "greaterOrEqual", "TODO:"],
    ],
    top: top,
    skip: skip,
    // top: Number(top as string || 100),
    // skip: Number(skip as string || 100),
  });

  res.status(200).send(data);
});

export default router;
