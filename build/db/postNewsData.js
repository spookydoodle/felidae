"use strict";
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
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.selectNewsData = exports.postNewsDataToDb = void 0;
var createLogMsg_1 = __importDefault(require("../utils/createLogMsg"));
var constants_1 = require("./constants");
var queries_1 = require("./queries");
var postNewsDataToDb = function (pool, data) { return __awaiter(void 0, void 0, void 0, function () {
    var items, duplicateCount, categoryLen, countryLen, langLen, headlineLen, providerLen, urlLen, ageLen, _loop_1, data_1, data_1_1, _a, category, country, lang, headline, provider, url, age, timestamp, e_1_1;
    var e_1, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                items = [];
                duplicateCount = 0;
                categoryLen = queries_1.newsTbDataTypeLengths.categoryLen, countryLen = queries_1.newsTbDataTypeLengths.countryLen, langLen = queries_1.newsTbDataTypeLengths.langLen, headlineLen = queries_1.newsTbDataTypeLengths.headlineLen, providerLen = queries_1.newsTbDataTypeLengths.providerLen, urlLen = queries_1.newsTbDataTypeLengths.urlLen, ageLen = queries_1.newsTbDataTypeLengths.ageLen;
                _loop_1 = function (category, country, lang, headline, provider, url, age, timestamp) {
                    return __generator(this, function (_d) {
                        switch (_d.label) {
                            case 0:
                                if (!(category.length <= categoryLen &&
                                    country.length <= countryLen &&
                                    lang.length <= langLen &&
                                    headline.length <= headlineLen &&
                                    provider.length <= providerLen &&
                                    age.length <= ageLen &&
                                    url.length <= urlLen)) return [3 /*break*/, 2];
                                return [4 /*yield*/, pool
                                        .query(queries_1.qRowExists(constants_1.TB_NEWS, [["url", "eq", url]]))
                                        .then(function (_a) {
                                        var rows = _a.rows;
                                        return __awaiter(void 0, void 0, void 0, function () {
                                            return __generator(this, function (_b) {
                                                switch (_b.label) {
                                                    case 0:
                                                        if (!(rows[0].count == 0)) return [3 /*break*/, 2];
                                                        return [4 /*yield*/, pool
                                                                .query(queries_1.qInsertToNews(constants_1.TB_NEWS), [
                                                                category,
                                                                country,
                                                                lang,
                                                                headline,
                                                                provider.substring(0, 40),
                                                                url,
                                                                age,
                                                                timestamp,
                                                            ])
                                                                .then(function (_a) {
                                                                var rows = _a.rows;
                                                                return items.push(rows);
                                                            })
                                                                .catch(function (err) { return console.log("Error inserting data: ", err); })];
                                                    case 1:
                                                        _b.sent();
                                                        return [3 /*break*/, 3];
                                                    case 2:
                                                        duplicateCount++;
                                                        _b.label = 3;
                                                    case 3: return [2 /*return*/];
                                                }
                                            });
                                        });
                                    })
                                        .catch(function (err) { return console.log("Error checking for duplicates: ", err); })];
                            case 1:
                                _d.sent();
                                return [3 /*break*/, 3];
                            case 2:
                                createLogMsg_1.default("Headline: \"" + headline + "\" not added due to " + (category.length > categoryLen
                                    ? "its category '" + category + "' length of " + category.length + " (max " + categoryLen + ")"
                                    : country.length > countryLen
                                        ? "its country '" + country + "' length of " + country.length + " (max " + countryLen + ")"
                                        : lang.length > langLen
                                            ? "its lang '" + lang + "' length of " + lang.length + " (max " + langLen + ")"
                                            : headline.length > headlineLen
                                                ? "its headline length of " + headline.length + " char (max " + headlineLen + ")"
                                                : provider.length > providerLen
                                                    ? "its provider length of " + provider.length + " char (max " + providerLen + ")"
                                                    : age.length > ageLen
                                                        ? "its age length of " + age.length + " char (max " + ageLen + ")"
                                                        : "its url length of " + url.length + " (max " + urlLen + ")"), "error");
                                _d.label = 3;
                            case 3: return [2 /*return*/];
                        }
                    });
                };
                _c.label = 1;
            case 1:
                _c.trys.push([1, 6, 7, 8]);
                data_1 = __values(data), data_1_1 = data_1.next();
                _c.label = 2;
            case 2:
                if (!!data_1_1.done) return [3 /*break*/, 5];
                _a = data_1_1.value, category = _a.category, country = _a.country, lang = _a.lang, headline = _a.headline, provider = _a.provider, url = _a.url, age = _a.age, timestamp = _a.timestamp;
                return [5 /*yield**/, _loop_1(category, country, lang, headline, provider, url, age, timestamp)];
            case 3:
                _c.sent();
                _c.label = 4;
            case 4:
                data_1_1 = data_1.next();
                return [3 /*break*/, 2];
            case 5: return [3 /*break*/, 8];
            case 6:
                e_1_1 = _c.sent();
                e_1 = { error: e_1_1 };
                return [3 /*break*/, 8];
            case 7:
                try {
                    if (data_1_1 && !data_1_1.done && (_b = data_1.return)) _b.call(data_1);
                }
                finally { if (e_1) throw e_1.error; }
                return [7 /*endfinally*/];
            case 8:
                createLogMsg_1.default("Added " + items.length + " items to " + constants_1.TB_NEWS + " table in " + constants_1.DB_NAME + " data base. " + duplicateCount + " duplicate url's omitted.", "info");
                return [2 /*return*/, items.flat()];
        }
    });
}); };
exports.postNewsDataToDb = postNewsDataToDb;
var selectNewsData = function (pool, selectConfig) {
    if (selectConfig === void 0) { selectConfig = {}; }
    return pool
        .query(queries_1.qSelectNewsHeadlines(constants_1.TB_NEWS, [
        "category",
        "country",
        "lang",
        "headline",
        "provider",
        "url",
        "age",
        "timestamp",
    ], selectConfig))
        .then(function (res) { return res.rows; })
        .catch(function (err) {
        console.log(err);
        return [];
    });
};
exports.selectNewsData = selectNewsData;
