import { Pool } from "pg";
import { Headlines, Category, Lang } from "../logic/types";
import { TB_NEWS, DB_NAME } from "./constants";
import { qRowExists, qInsertToNews, qSelectNewsHeadlines, SelectConfig, newsTbDataTypeLengths } from "./queries";

export const postNewsDataToDb = async (pool: Pool, data: Headlines) => {
  const items: Headlines[] = [];
  let duplicateCount: number = 0;
  const { categoryLen, langLen, headlineLen, providerLen, urlLen } = newsTbDataTypeLengths;

  // Before inserting make sure data meets data type criteria defined in postgres table
  // Also, make sure entry does not exist yet; if it does, then skip it
  for (const { category, lang, headline, provider, url, timestamp } of data) {
    if (
      category.length <= categoryLen &&
      lang.length <= langLen &&
      headline.length <= headlineLen && 
      provider.length <= providerLen &&
      url.length <= urlLen
      ) {
      await pool
        .query(qRowExists(TB_NEWS, [["url", "equal", url]]))
        .then(async ({ rows }) => {
          // Don't check type, just value
          if (rows[0].count == 0) {
            await pool
              .query(qInsertToNews(TB_NEWS), [
                category,
                lang,
                headline,
                provider.substring(0, 40),
                url,
                timestamp,
              ])
              .then(({ rows }) => items.push(rows))
              .catch((err) => console.log("Error inserting data: ", err));
          } else {
            duplicateCount++;
          }
        })
        .catch((err) => console.log("Error checking for duplicates: ", err));
    } else {
      console.log(
        `Headline: "${headline}" not added due to ${
          category.length > categoryLen
            ? `its category '${category}' length of ${category.length} (max ${categoryLen})`
            : lang.length > langLen 
            ? `its lang '${lang}' length of ${lang.length} (max ${langLen})` 
            : headline.length > headlineLen
            ? `its headline length of ${headline.length} char (max ${headlineLen})`
            : provider.length > providerLen
            ? `its provider length of ${provider.length} char (max ${providerLen})`
            : `its url length of ${url.length} (max ${urlLen})`
        }`
      );
    }
  }

  console.log(
    `Added ${items.length} items to ${TB_NEWS} table in ${DB_NAME} data base. ${duplicateCount} duplicate url's omitted.`
  );

  return items.flat();
};

// Mandatory to provide category and language; default general in English
interface SelectFilter {
  category: Category;
  lang: Lang;
  provider?: string;
  dateFrom?: number;
  dateTo?: number;
}

export const selectNewsData = (
  pool: Pool,
  selectConfig: SelectConfig = {}
): Promise<Headlines> =>
  pool
    .query(qSelectNewsHeadlines(TB_NEWS, ["category", "lang", "headline", "provider", "url", "timestamp"], selectConfig))
    .then((res) => res.rows)
    .catch((err) => {
      console.log(err);
      return [];
    });
