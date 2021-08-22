"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queries = exports.countryLang = exports.categories = void 0;
exports.categories = [
    "general",
    "business",
    "entertainment",
    "sport",
    "health",
    "science",
];
exports.countryLang = {
    gb: "en",
    us: "en",
    de: "de",
    nl: "nl",
    pl: "pl",
};
exports.queries = {
    en: {
        general: "news today",
        business: "business today",
        entertainment: "entertainment today",
        sport: "sport today",
        health: "health",
        science: "science today",
    },
    de: {
        general: "nachrichten",
        business: "unternehmen",
        entertainment: "unterhaltung",
        sport: "sport",
        health: "gesundheit",
        science: "wissenschaft",
    },
    nl: {
        general: "nieuws",
        business: "ondernemen",
        entertainment: "entertainment nieuws",
        sport: "sport nieuws",
        health: "gezondheid",
        science: "wetenschap",
    },
    pl: {
        general: "wiadomosci",
        business: "biznes",
        entertainment: "rozrywka",
        sport: "sport wiadomosci",
        health: "zdrowie",
        science: "nauka",
    },
};
