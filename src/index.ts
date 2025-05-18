import dotenv from "dotenv";
dotenv.config();

import { getPool, initializeDb, initializeTb } from "./db";
import startServer from "./app";
import { initializeNewsScrapers } from "./scrapers/init";
import { DB_NAME, TB_NEWS } from "./db/constants";
import { Environment } from "./logic/types";

initializeDb(DB_NAME)
    .then(initializeTb("news", TB_NEWS))
    .then(getPool)
    .then(initializeNewsScrapers({
        environment: process.env.NODE_ENV as Environment,
        engine: "bing",
        maxPageIndex: 1,
        updateFreqInHrs: 1
    }))
    .catch((e) => console.error(e));

const PORT = process.env.PORT || 8081;

startServer(PORT).then(() => {
    console.log(`App listening on port ${PORT}!`);
});
