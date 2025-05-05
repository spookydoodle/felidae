import { Pool } from "pg";
import { Headline, Headlines } from "../logic/types";
import createLogMsg from "../utils/createLogMsg";
import { TB_NEWS, DB_NAME } from "./constants";
import {
  qRowExists,
  qInsertToNews,
  qSelectNewsHeadlines,
  SelectConfig,
  newsTbDataTypeLengths,
} from "./queries";

export const postNewsDataToDb = async (pool: Pool, data: Headlines) => {
  const items: Headlines[] = [];
  let duplicateCount = 0;
  const {
    categoryLen,
    countryLen,
    langLen,
    headlineLen,
    providerLen,
    urlLen,
    ageLen,
  } = newsTbDataTypeLengths;

  //   TODO: Rewrite
  // Before inserting make sure data meets data type criteria defined in postgres table
  // Also, make sure entry does not exist yet; if it does, then skip it
  for (const {
    category,
    country,
    lang,
    headline,
    provider,
    url,
    img,
    age,
    timestamp
  } of data) {
    if (category.length > categoryLen) {
      createLogMsg(`Headline: "${headline}" not added due to its category '${category}' length of ${category.length} (max ${categoryLen})`, "error");
      continue;
    }
    if (country.length > countryLen) {
      createLogMsg(`Headline: "${headline}" not added due to its country '${country}' length of ${country.length} (max ${countryLen})`, "error");
      continue;
    }
    if (lang.length > langLen) {
      createLogMsg(`Headline: "${headline}" not added due to its lang '${lang}' length of ${lang.length} (max ${langLen})`, "error");
      continue;
    }
    if (headline.length > headlineLen) {
      createLogMsg(`Headline: "${headline}" not added due to its headline length of ${headline.length} char (max ${headlineLen})`, "error");
      continue;
    }
    if (provider.length > providerLen) {
      createLogMsg(`Headline: "${headline}" not added due to its provider length of ${provider.length} char (max ${providerLen})`, "error");
      continue;
    }
    if (age.length > ageLen) {
      createLogMsg(`Headline: "${headline}" not added due to its age length of ${age.length} char (max ${ageLen})`, "error");
      continue;
    }
    if (url.length > urlLen) {
      createLogMsg(`Headline: "${headline}" not added due to its url length of ${url.length} (max ${urlLen})`, "error");
      continue;
    }
    
    await pool
      .query(qRowExists(TB_NEWS, [["url", "eq", url]]))
      .then(async ({ rows }) => {
        // Don't check type, just value
        if (rows[0].count == 0) {
          await pool
            .query<Headline>(qInsertToNews(TB_NEWS), [
              category,
              country,
              lang,
              headline,
              provider.substring(0, 40),
              url,
              (img ?? '').length <= urlLen ? img : null,
              age,
              timestamp
            ])
            .then(({ rows }) => items.push(rows))
            .catch((err) => console.log("Error inserting data: ", err));
        } else {
          duplicateCount++;
        }
      })
      .catch((err) => console.log("Error checking for duplicates: ", err));
  }

  createLogMsg(
    `Added ${items.length} items to ${TB_NEWS} table in ${DB_NAME} data base. ${duplicateCount} duplicate url's omitted.`,
    "info"
  );

  return items.flat();
};

export const selectNewsData = (
  pool: Pool,
  selectConfig: SelectConfig = {}
): Promise<Headlines> =>
  pool
    .query(
      qSelectNewsHeadlines(
        TB_NEWS,
        [
          "category",
          "country",
          "lang",
          "headline",
          "provider",
          "url",
          "img",
          "age",
          "timestamp",
        ],
        selectConfig
      )
    )
    .then((res) => res.rows)
    .catch((err) => {
      console.log(err);
      return [];
    });
