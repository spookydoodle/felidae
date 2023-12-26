"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// This file exposes the whole app as a library.
//
// It *does not* connect the app to the real world. All external clients should
// be injectable / configurable from the outside to make testing possible.
// For example, the library does not connect to the database - it depends on
// the caller initializing the connection. This allows using a different connection
// in unit tests, and a different one in a production environment.
var express_1 = __importDefault(require("express"));
var cors_1 = __importDefault(require("cors"));
var config_1 = require("./routers/config");
var health_1 = __importDefault(require("./routers/health"));
var news_1 = __importDefault(require("./routers/news"));
var app = express_1.default();
// Middleware
app.use(cors_1.default());
// Define main router
var indexRouter = express_1.default.Router();
// Define hello page for index - should be available for health checks on ALB
indexRouter.get('/', function (req, res) {
    res.status(200).send("\n    <h1>Hello from Node.js server.</h1>\n    <p>Contact: spookydoodle0@gmail.com</p>\n    ");
});
// Health page displays info about uptime and data base connection
indexRouter.use(config_1.config.baseUrl.health, health_1.default);
// News router
indexRouter.use(config_1.config.baseUrl.news, news_1.default);
// Configure router to be based on a path where it's deployed, default: '/'
app.use(config_1.config.baseUrl.index, indexRouter);
exports.default = app;
