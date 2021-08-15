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
import dotenv from "dotenv";
dotenv.config();

import { getPool, initializeDb, initializeTb } from "./db";
import app from "./app";
import { initializeNewsScrapers } from "./scrapers/init";
import { DB_NAME, TB_NEWS } from "./db/constants";

// Create db and table if they don't exist; then connect.
// Then create and initialize instances of the news scraper
// which updates data every 24 hours.
initializeDb(DB_NAME)
  .then((dbName) => initializeTb(dbName, "news", TB_NEWS))
  .then((dbName) => getPool(dbName))
  .then((pool) => initializeNewsScrapers(pool))
  .catch((err) => console.error(err));

// Run express app
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
