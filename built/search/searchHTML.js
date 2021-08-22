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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllResults = exports.getResults = void 0;
var createLogMsg_1 = __importDefault(require("../utils/createLogMsg"));
var jsdom_1 = __importDefault(require("jsdom"));
var selections_1 = require("./selections");
var prod = "production";
var axios = require("axios").default;
var JSDOM = jsdom_1.default.JSDOM;
var defaultQuery = "news";
var defaultLang = "en";
var defaultCountry = "gb";
var headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.73",
};
// Google sucks, better use Bing
var getResults = function (query, category, country, lang, resultPageIndex, config) {
    if (query === void 0) { query = defaultQuery; }
    if (country === void 0) { country = defaultCountry; }
    if (lang === void 0) { lang = defaultLang; }
    var environment = config.environment, engine = config.engine;
    var selectorData = selections_1.getSelections(query, country, lang, resultPageIndex);
    var _a = selectorData[engine][environment || "development"], url = _a.url, selector = _a.selector, transform = _a.transform;
    // Request url and transform results to the right format
    return axios
        .get(url, { headers: headers })
        .then(function (_a) {
        var data = _a.data;
        createLogMsg_1.default("Processing data received from " + url, "info");
        var document = new JSDOM(data).window.document;
        var headlines = __spreadArray([], __read(document.querySelectorAll(selector)));
        // Expected result set is 10
        // TODO: Set up automated check for length 10
        var results = transform(headlines, config).map(function (headline) { return (__assign({ category: category, country: country, lang: lang }, headline)); });
        // return data; // For troubleshooting display HTML body data
        return {
            error: null,
            results: results,
        };
    })
        .catch(function (err) {
        var _a;
        createLogMsg_1.default("Error fetching data from " + url + ": " + (err === null || err === void 0 ? void 0 : err.message) + ".", "error");
        console.log(err);
        return {
            error: Number((_a = err === null || err === void 0 ? void 0 : err.response) === null || _a === void 0 ? void 0 : _a.status) || (err === null || err === void 0 ? void 0 : err.message) || "Unknown error",
            results: [],
        };
    });
};
exports.getResults = getResults;
// To avoid 429 errors, add throttling and assure 5s breaks between each request
// Below method needs to be executed synchronously
// TODO: Add generic 'for ... of ...'throttle method as a wrapper to reuse in the other parts of the app
var getAllResults = function (query, category, country, lang, maxPageIndex, config) {
    if (query === void 0) { query = defaultQuery; }
    if (country === void 0) { country = defaultCountry; }
    if (lang === void 0) { lang = defaultLang; }
    return __awaiter(void 0, void 0, void 0, function () {
        var results, _loop_1, i;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    results = {
                        error: null,
                        results: [],
                    };
                    _loop_1 = function (i) {
                        var timeout, response;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, new Promise(function (resolve) {
                                        timeout = setTimeout(resolve, (i + 1) * 5000);
                                    })];
                                case 1:
                                    _b.sent();
                                    clearTimeout(timeout);
                                    return [4 /*yield*/, exports.getResults(query, category, country, lang, (i + 1), config)
                                            .then(function (res) {
                                            createLogMsg_1.default("Data for query '" + query + "' from country '" + country + "' in lang '" + lang + "' from page " + (i + 1) + " processed successfully.", "success");
                                            return res;
                                        })
                                            .catch(function (err) {
                                            createLogMsg_1.default("Requesting data for query '" + query + "' from country '" + country + "' in lang '" + lang + "' from page " + (i + 1) + " returned an error.", "error");
                                            return err;
                                        })];
                                case 2:
                                    response = _b.sent();
                                    if (response.error === null) {
                                        results.results.push(response.results);
                                    }
                                    else if (Number(response.error) == 429) {
                                        results.error = 429;
                                    }
                                    return [2 /*return*/];
                            }
                        });
                    };
                    i = 0;
                    _a.label = 1;
                case 1:
                    if (!(i < maxPageIndex)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(i)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    i++;
                    return [3 /*break*/, 1];
                case 4: 
                // The returned value will have the error prop set to null only if all requests were successful
                // If one of the returned
                return [2 /*return*/, {
                        error: results.error,
                        results: results.results.flat(),
                    }];
            }
        });
    });
};
exports.getAllResults = getAllResults;
