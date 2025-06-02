import dotenv from "dotenv";
dotenv.config();

import { getPool, initializeDb, initializeTb } from "./db";
import app from "./app";
import { initializeNewsScrapers } from "./scrapers/init";
import { DB_NAME, TB_NEWS } from "./db/constants";
import { Environment } from "./logic/types";

initializeDb(DB_NAME)
    .then(initializeTb("news", TB_NEWS))
    .then(getPool)
    .then(initializeNewsScrapers({
        environment: (process.env.NODE_ENV ?? 'development') as Environment,
        engine: "bing",
        maxPageIndex: 1,
        updateFreqInHrs: 1
    }))
    .catch(console.error);

const PORT = process.env.PORT || 8081;

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}!`);
});
