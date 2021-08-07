import express from "express";
import { getAllResults } from "../search/searchHTML";
import { SearchResult } from "../logic/types";
import generatePage from '../pages/generatePage';

const router = express.Router();

router.get("/", (req: any, res: any) => {
  res.status(200).send(generatePage('Hello from the News Scraper API.'));
});

router.get("/general", (req: any, res: any) => {
  getAllResults("news", 10, "lang_en")
    .then((data: SearchResult) => {
      res.status(200).send(data);
    })
    .catch((err: any) => {
      res.status(500).send({
        error: "Unknown error",
      });
    });
});

export default router;
