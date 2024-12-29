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

  // Before inserting make sure data meets data type criteria defined in postgres table
  // Also, make sure entry does not exist yet; if it does, then skip it
  for (const {
    category,
    country,
    lang,
    headline,
    provider,
    url,
    age,
    timestamp,
  } of data) {
    if (
      category.length <= categoryLen &&
      country.length <= countryLen &&
      lang.length <= langLen &&
      headline.length <= headlineLen &&
      provider.length <= providerLen &&
      age.length <= ageLen &&
      url.length <= urlLen
    ) {
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
                age,
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
      createLogMsg(
        `Headline: "${headline}" not added due to ${
          category.length > categoryLen
            ? `its category '${category}' length of ${category.length} (max ${categoryLen})`
            : country.length > countryLen
            ? `its country '${country}' length of ${country.length} (max ${countryLen})`
            : lang.length > langLen
            ? `its lang '${lang}' length of ${lang.length} (max ${langLen})`
            : headline.length > headlineLen
            ? `its headline length of ${headline.length} char (max ${headlineLen})`
            : provider.length > providerLen
            ? `its provider length of ${provider.length} char (max ${providerLen})`
            : age.length > ageLen
            ? `its age length of ${age.length} char (max ${ageLen})`
            : `its url length of ${url.length} (max ${urlLen})`
        }`,
        "error"
      );
    }
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
