// TODO: test 1: Check for an empty array = Google changed table structure in html
// TODO: test 2: checl for an array of empty objects = Google changed row structure in the image results table
import createLogMsg from "../utils/createLogMsg";
import { AxiosResponse } from "axios";
// import fetch from 'node-fetch';
import jsdom from "jsdom";
import { ResultPage, Lang, SearchResult, Headlines } from "../logic/types";

const prod = "production";

type ErrorType = { 
  response?: { 
    status?: string | number 
  }; 
  message?: string 
};

const axios = require("axios").default;
const { JSDOM } = jsdom;

const defaultQuery = "news";
const defaultLang = "lang_en";

// TODO: In dev environment, use a local path with static content
// Get raw HTML and pull HTML elements properties. Only 20 results returned.
export const getResults = (
  query: string = defaultQuery,
  lang: Lang = defaultLang,
  resultPageIndex: ResultPage = 1
): Promise<SearchResult> => {
  // https://stenevang.wordpress.com/2013/02/22/google-advanced-power-search-url-request-parameters/
  // q - query;
  // tbm=nws - search in news section
  // start=10 - second page, start from the 10th result (10 per page)
  // lr=lang_xx - results language
  // tbs=qdr:d,sbd:n -  (sbd)sort by: relevance 0; date 1
  const url =
    process.env.NODE_ENV === prod
      ? `https://www.google.com/search?q=${query}&tbm=nws&start=${
          (resultPageIndex - 1) * 10
        }&lr=${lang}&tbs=qdr:d,sbd:0`
      : "http://localhost:5000/news/dummy";
  // console.log(url);

  // Request url and transform results to the right format
  return axios
    .get(url)
    .then(({ data }: AxiosResponse) => {
      createLogMsg(`Processing data received from ${url}`, "info");
      const { document } = new JSDOM(data).window;

      // The news headlines are provided in the div list in the #main div, starting from the third div
      const selector =
        process.env.NODE_ENV === prod
          ? "#main > div:nth-child(n+2) > div > div:nth-child(1) > a"
          : ".dbsr a";
      const headlines = [...document.querySelectorAll(selector)];

      // Expected result set is 10
      // TODO: Set up automated check for length 10
      const results = transform(headlines).map((headline) => ({
        category: query === "news" ? "general" : query,
        lang,
        ...headline,
      }));

      // return data; // For troubleshooting display HTML body data
      return {
        error: null,
        results,
      };
    })
    .catch((err: ErrorType) => {
      createLogMsg(
        `Error fetching data from ${url}: ${err?.message}.`,
        "error"
      );
      console.log(err);

      return {
        error: Number(err?.response?.status) || err?.message || "Unknown error",
        results: [],
      };
    });
};

// To avoid 429 errors, add throttling and assure 5s breaks between each request
// Below method needs to be executed synchronously 
// TODO: Add generic 'for ... of ...'throttle method as a wrapper to reuse in the other parts of the app
export const getAllResults = async (
  query: string = defaultQuery,
  lang: Lang = defaultLang,
  maxPageIndex: ResultPage = 1
): Promise<SearchResult> => {

  let results: {
    error: string | number | null;
    results: Headlines[];
  } = {
    error: null,
    results: [],
  };

  for (let i = 0; i < maxPageIndex; i++) {
    // Assure incremental breaks of multipilication of 5s to avoid 429 errors
    let timeout;
    await new Promise(resolve => {
      timeout = setTimeout(resolve, (i + 1) * 5000);
    })
    clearTimeout(timeout);

    let response = await getResults(query, lang, (i + 1) as ResultPage)
      .then((res) => {
        createLogMsg(`Data for query '${query}' in lang '${lang}' from page ${i + 1} processed successfully.`, "success");
        return res;
      })
      .catch((err) => {
        createLogMsg(`Requesting data for query '${query}' in lang '${lang}' from page ${i + 1} returned an error.`, "error");

        return err;
      });

    if (response.error === null) {
      results.results.push(response.results);
    } else if (Number(response.error) == 429) {
      results.error = 429;
    }
  }

  // The returned value will have the error prop set to null only if all requests were successful
  // If one of the returned
  return { 
    error: results.error,
    results: results.results.flat(),
  };
};

// Receive html elements with headlines and transform to desired output format
// HTML objects array is in format: [headline0, image0, headline1, image1, headline2...].
// We need only the headline, so the array is first filtered by even indexes
const transform = (headlines: any[]) =>
  headlines.map((el: any, i: number) => ({
    headline: el
      .querySelector(
        process.env.NODE_ENV === prod ? "h3 > div" : ".JheGif.nDgy9d"
      )
      .textContent.trim(),
    provider: el
      .querySelector(
        process.env.NODE_ENV === prod ? "h3 + div" : ".XTjFC.WF4CUc"
      )
      .textContent.trim(),
    // TODO: Set up automated test for href format
    url:
      process.env.NODE_ENV === prod
        ? el.href.substring(7, el.href.indexOf("&")).trim()
        : el.href, // href is in format: '/url?q=https://...&param1=...', so we need to extract here the actual url
    timestamp: Date.now(),
  }));
