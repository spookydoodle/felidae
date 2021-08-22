"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chalk_1 = __importDefault(require("chalk"));
exports.default = {
    info: chalk_1.default.blue('i'),
    success: chalk_1.default.green('√'),
    warning: chalk_1.default.yellow('‼'),
    error: chalk_1.default.red('×')
};