import { Pool } from "pg";
import { Headlines } from "../logic/types";
import { NEWS_TABLE } from "./constants";
console.log(NEWS_TABLE)
// TODO: rewrite to return a promise
export const postNewsData = async (pool: Pool, data: Headlines) => {
  for (const { headline, provider, url, timestamp } of data) {
    try {
      if (headline.length <= 150) {
        await pool.query(
            `INSERT INTO ${NEWS_TABLE}(headline, provider, url, timestamp) VALUES ($1, $2, $3, to_timestamp($4))`,
            [headline, provider, url, timestamp]
          );
          console.log("Added item to db");
      } else {
          console.log(`Headline: "${headline}" not added due to its length of ${headline.length} char (max 150)`)
      }
      
    } catch (err) {
      console.error(err);
    }
  }
};
