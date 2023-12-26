"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.qInsertToNews = exports.qRowExists = exports.qSelectNewsHeadlines = exports.qCreateTb = exports.qCreateTbNews = exports.newsTbDataTypeLengths = exports.qCreateDb = void 0;
var conditions = {
    eq: "=",
    gt: ">",
    gte: ">=",
    lt: "<",
    lte: "<=",
};
// Create database queries
var qCreateDb = function (dbName) { return "CREATE DATABASE " + dbName + ";"; };
exports.qCreateDb = qCreateDb;
// Create table queries
exports.newsTbDataTypeLengths = {
    categoryLen: 20,
    countryLen: 2,
    langLen: 2,
    headlineLen: 150,
    providerLen: 40,
    urlLen: 255,
    ageLen: 12,
};
var qCreateTbNews = function (tbName) {
    var categoryLen = exports.newsTbDataTypeLengths.categoryLen, countryLen = exports.newsTbDataTypeLengths.countryLen, langLen = exports.newsTbDataTypeLengths.langLen, headlineLen = exports.newsTbDataTypeLengths.headlineLen, providerLen = exports.newsTbDataTypeLengths.providerLen, urlLen = exports.newsTbDataTypeLengths.urlLen, ageLen = exports.newsTbDataTypeLengths.ageLen;
    return "CREATE TABLE " + tbName + "(\n    id SERIAL PRIMARY KEY,\n    category VARCHAR(" + categoryLen + "),\n    country VARCHAR(" + countryLen + "),\n    lang VARCHAR(" + langLen + "),\n    headline VARCHAR(" + headlineLen + "),\n    provider VARCHAR(" + providerLen + "),\n    url VARCHAR(" + urlLen + "),\n    age VARCHAR(" + ageLen + "),\n    timestamp TIMESTAMP\n  );";
};
exports.qCreateTbNews = qCreateTbNews;
var qCreateTb = function (tbName) { return ({
    news: exports.qCreateTbNews(tbName),
}); };
exports.qCreateTb = qCreateTb;
// Select data queries
var qSelectNewsHeadlines = function (tbName, columns, _a) {
    var _b;
    var _c = _a === void 0 ? {} : _a, filters = _c.filters, orderBy = _c.orderBy, top = _c.top, skip = _c.skip;
    return "SELECT " + (((_b = __spreadArray(["id"], __read(columns))) === null || _b === void 0 ? void 0 : _b.join(", ")) || "*") +
        (" FROM " + tbName) +
        (filters ? addWhere(filters) : "") +
        (orderBy ? addOrderBy(orderBy) : "") +
        (top ? " LIMIT " + top : "") +
        (skip ? " OFFSET " + skip : "") +
        ";";
};
exports.qSelectNewsHeadlines = qSelectNewsHeadlines;
var qRowExists = function (tbName, filterArr) {
    return "SELECT COUNT(*) FROM " + tbName + (filterArr ? addWhere(filterArr) : "") + ";";
};
exports.qRowExists = qRowExists;
var addWhere = function (filterArr) {
    var filter = "";
    filterArr.forEach(function (_a, i) {
        var _b = __read(_a, 3), col = _b[0], condition = _b[1], val = _b[2];
        // timestamp::date = date '2021-08-22'
        filter += " " + (i === 0 ? "WHERE" : "AND") + " " + (col + (col === "timestamp" ? "::date" : "")) + " " + conditions[condition] + " " + (col === "timestamp" ? "date " : "") + "'" + val + "'";
    });
    return filter;
};
var addOrderBy = function (orderByArr) {
    var orderByQuery = '';
    orderByArr.forEach(function (_a, i) {
        var _b = __read(_a, 2), col = _b[0], direction = _b[1];
        orderByQuery += (i === 0 ? ' ORDER BY' : ',') + " " + col + " " + direction;
    });
    return orderByQuery;
};
// Post data queries
// to_timestamp is expecting a value in seconds, while provided js timestamp is in ms, hence division by 1000.0
var qInsertToNews = function (tbNews) {
    return "INSERT INTO " + tbNews + "(category, country, lang, headline, provider, url, age, timestamp) \n  VALUES ($1, $2, $3, $4, $5, $6, $7, (to_timestamp($8 / 1000.0))) RETURNING *;";
};
exports.qInsertToNews = qInsertToNews;
