// This script starts the server. It's responsible for connecting the app to
// the real world, i.e. setup a database connection, bind to a port and wait
// indefinitely.
//
// Note, that this file should be kept as simple as possible, as it is not
// covered by unit tests.
import dotenv from "dotenv";
dotenv.config();

import { initializeDb } from "./db";
import app from "./app";
import Scraper from "./data/scraper";
import { getAllResults } from "./search/searchHTML";
import { postNewsToDb } from "./db/postNewsData";

// Create db and table if they don't exist; then connect.
// Create an instance of the basic news scraper.
// initialize() method sets data fetch&save to run every 24 hrs.
let newsScraperGeneral: Scraper;
initializeDb()
  .then((pool) => {
    newsScraperGeneral = new Scraper("news", getAllResults, (data) => postNewsToDb(pool, data), [[2, 0, 0, 0]]).initialize();
  })
  .catch((err) => console.log(err));

// Run express app
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
