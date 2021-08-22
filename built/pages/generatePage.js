"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var ghost_1 = __importDefault(require("./ghost"));
exports.default = (function (title, content) {
    if (content === void 0) { content = ''; }
    return "<html>\n<head>\n    <style>\n        body {\n            width: 100vw;\n            height: 100vh;\n            margin: 0;\n            position: relative;\n            font-family: Arial;\n            background-color: #11001C;\n        }\n\n        body > div {\n            margin: 0;\n            width: 100%;\n            height: 100%;\n            display: flex;\n            flex-direction: column;\n            justify-content: space-between;\n            align-items: center;\n            color: rgba(255, 255, 255, .6);\n        }\n\n        svg {\n            height: 2rem;\n            width: 2rem;\n            padding: 1rem;\n        }\n\n        svg path {\n            fill: rgba(255, 255, 255, .6);\n        }\n\n        #contact {\n            padding: 1rem;\n            text-decoration: none !important;\n            color: inherit;\n            border: none;\n        }\n    </style>\n</head>\n<body>\n    <div>\n        " + ghost_1.default + "\n        <h1>" + title + "</h1>\n        " + content + "\n        <a id=\"contact\" href=\"mailto:spookydoodle0@gmail.com\">Contact spookydoodle0@gmail.com</a>\n    </div>\n</body>\n</html>";
});
