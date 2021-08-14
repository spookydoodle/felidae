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
import { postNewsData } from "./db/postNewsData";
import { Headlines } from "./logic/types";

// Create db and table if they don't exist; then connect.
// Create an instance of the basic news scraper.
// initialize() method sets data fetch&save to run every 24 hrs.
initializeDb()
  .then((pool) => {
    const postNewsToDb = (data: Headlines) => postNewsData(pool, data);
    const scraper = new Scraper("news", getAllResults, postNewsToDb);
    scraper.initialize();
  })
  .catch((err) => console.log(err));

// Run express app
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
