"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// This script starts the server. It's responsible for connecting the app to
// the real world, i.e. setup a database connection, bind to a port and wait
// indefinitely.
//
// Note, that this file should be kept as simple as possible, as it is not
// covered by unit tests.
//
// In production (or for production tests) NODE_ENV should be set to 'production' - see the checks in ./search/searchHTML.
// In any other case the app will fetch data from a local dummy page, in order to prevent 429 errors while constantly refreshing.
// You can also use the value 'staging' to initiate only 1 request per day per scraper (instead of 10 on prod, see ./scrapers/init).
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var db_1 = require("./db");
var app_1 = __importDefault(require("./app"));
var init_1 = require("./scrapers/init");
var constants_1 = require("./db/constants");
// Create db and table if they don't exist; then connect.
// Then create and initialize instances of the news scraper
// which updates data every 24 hours.
db_1.initializeDb(constants_1.DB_NAME)
    .then(function (dbName) { return db_1.initializeTb(dbName, "news", constants_1.TB_NEWS); })
    .then(function (dbName) { return db_1.getPool(dbName); })
    .then(function (pool) {
    return init_1.initializeNewsScrapers(pool, {
        environment: process.env.NODE_ENV,
        engine: "bing",
        maxPageIndex: 1,
        updateFreqInHrs: 1, // Update every hour - the link for bing collects data from last hr
    });
})
    .catch(function (err) { return console.error(err); });
// Run express app
var PORT = process.env.PORT || 8081;
app_1.default.listen(PORT, function () {
    console.log("App listening on port " + PORT + "!");
});
