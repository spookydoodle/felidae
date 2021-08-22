"use strict";
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
// This class is created to schedule automatic data updates and writing them in the data base
// Data should be updated every 24 hours
var createLogMsg_1 = __importDefault(require("../utils/createLogMsg"));
var Scraper = /** @class */ (function () {
    function Scraper(name, requestFunc, postFunc, updateTimes, checkUpdateFreq, // every hour = 1 (h) * 60 (min) * 60 (s) * 1000 ms
    initDelay) {
        var _this = this;
        if (updateTimes === void 0) { updateTimes = [[2, 0, 0, 0]]; }
        if (checkUpdateFreq === void 0) { checkUpdateFreq = 1 * 60 * 60 * 1000; }
        if (initDelay === void 0) { initDelay = 0; }
        this.setUpdateInProgress = function (bool) {
            createLogMsg_1.default(bool === true
                ? "-> Initiating data fetch for " + _this.name + ". New requests won't be sent until this one is finished."
                : "-> Data fetch process for " + _this.name + " finished, new data may be requested again.");
            _this.isUpdateInProgress = bool;
        };
        // If now is after the updateTime and last data update is before the updateTime
        this.shouldUpdateData = function () {
            var shouldUpdate = false;
            var now = new Date().getTime();
            var lastUpdate = _this.lastUpdate != null ? _this.lastUpdate.getTime() : 0;
            var updateTimes = _this.updateTimes.map(function (updateTime) {
                var _a = __read(updateTime, 4), h = _a[0], m = _a[1], s = _a[2], ms = _a[3];
                return new Date().setHours(h, m, s, ms);
            });
            updateTimes.sort(function (a, b) { return (a < b ? 1 : -1); });
            for (var i = 0; i < updateTimes.length; i++) {
                if (now > lastUpdate &&
                    now > updateTimes[i] &&
                    lastUpdate < updateTimes[i]) {
                    shouldUpdate = true;
                    break;
                }
            }
            return shouldUpdate;
        };
        this.updateData = function () {
            // If one update is in progress, do not initiate another
            if (_this.shouldUpdateData() && !_this.isUpdateInProgress) {
                createLogMsg_1.default("Fetching data for " + _this.name + "...");
                _this.setUpdateInProgress(true);
                _this.requestFunc()
                    .then(function (response) {
                    createLogMsg_1.default("Data fetch for " + _this.name + " finished. Saving in the data base...", "success");
                    // TODO: receive promise and add logic based on success/err
                    _this.postFunc(response.results);
                    // Update last update date on successful database update and unlock the queue
                    _this.lastUpdate = new Date();
                    _this.setUpdateInProgress(false);
                    // Check for 429 error and stop scraper, if occured
                    _this.checkFor429(response.error);
                })
                    .catch(function (error) {
                    createLogMsg_1.default("Error fetching data for " + _this.name + ".", "error");
                    createLogMsg_1.default(error, "error");
                    // Update last error on the object
                    _this.lastError = {
                        time: new Date(),
                        message: error,
                    };
                    // Unlock the queue
                    _this.setUpdateInProgress(false);
                    // Check for 429 error and stop scraper, if occured
                    _this.checkFor429(error);
                    return;
                });
            }
            else {
                createLogMsg_1.default("Data does not need to be updated yet for " + _this.name + ".", "info");
            }
        };
        this.checkFor429 = function (err) {
            if (err === 429) {
                createLogMsg_1.default("Scraper " + _this.name + " will stop due to error 429: Too many requests. Setting resume in 24 hours.", "error");
                _this.stop();
                var timeout_1 = setTimeout(function () {
                    _this.initialize();
                    createLogMsg_1.default("Resuming scraper " + _this.name + ".", "info");
                    clearTimeout(timeout_1);
                }, 24 * 60 * 60 * 1000);
            }
        };
        this.setAutomaticUpdate = function (n) {
            var intervalText = n > 1000 * 60
                ? n / 1000 / 60 + " minutes"
                : n > 1000
                    ? n / 1000 + " seconds"
                    : n + " milliseconds";
            createLogMsg_1.default("*** Data fetch for " + _this.name + " is set and will check if it needs to update every " + intervalText + ".");
            createLogMsg_1.default("*** New data will be fetched every day at around: " + _this.updateTimes
                .map(function (arr) { return arr.join(":"); })
                .join(", ") + " (H:M:S:MS) UTC.");
            _this.interval = setInterval(function () {
                _this.updateData();
            }, n);
        };
        this.initialize = function () {
            _this.timeout = setTimeout(function () {
                _this.setAutomaticUpdate(_this.checkUpdateFreq);
                _this.updateData();
            }, _this.initDelay || 0);
            return _this;
        };
        this.stop = function () {
            if (_this.interval) {
                clearInterval(_this.interval);
                _this.interval = null;
            }
            if (_this.timeout) {
                clearTimeout(_this.timeout);
                _this.timeout = null;
            }
            return _this;
        };
        this.name = name;
        this.requestFunc = requestFunc;
        this.postFunc = postFunc;
        this.updateTimes = updateTimes;
        this.checkUpdateFreq = checkUpdateFreq;
        this.initDelay = initDelay;
        this.lastError = null;
        this.lastUpdate = null;
        this.isUpdateInProgress = false;
        this.timeout = null;
        this.interval = null;
    }
    return Scraper;
}());
exports.default = Scraper;
