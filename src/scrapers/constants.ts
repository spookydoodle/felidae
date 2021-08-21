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
