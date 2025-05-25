import express from 'express';
import rateLimit from 'express-rate-limit';
import cors from 'cors';
import path from 'path';
import { config } from './routers/config';
import healthRouter from './routers/health';
import newsRouter from './routers/news';
import generatePage from './pages/generatePage';

const app = express();
app.use(express.json());
app.use(cors());
app.use(rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
    message: "Give me a break for some minutes or I'll show you my claws.",

}));

const indexRouter = express.Router();
indexRouter.use('/css', express.static(path.join(__dirname, '../public/css')));
indexRouter.use('/html', express.static(path.join(__dirname, '../public/html')));
indexRouter.use('/docs', express.static(path.join(__dirname, '../public/docs')));
indexRouter.use(config.baseUrl.health, healthRouter);
indexRouter.use(config.baseUrl.news, newsRouter);
indexRouter.get('/', (_req, res) => {
    res.status(200).send(generatePage('Purr purr hiss.', '<a id="contact" href="/news">News API</a>'));
});

app.use(config.baseUrl.index, indexRouter);

export default app;
