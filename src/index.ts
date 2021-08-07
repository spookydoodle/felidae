// This script starts the server. It's responsible for connecting the app to
// the real world, i.e. setup a database connection, bind to a port and wait
// indefinitely.
//
// Note, that this file should be kept as simple as possible, as it is not
// covered by unit tests.

// Start express app
import app from'./app';
import Scraper from './data/scraper';
import { getAllResults } from './search/searchHTML';

// Connect to postgreSQL data base
const scraper = new Scraper(
    'news', 
    getAllResults, 
    [
        [16, 21, 0, 0],
        [16, 22, 0, 0],
        [16, 23, 0, 0],
        [16, 24, 0, 0],
        [16, 25, 0, 0],
        [16, 26, 0, 0],
        [16, 27, 0, 0],
        [16, 28, 0, 0],
    ]
    );

// Initialize the scraper object

// Run express app
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
});