import { Headline, HeadlineColumn } from "../logic/types";

const conditions = {
  eq: "=",
  gt: ">",
  gte: ">=",
  lt: "<",
  lte: "<=",
};

// Create database queries
export const qCreateDb = (dbName: string) => `CREATE DATABASE ${dbName};`;

// Create table queries
export const newsTbDataTypeLengths = {
  categoryLen: 20,
  countryLen: 2,
  langLen: 2,
  headlineLen: 150,
  providerLen: 40,
  urlLen: 255,
  ageLen: 12,
};
export const qCreateTbNews = (tbName: string) => {
  const { categoryLen, countryLen, langLen, headlineLen, providerLen, urlLen, ageLen } = newsTbDataTypeLengths;

  return `CREATE TABLE ${tbName}(
    id SERIAL PRIMARY KEY,
    category VARCHAR(${categoryLen}),
    country VARCHAR(${countryLen}),
    lang VARCHAR(${langLen}),
    headline VARCHAR(${headlineLen}),
    provider VARCHAR(${providerLen}),
    url VARCHAR(${urlLen}),
    img VARCHAR(${urlLen}),
    age VARCHAR(${ageLen}),
    timestamp TIMESTAMP
  );`;
}

export const qCreateTb = (tbName: string) => ({
  news: qCreateTbNews(tbName),
});

export type NewsFilterCondition = [
  keyof Headline,
  keyof typeof conditions,
  string
];

export type OrderType = "ASC" | "DESC";

export type OrderBy = [HeadlineColumn, OrderType];

export interface SelectConfig {
  filters?: NewsFilterCondition[];
  orderBy?: OrderBy[];
  top?: number;
  skip?: number;
}

// Select data queries
export const qSelectNewsHeadlines = (
  tbName: string,
  columns: (HeadlineColumn | "*")[],
  { filters, orderBy, top, skip }: SelectConfig = {}
): string =>
  `SELECT ${["id", ...columns]?.join(", ") || "*"}` +
  ` FROM ${tbName}` +
  (filters ? addWhere(filters) : "") +
  (orderBy ? addOrderBy(orderBy) : "") +
  (top ? ` LIMIT ${top}` : "") +
  (skip ? ` OFFSET ${skip}` : "") +
  ";";

export const qRowExists = (
  tbName: string,
  filterArr?: NewsFilterCondition[]
): string =>
  `SELECT COUNT(*) FROM ${tbName}${filterArr ? addWhere(filterArr) : ""};`;

const addWhere = (filterArr: NewsFilterCondition[]): string => {
  let filter = "";

  filterArr.forEach(([col, condition, val], i) => {
    // timestamp::date = date '2021-08-22'
    filter += ` ${i === 0 ? "WHERE" : "AND"} ${
      col + (col === "timestamp" ? "::date" : "")
    } ${conditions[condition]} ${col === "timestamp" ? "date " : ""}'${val}'`;
  });

  return filter;
};

const addOrderBy = (orderByArr: OrderBy[]) => {
    let orderByQuery = '';

    orderByArr.forEach(([col, direction], i) => {
        orderByQuery += `${i === 0 ? ' ORDER BY' : ','} ${col} ${direction}`;
    });

    return orderByQuery;
}

// Post data queries
// to_timestamp is expecting a value in seconds, while provided js timestamp is in ms, hence division by 1000.0
export const qInsertToNews = (tbNews: string) =>
  `INSERT INTO ${tbNews}(category, country, lang, headline, provider, url, img, age, timestamp) 
  VALUES ($1, $2, $3, $4, $5, $6, $7, $8, (to_timestamp($9 / 1000.0))) RETURNING *;`;
