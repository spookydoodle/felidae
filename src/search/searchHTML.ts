import { AxiosResponse } from "axios";
// import fetch from 'node-fetch';
import jsdom from "jsdom";
import { ResultPage, Lang, SearchResult } from "../logic/types";
const axios = require("axios").default;
const { JSDOM } = jsdom;



// Get raw HTML and pull HTML elements properties. Only 20 results returned.
export const getResults = (
  query: string = "news",
  resultPage: ResultPage = 1,
  lang: Lang = "lang_en"
): Promise<SearchResult> => {
  // https://stenevang.wordpress.com/2013/02/22/google-advanced-power-search-url-request-parameters/
  // q - query;
  // tbm=nws - search in news section
  // start=10 - second page, start from the 10th result (10 per page)
  // lr=lang_xx - results language
  // tbs=qdr:d,sbd:n -  (sbd)sort by: relevance 0; date 1
  const url = `https://www.google.com/search?q=${query}&tbm=nws&start=${
    (resultPage - 1) * 10
  }&lr=${lang}&tbs=qdr:d,sbd:0`;
  console.log(url);

  // Request url and transform results to the right format
  return axios
    .get(url)
    .then(({ data }: AxiosResponse) => {
      const { document } = new JSDOM(data).window;

      // The news headings are provided in the div list in the #main div, starting from the third div
      const headings = [
        ...document.querySelectorAll("#main > div:nth-child(n+2) a"),
      ];

      // Expected result set is 20: 10 result rows with two <a> tags:
      // First for the heading, second for the image. We need only the heading.
      // Automated tests should cover the scenario check for 20 result rows
      const results =
        headings.length === 20
          ? headings
              .filter((el: any, i: number) => i % 2 === 0)
              .map((el: any, i: number) => ({
                heading: el.querySelector("h3 > div").textContent,
                author: el.querySelector("h3 + div").textContent,
                url: el.href.substring(7, el.href.indexOf("&")),
                date: new Date(),
              }))
          : [];

      // Otherwise display results
      // return data;// For troubleshooting display HTML body data
      return { error: null, results };
    })
    .catch((err: { message?: string }) => ({
      error: err?.message || "Unknown error",
      results: [],
    }));

};

  // TODO: test 1: Check for an empty array = Google changed table structure in html
  // TODO: test 2: checl for an array of empty objects = Google changed row structure in the image results table