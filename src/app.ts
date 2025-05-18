import express from 'express';
import { GraphQLSchema, GraphQLObjectType, GraphQLString } from 'graphql';
import { createHandler } from 'graphql-http/lib/use/express';
import cors from 'cors';
import { config } from './routers/config';
import healthRouter from './routers/health';
import newsRouter from './routers/news';

const schema = new GraphQLSchema({
  query: new GraphQLObjectType({
    name: 'Query',
    fields: {
      hello: {
        type: GraphQLString,
        resolve: () => 'world',
      },
    },
  }),
});

const app = express();

app.all('/graphql', createHandler({ schema }));

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
