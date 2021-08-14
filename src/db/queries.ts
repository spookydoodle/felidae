import { HeadlineColumn } from "../logic/types";

const conditions = {
  equal: "=",
  greaterThan: ">",
  greaterOrEqual: ">=",
  lessThan: "<",
  lessThanOrEqual: "<=",
};

// Create database queries
export const qCreateDb = (dbName: string) => `CREATE DATABASE ${dbName};`;

// Create table queries
export const qCreateTbNews = (tbName: string) =>
  `CREATE TABLE ${tbName}(
    id SERIAL PRIMARY KEY,
    category VARCHAR(20),
    lang VARCHAR(7),
    headline VARCHAR(150),
    provider VARCHAR(40),
    url VARCHAR(255),
    timestamp TIMESTAMP
  );`;

export const qCreateTb = (tbName: string) => ({
  news: qCreateTbNews(tbName),
});

type NewsFilterCondition = [
  "category" | "provider" | "lang" | "url",
  keyof typeof conditions,
  string
];

type OrderBy = [HeadlineColumn, "ASC" | "DESC"];

interface SelectConfig {
  filters?: NewsFilterCondition[];
  orderBy?: OrderBy[];
  top?: number;
}

// Select data queries
export const qSelectNewsHeadlines = (
  tbName: string,
  columns: (HeadlineColumn | "*")[],
  { filters, orderBy, top }: SelectConfig = {}
): string =>
  `SELECT ${columns?.join(", ") || "*"}` +
  ` FROM ${tbName}` +
  (filters ? addWhere(filters) : "") +
  (orderBy ? addOrderBy(orderBy) : "") +
  (top ? ` LIMIT ${top}` : "") +
  ";";

export const qRowExists = (
  tbName: string,
  filterArr?: NewsFilterCondition[]
): string =>
  `SELECT COUNT(*) FROM ${tbName}${filterArr ? addWhere(filterArr) : ""};`;

const addWhere = (filterArr: NewsFilterCondition[]): string => {
  let filter = "";

  filterArr.forEach(([col, condition, val], i) => {
    filter += ` ${i === 0 ? "WHERE" : "AND"} ${col} ${
      conditions[condition]
    } '${val}'`;
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
export const qInsertToNews = (tbNews: string) =>
  `INSERT INTO ${tbNews}(category, lang, headline, provider, url, timestamp) 
  VALUES ($1, $2, $3, $4, $5, to_timestamp($6)) RETURNING *;`;
