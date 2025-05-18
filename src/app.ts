import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@as-integrations/express5';
import { ApolloServerPluginDrainHttpServer } from '@apollo/server/plugin/drainHttpServer';
import express, { Express } from 'express';
import cors from 'cors';
import http from 'http';
import { config } from './routers/config';
import healthRouter from './routers/health';
import newsRouter from './routers/news';

const typeDefs = `#graphql
  type Query {
    hello: String
  }
`;

const resolvers = {
    Query: {
        hello: () => 'world',
    },
};

const app = express();
const httpServer = http.createServer(app);

const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
});

const startServer = async (port: string | number): Promise<Express> => {
    await server.start();

    app.use(
        cors(),
        express.json(),
        expressMiddleware(server)
    );

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
    await new Promise((resolve) => httpServer.listen({ port }, () => resolve(true)));

    return app;
};

export default startServer;
