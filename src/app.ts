import express from 'express';
import cors from 'cors';
import path from 'path';
import { config } from './routers/config';
import healthRouter from './routers/health';
import newsRouter from './routers/news';
import generatePage from './pages/generatePage';

const app = express();
app.use(express.json());
app.use(cors());

const indexRouter = express.Router();
indexRouter.use('/css', express.static(path.join(__dirname, '../public/css')));
indexRouter.use('/docs', express.static(path.join(__dirname, '../public/docs')));
indexRouter.use(config.baseUrl.health, healthRouter);
indexRouter.use(config.baseUrl.news, newsRouter);
indexRouter.get('/', (_req, res) => {
    res.status(200).send(generatePage('Purr purr hiss.', '<a id="contact" href="/news">News API</a>'));
});

app.use(config.baseUrl.index, indexRouter);

export default app;
