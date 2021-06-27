import express from "express";
import { getResults } from "../search/searchHTML";
import { SearchResult } from "../logic/types";

const router = express.Router();

router.get("/", (req: any, res: any) => {
  getResults("news", 1, "lang_en").then((data: SearchResult) =>
    res.status(200).send(data)
  );
});

export default router;
