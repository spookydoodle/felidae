import { Pool } from "pg";
import Scraper from "./scraper";
import { getAllResults } from "../search/searchHTML";
import { postNewsDataToDb } from "../db/postNewsData";
import { Lang, Category, SearchConfig, Country } from "../logic/types";

const capitalize = (text: string) =>
  text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();

export const initializeNewsScrapers = (pool: Pool, config: SearchConfig) => {
  const { environment, maxPageIndex, updateFreqInHrs } = config;

  let scrapers: Scraper[] = [];
  const categories: Category[] = [
    "general",
    "business",
    "entertainment",
    "sport",
    "health",
    "science",
  ];
  const countryLang: { [key in Country]: Lang } = {
    "gb": "en",
    "us": "en",
    "de": "de",
    "nl": "nl",
    "pl": "pl",
  }

  const countries = Object.keys(countryLang);

  // Set timeout for each initialization with interval of 60 seconds to prevent from 429 errors
  for (let i = 0; i < categories.length * countries.length; i++) {
    const timeout = setTimeout(async () => {
      const categoryIndex = Math.floor(i / countries.length);
      const countryIndex = i % countries.length;
      const category = categories[categoryIndex];
      const country = countries[countryIndex] as Country;
      const lang = countryLang[country];
      let scraper = await new Scraper(
        `${capitalize(category)} News from ${country} in ${lang}`,
        () =>
          getAllResults(
            categories[categoryIndex] === "general"
              ? "news today"
              : `news in category ${category}`,
            category,
            country,
            lang,
            maxPageIndex ||
              (environment === "production"
                ? 10
                : environment === "staging"
                ? 1
                : 10),
            config
          ),
        (data) => postNewsDataToDb(pool, data),
        [[i % (updateFreqInHrs || 24), 0, 0, 0]]
      ).initialize();

      scrapers.push(scraper);
      clearTimeout(timeout);
    }, 30000 * (i + 1));
  }
};
