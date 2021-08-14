import express from "express";
import { getPool } from "../db";
import { selectNewsData } from "../db/postNewsData";
import { DB_NAME } from "../db/constants";
import generatePage from "../pages/generatePage";
// import { SearchResult } from "../logic/types";

const router = express.Router();
const pool = getPool(DB_NAME);

router.get("/", (req: any, res: any) => {
  res.status(200).send(generatePage("Hello from the News Scraper API."));
});

router.get("/:category", async (req, res) => {
  const { category } = req.params;
  const { lang, top } = req.query;
  console.log(lang);

  const data = await selectNewsData(pool, {
    filters: [
      ["category", "equal", category],
      ["lang", "equal", (lang as string || "lang_en")],
      // ["timestamp", "greaterOrEqual", "TODO:"],
    ],
    top: Number(top as string || 100),
  });

  res.status(200).send(data);
});

export default router;
