import { Pool } from "pg";
import Scraper from "./scraper";
import { getAllResults } from "../search/searchHTML";
import { postNewsDataToDb } from "../db/postNewsData";
import { Lang, Category } from "../logic/types";

export const initializeNewsScrapers = (pool: Pool, dbName: string) => {
    let scrapers: Scraper[] = [];
    const categories: Category[] = [
      "general",
      "business",
      "entertainment",
      "sport",
      "health",
      "science",
    ];
    const languages: Lang[] = ["lang_en", "lang_de", "lang_nl", "lang_pl"];
    
    // Set timeout for each initialization to prevent from 429 errors
    for (let i = 0; i < languages.length * categories.length; i++) {
      const timeout = setTimeout(async () => {
        const categoryIndex = Math.floor(i / languages.length);
        const langIndex = i % languages.length;
        let scraper = await new Scraper(
          `${categories[categoryIndex]} News`,
          () =>
            getAllResults(
              categories[categoryIndex] === "general"
                ? "news"
                : `news in category ${categories[categoryIndex]}`,
              languages[langIndex],
              1
            ),
          (data) => postNewsDataToDb(pool, data),
          [[2, 0, 0, 0]]
        ).initialize();

        scrapers.push(scraper);
        clearTimeout(timeout);
      }, 10000 * (i + 1));
    }
}