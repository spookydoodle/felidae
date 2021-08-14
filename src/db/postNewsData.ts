import { Pool } from "pg";
import { Headlines, Category, Lang } from "../logic/types";
import { TB_NEWS, DB_NAME } from "./constants";
import { qRowExists, qInsertToNews, qSelectNewsHeadlines } from "./queries";

export const postNewsDataToDb = async (pool: Pool, data: Headlines) => {
  const items: Headlines[] = [];
  let duplicateCount: number = 0;

  // Before inserting make sure data meets data type criteria defined in postgres table
  // Also, make sure entry does not exist yet; if it does, then skip it
  for (const { category, lang, headline, provider, url, timestamp } of data) {
    if (headline.length <= 150 && url.length <= 255) {
      await pool
        .query(qRowExists(TB_NEWS, [['url', 'equal', url]]))
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
          headline.length > 150
            ? `its length of ${headline.length} char (max 150)`
            : `its source url's length of ${url.length} (max 255)`
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

export const selectNewsData = async (
  pool: Pool,
  filter: SelectFilter = { category: "general", lang: "lang_en" }
): Promise<Headlines> => {
  return [];
};
