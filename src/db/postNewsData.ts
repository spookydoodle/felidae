import { Pool } from "pg";
import { Headlines } from "../logic/types";
import { NEWS_TABLE, DB_NAME } from "./constants";

const qUrlExists = (url: string) =>
  `SELECT COUNT(*) FROM ${NEWS_TABLE} WHERE url = '${url}';`;

const qInsert = () =>
  `INSERT INTO ${NEWS_TABLE}(category, lang, headline, provider, url, timestamp) 
  VALUES ($1, $2, $3, $4, $5, to_timestamp($6)) RETURNING *;`;

export const postNewsData = async (pool: Pool, data: Headlines) => {
  const items: Headlines[] = [];
  let duplicateCount: number = 0;

  // Before inserting make sure data meets data type criteria defined in postgres table
  // Also, make sure entry does not exist yet; if it does, then skip it
  for (const { category, lang, headline, provider, url, timestamp } of data) {
    if (headline.length <= 150 && url.length <= 255) {
      await pool
        .query(qUrlExists(url))
        .then(async ({ rows }) => {
          // Don't check type, just value
          if (rows[0].count == 0) {
            await pool
              .query(qInsert(), [
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
    `Added ${items.length} items to ${NEWS_TABLE} table in ${DB_NAME} data base. ${duplicateCount} duplicate url's omitted.`
  );
  return items.flat();
};
