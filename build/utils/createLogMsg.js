"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var logSymbols_1 = __importDefault(require("./logSymbols"));
exports.default = (function (msg, logSymbol) {
    var newMsg = "[" + new Date().toLocaleString() + "] " + (logSymbol ? logSymbols_1.default[logSymbol] : "") + " " + msg;
    console.log(newMsg);
});
