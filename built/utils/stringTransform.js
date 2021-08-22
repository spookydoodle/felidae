"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capitalize = void 0;
var capitalize = function (text) {
    return text.charAt(0).toUpperCase() + text.substring(1).toLowerCase();
};
exports.capitalize = capitalize;
