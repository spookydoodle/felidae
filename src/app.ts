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
