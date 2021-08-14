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

// Select data queries
export const qRowExists = (tbName: string, colName: string, val: string) =>
  `SELECT COUNT(*) FROM ${tbName} WHERE ${colName} = '${val}';`;

// Post data queries
export const qInsertToNews = (tbNews: string) =>
  `INSERT INTO ${tbNews}(category, lang, headline, provider, url, timestamp) 
  VALUES ($1, $2, $3, $4, $5, to_timestamp($6)) RETURNING *;`;