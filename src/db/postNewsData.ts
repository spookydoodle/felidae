import { Pool } from "pg";
import { Headlines } from "../logic/types";
import { NEWS_TABLE } from "./constants";

// TODO: rewrite to return a promise
export const postNewsData = async (pool: Pool, data: Headlines) => {
  const items = [];

  for (const { headline, provider, url, timestamp } of data) {
    try {
      if (headline.length <= 150 && url.length <= 255) {
        const item = await pool.query(
          `INSERT INTO ${NEWS_TABLE}(headline, provider, url, timestamp) VALUES ($1, $2, $3, to_timestamp($4)) RETURNING *;`,
          // if provider length > 40 (as defined in table column data type), 
          // then take first 40 char to avoid errors
          [headline, provider.substring(0, 40), url, timestamp]
        );
        items.push(item.rows);
        console.log("Added item to db");
      } else {
        console.log(
          `Headline: "${headline}" not added due to ${
            headline.length > 150
              ? `its length of ${headline.length} char (max 150)`
              : `its source url's length of ${url.length} (max 255)`
          }`
        );
      }
    } catch (err) {
      console.error(err);
    }
  }

  return items.flat();
};
