import dotenv from "dotenv";
dotenv.config();

import { getPool, initializeDb, initializeTb } from "./db";
import app from "./app";
import { initializeNewsScrapers } from "./scrapers/init";
import { DB_NAME, TB_NEWS } from "./db/constants";
import { Environment } from "./logic/types";
import createLogMsg from "./utils/createLogMsg";

initializeDb(DB_NAME)
    .then((dbName) => initializeTb(dbName, "news", TB_NEWS))
    .then((dbName) => getPool(dbName))
    .then((pool) => {
        if (pool) {
            initializeNewsScrapers(pool, {
                environment: process.env.NODE_ENV as Environment,
                engine: "bing",
                maxPageIndex: 1,
                updateFreqInHrs: 1
            });
        }
    })
    .catch((err) => createLogMsg((err as Error)?.message ?? 'Unknown data base error.', 'error'));

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
});
