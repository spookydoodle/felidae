import { Category, Country, Lang } from "../logic/types";

export const categories: Category[] = [
  "general",
  "business",
  "entertainment",
  "sport",
  "health",
  "science",
];

export const countryLang: { [key in Country]: Lang } = {
  gb: "en",
  us: "en",
  de: "de",
  nl: "nl",
  pl: "pl",
};

export const queries: { [key in Lang]: { [key in Category]: string } } = {
  en: {
    general: "news",
    business: "business",
    entertainment: "entertainment",
    sport: "sport",
    health: "health",
    science: "science",
  },
  de: {
    general: "news",
    business: "business",
    entertainment: "unterhaltung",
    sport: "sport",
    health: "gesundheit",
    science: "wissenschaft",
  },
  nl: {
    general: "news",
    business: "business",
    entertainment: "entertainment",
    sport: "sport",
    health: "gezondheid",
    science: "wetenschap",
  },
  pl: {
    general: "wiadomosci",
    business: "biznes",
    entertainment: "rozrywka",
    sport: "sport",
    health: "zdrowie",
    science: "nauka",
  },
};
