// TODO: test 1: Check for an empty array = Google changed table structure in html
// TODO: test 2: checl for an array of empty objects = Google changed row structure in the image results table
import createLogMsg from "../utils/createLogMsg";
import { AxiosResponse } from "axios";
// import fetch from 'node-fetch';
import jsdom from "jsdom";
import { ResultPage, Lang, SearchResult } from "../logic/types";
const axios = require("axios").default;
const { JSDOM } = jsdom;

// Get raw HTML and pull HTML elements properties. Only 20 results returned.
export const getResults = (
  query: string = "news",
  resultPageIndex: ResultPage = 1,
  lang: Lang = "lang_en"
): Promise<SearchResult> => {
  // https://stenevang.wordpress.com/2013/02/22/google-advanced-power-search-url-request-parameters/
  // q - query;
  // tbm=nws - search in news section
  // start=10 - second page, start from the 10th result (10 per page)
  // lr=lang_xx - results language
  // tbs=qdr:d,sbd:n -  (sbd)sort by: relevance 0; date 1
  const url = `https://www.google.com/search?q=${query}&tbm=nws&start=${
    (resultPageIndex - 1) * 10
  }&lr=${lang}&tbs=qdr:d,sbd:0`;
  // console.log(url);

  // Request url and transform results to the right format
  return axios
    .get(url)
    .then(({ data }: AxiosResponse) => {
      const { document } = new JSDOM(data).window;

      // The news headlines are provided in the div list in the #main div, starting from the third div
      const selector =
        "#main > div:nth-child(n+2) > div > div:nth-child(1) > a";
      const headlines = [...document.querySelectorAll(selector)];

      // Expected result set is 10
      // TODO: Set up automated check for length 10
      const results = transform(headlines);

      // return data; // For troubleshooting display HTML body data
      return {
        error: null,
        results,
      };
    })
    .catch((err: { message?: string }) => {
      createLogMsg(`Error fetching data from ${url}: ${err?.message}`, "error");

      return {
        error: err?.message || "Unknown error",
        results: [],
      };
    });
};

export const getAllResults = (
  query: string = "news",
  maxPageIndex: ResultPage = 10,
  lang: Lang = "lang_en"
): Promise<SearchResult> => {
  // Get data for pages from 1 to maxPageIndex
  const requests = new Array(maxPageIndex)
    .fill(null)
    .map((el: any, i: number) =>
      getResults(query, (i + 1) as ResultPage, lang)
    );

  const results = Promise.all(requests)
    .then((res) => ({
      error: null,
      results: res
        .filter((el: SearchResult) => el.error === null) // Filter out unsuccessful results
        .map((el: SearchResult) => el.results) // Get only results items
        .flat(), // Promise.all returns an array of arrays so needs to be flattened
    }))
    .catch((err: { message?: string }) => {
      createLogMsg(`Error fetching all data: ${err?.message}`, "error");

      return {
        error: err?.message || "Unknown error",
        results: [],
      };
    });

  return results;
};

// Receive html elements with headlines and transform to desired output format
// HTML objects array is in format: [headline0, image0, headline1, image1, headline2...].
// We need only the headline, so the array is first filtered by even indexes
const transform = (headlines: Array<any>) =>
  headlines.map((el: any, i: number) => ({
    headline: el.querySelector("h3 > div").textContent,
    provider: el.querySelector("h3 + div").textContent,
    // TODO: Set up automated test for href format
    url: el.href.substring(7, el.href.indexOf("&")), // href is in format: '/url?q=https://...&param1=...', so we need to extract here the actual url
    date: new Date(),
  }));
