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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var express_1 = __importDefault(require("express"));
var db_1 = require("../db");
var postNewsData_1 = require("../db/postNewsData");
var constants_1 = require("../db/constants");
var generatePage_1 = __importDefault(require("../pages/generatePage"));
var createLogMsg_1 = __importDefault(require("../utils/createLogMsg"));
var dummyPageGoogle_1 = __importDefault(require("../search/dummyPageGoogle"));
var dummyPageBing_1 = __importDefault(require("../search/dummyPageBing"));
var addQuery = function (req, res, next) {
    var page = req.query.page;
    if (page && (isNaN(Number(page)) || Number(page) < 1)) {
        var baseUrl = req.baseUrl, url = req.url;
        res.redirect("" + baseUrl + url.replace("page=" + page, "page=1"));
    }
    else {
        next();
    }
};
// Initialize router
var router = express_1.default.Router();
// Initialize PostgreSQL - give timeout for the first run, if DB_NAME does not exist, it will first need to be created
var pool;
setTimeout(function () {
    try {
        pool = db_1.getPool(constants_1.DB_NAME);
        createLogMsg_1.default("Connection between router 'News' and database '" + constants_1.DB_NAME + "' established.", "info");
    }
    catch (err) {
        console.log('Error connecting to data base');
    }
}, 5000);
router.get("/", function (req, res) {
    res.status(200).send(generatePage_1.default("Hello from Felidae's News Scraper API."));
});
// Dummy page for local development - static page to avoid 429 error
router.get("/dummy/google", function (req, res) {
    res.status(200).send(dummyPageGoogle_1.default);
});
router.get("/dummy/bing", function (req, res) {
    res.status(200).send(dummyPageBing_1.default);
});
router.get("/:category", addQuery, function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var category, _a, cc, lang, date, date_gt, date_gte, date_lt, date_lte, page, sortBy, pageNum, pg, _b, top, skip, filters, orderBy, _c, name_1, order, names, data;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                category = req.params.category;
                _a = req.query, cc = _a.cc, lang = _a.lang, date = _a.date, date_gt = _a.date_gt, date_gte = _a.date_gte, date_lt = _a.date_lt, date_lte = _a.date_lte, page = _a.page, sortBy = _a.sortBy;
                pageNum = Number(page);
                pg = page && !isNaN(pageNum) && pageNum > 0 ? pageNum : 1;
                _b = __read([100, (pg - 1) * 100], 2), top = _b[0], skip = _b[1];
                filters = [["category", "eq", category]];
                orderBy = [];
                // Filtering
                if (cc)
                    filters.push(["country", "eq", cc]);
                if (lang)
                    filters.push(["lang", "eq", lang]);
                if (date)
                    filters.push(["timestamp", "eq", date]);
                if (date_gt)
                    filters.push(["timestamp", "gt", date_gt]);
                if (date_gte)
                    filters.push(["timestamp", "gte", date_gte]);
                if (date_lt)
                    filters.push(["timestamp", "lt", date_lt]);
                if (date_lte)
                    filters.push(["timestamp", "lte", date_lte]);
                // Sorting
                if (sortBy) {
                    _c = __read(String(sortBy).split(' '), 2), name_1 = _c[0], order = _c[1];
                    names = ['id', 'timestamp'];
                    if (names.includes(name_1)) {
                        orderBy.push([
                            name_1,
                            (["ASC", "DESC"].includes(order.toUpperCase()) ? order.toUpperCase() : "DESC")
                        ]);
                    }
                }
                if (!pool) return [3 /*break*/, 2];
                return [4 /*yield*/, postNewsData_1.selectNewsData(pool, {
                        filters: filters,
                        orderBy: orderBy,
                        top: top,
                        skip: skip,
                    })];
            case 1:
                data = _d.sent();
                res.status(200).send(data);
                return [3 /*break*/, 3];
            case 2:
                res.status(500).send([]);
                _d.label = 3;
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
