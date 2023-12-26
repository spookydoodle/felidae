"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initializeDb = exports.getPool = exports.initializeTb = void 0;
/*
    On server and db init, first run one pool and create
    the needed data base and table, if don't exist.
    Then close the connection and expose the pool configures
    with existing db and table.
*/
var pg_1 = require("pg");
var queries_1 = require("./db/queries");
var createLogMsg_1 = __importDefault(require("./utils/createLogMsg"));
var config = {
    user: process.env.DATABASE_USER || "postgres",
    password: process.env.DATABASE_PASS,
    host: process.env.DATABASE_HOST || "localhost",
    port: Number(process.env.DATABASE_PORT || 5432),
    database: process.env.DEFAULT_DATABASE_NAME || "postgres",
    ssl: process.env.NODE_ENV === "production"
        ? {
            rejectUnauthorized: false,
            //   ca: process.env.CA_CERT,
        }
        : undefined,
};
// Returns database name
var initializeDb = function (dbName) {
    return new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
        var pool;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pool = new pg_1.Pool(config);
                    pool.connect();
                    // Create DB if doesn't exist; then end pool and re-connect again on the right db to create table
                    return [4 /*yield*/, pool.query(queries_1.qCreateDb(dbName), function (dbErr) {
                            if (!dbErr || dbErr.message.indexOf("already exists") != -1) {
                                createLogMsg_1.default("Data base '" + dbName + "' " + (!dbErr ? "created" : "already exists") + ".", "info");
                                pool.end();
                                resolve(dbName);
                            }
                            else {
                                pool.end();
                                reject(dbErr);
                            }
                        })];
                case 1:
                    // Create DB if doesn't exist; then end pool and re-connect again on the right db to create table
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
};
exports.initializeDb = initializeDb;
// Returns database name
var initializeTb = function (dbName, tbType, tbName) {
    return new Promise(function (resolve, reject) { return __awaiter(void 0, void 0, void 0, function () {
        var pool;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    pool = new pg_1.Pool(__assign(__assign({}, config), { database: dbName }));
                    pool.connect();
                    return [4 /*yield*/, pool.query(queries_1.qCreateTb(tbName).news, function (tbErr) {
                            if (!tbErr || tbErr.message.indexOf("already exists") != -1) {
                                createLogMsg_1.default("Table structure of type '" + tbType + "' " + (!tbErr ? "created" : "already exists") + ".", "info");
                                // End pool and resolve by returning the database name
                                pool.end();
                                resolve(dbName);
                            }
                            else {
                                pool.end();
                                reject(tbErr);
                            }
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
};
exports.initializeTb = initializeTb;
var getPool = function (dbName) {
    var pool = new pg_1.Pool(__assign(__assign({}, config), { database: dbName }));
    pool.connect().catch(function (err) { return createLogMsg_1.default(err, "error"); });
    return pool;
};
exports.getPool = getPool;
