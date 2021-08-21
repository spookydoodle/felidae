import { Pool } from "pg";
import Scraper from "./scraper";
import { getAllResults } from "../search/searchHTML";
import { postNewsDataToDb } from "../db/postNewsData";
import { Lang, Category, SearchConfig } from "../logic/types";

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();

export const initializeNewsScrapers = (pool: Pool, config: SearchConfig) => {
  const { environment } = config;

  let scrapers: Scraper[] = [];
  const categories: Category[] = [
    "general",
    "business",
    "entertainment",
    "sport",
    "health",
    "science",
  ];
  const languages: Lang[] = ["en", "de", "nl", "pl"];

  // Set timeout for each initialization with interval of 60 seconds to prevent from 429 errors
  for (let i = 0; i < categories.length * languages.length; i++) {
    const timeout = setTimeout(async () => {
      const categoryIndex = Math.floor(i / languages.length);
      const langIndex = i % languages.length;
      const category = categories[categoryIndex];
      const lang = languages[langIndex];
      let scraper = await new Scraper(
        `${capitalize(category)} News in ${lang}`,
        () =>
          getAllResults(
            categories[categoryIndex] === "general"
              ? "news"
              : `news in category ${category}`,
            category,
            lang,
            environment === "production"
              ? 10
              : environment === "staging"
              ? 1
              : 10,
            config
          ),
        (data) => postNewsDataToDb(pool, data),
        [[i % 24, 0, 0, 0]]
      ).initialize();

      scrapers.push(scraper);
      clearTimeout(timeout);
    }, 30000 * (i + 1));
  }
};
