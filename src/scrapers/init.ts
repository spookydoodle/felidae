import { Pool } from "pg";
import Scraper from "./scraper";
import { getAllResults } from "../search/searchHTML";
import { postNewsDataToDb } from "../db/postNewsData";
import { SearchConfig, Country } from "../logic/types";
import { categories, countryLang, queries } from "./constants";
import { capitalize } from "../utils/stringTransform";

export const initializeNewsScrapers = (pool: Pool, config: SearchConfig) => {
  const { maxPageIndex } = config;

  const scrapers: Scraper[] = [];

  const countries = Object.keys(countryLang);

  // Set timeout for each initialization with interval of 60 seconds to prevent from 429 errors
  for (let i = 0; i < categories.length * countries.length; i++) {
    const timeout = setTimeout(async () => {
      const categoryIndex = Math.floor(i / countries.length);
      const countryIndex = i % countries.length;
      const category = categories[categoryIndex];
      const country = countries[countryIndex] as Country;
      const lang = countryLang[country];
      const scraper = await new Scraper(
        `${capitalize(category)} News from ${country} in ${lang}`,
        () =>
          getAllResults(
            queries[lang][category],
              { category, country, lang },
            maxPageIndex ||
              10,
            config
          ),
        (data) => postNewsDataToDb(pool, data),
        new Array(12).fill(null).map((_el, i) => [i * 2, 0, 0, 0]), // Update to be done every two hours
        15 * 60 * 1000 // Update check every 15 min
      ).initialize();

      scrapers.push(scraper);
      clearTimeout(timeout);
    }, 30000 * (i + 1));
  }
};
