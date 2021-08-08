// This script starts the server. It's responsible for connecting the app to
// the real world, i.e. setup a database connection, bind to a port and wait
// indefinitely.
//
// Note, that this file should be kept as simple as possible, as it is not
// covered by unit tests.

// Start express app
import app from "./app";
import connectToDb from "./dbconfig/dbConnector";
import Scraper from "./data/scraper";
import { getAllResults } from "./search/searchHTML";

// Connect to postgreSQL db
connectToDb();

// Create an instance of the basic news scraper.
// Initialize method sets data fetch to run once every 24 hrs 
// and to save results in postgreSQL data base
const scraper = new Scraper("news", getAllResults);
scraper.initialize();

// Run express app
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}!`);
});
