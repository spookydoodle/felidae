// This file exposes the whole app as a library.
//
// It *does not* connect the app to the real world. All external clients should
// be injectable / configurable from the outside to make testing possible.
// For example, the library does not connect to the database - it depends on
// the caller initializing the connection. This allows using a different connection
// in unit tests, and a different one in a production environment.
import express from 'express';
import cors from 'cors';
import { config } from './routers/config';
import healthRouter from './routers/health';
import newsRouter from './routers/news';

const app = express();

app.use(cors());

const indexRouter = express.Router();

indexRouter.get('/', (_req, res) => {
    res.status(200).send(`
    <h1>Hello from Node.js server.</h1>
    <p>Contact: spookydoodle0@gmail.com</p>
    `);
});

indexRouter.use(config.baseUrl.health, healthRouter);
indexRouter.use(config.baseUrl.news, newsRouter);

app.use(config.baseUrl.index, indexRouter);

export default app;
