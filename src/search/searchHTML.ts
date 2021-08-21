import createLogMsg from "../utils/createLogMsg";
import { AxiosResponse } from "axios";
import jsdom from "jsdom";
import {
  ResultPage,
  Lang,
  SearchResult,
  Headlines,
  Category,
  SearchConfig,
  Headline,
  HeadlineData,
  SelectorData,
} from "../logic/types";

type ErrorType = {
  response?: {
    status?: string | number;
  };
  message?: string;
};

const prod = "production";

const axios = require("axios").default;
const { JSDOM } = jsdom;

const defaultQuery = "news";
const defaultLang: Lang = "en";

const headers = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.73",
};

// Google sucks, better use Bing
export const getResults = (
  query: string = defaultQuery,
  category: Category,
  lang: Lang = defaultLang,
  resultPageIndex: ResultPage,
  config: SearchConfig
): Promise<SearchResult> => {
  // https://stenevang.wordpress.com/2013/02/22/google-advanced-power-search-url-request-parameters/
  // q - query;
  // tbm=nws - search in news section
  // start=10 - second page, start from the 10th result (10 per page)
  // lr=lang_xx - results language
  // tbs=qdr:d,sbd:n -  (sbd)sort by: relevance 0; date 1

  // // Bing
  // q - query
  // cc=de - country of origin
  // setLang=en - language
  // qft=interval%3d"4" - "4": past hr; "7": past 24 hrs; "8": past 7 days; "9": past 30 days;
  // qft=sortbydate%3d"1" - use to get Most Recent; default are Best Match
  // +sortbydate%3d"1" - if both then use + sign
  // There is no parameter for count/offset/page; therefore the scraper should update data once
  // every hour or two; from last hour ("4") sorted by most recent
  const { environment, engine } = config;

  const selectorData: SelectorData = {
    google: {
      production: {
        url: `https://www.google.com/search?q=${query}&tbm=nws&start=${
          (resultPageIndex - 1) * 10
        }&lr=lang_${lang}&tbs=qdr:d,sbd:0`,
        selector: "#main > div:nth-child(n+2) > div > div:nth-child(1) > a",
        transform: transformGoogle,
      },
      staging: {
        url: `https://www.google.com/search?q=${query}&tbm=nws&start=${
          (resultPageIndex - 1) * 10
        }&lr=lang_${lang}&tbs=qdr:d,sbd:0`,
        selector: "#main > div:nth-child(n+2) > div > div:nth-child(1) > a",
        transform: transformGoogle,
      },
      development: {
        url: "http://localhost:5000/news/dummy/google",
        selector: ".dbsr a",
        transform: transformGoogle,
      },
    },
    bing: {
      production: {
        url: `https://www.bing.com/news/search?q=${query}&setLang=${lang}&count=50`,
        selector: ".news-card a.title",
        transform: transformBing,
      },
      staging: {
        url: `https://www.bing.com/news/search?q=${query}&setLang=${lang}&count=50`,
        selector: ".news-card a.title",
        transform: transformBing,
      },
      development: {
        url: "http://localhost:5000/news/dummy/bing",
        selector: ".news-card a.title",
        transform: transformBing,
      },
    },
  };

  const { url, selector, transform } =
    selectorData[engine][environment || "development"];

  // Request url and transform results to the right format
  return axios
    .get(url, { headers })
    .then(({ data }: AxiosResponse) => {
      createLogMsg(`Processing data received from ${url}`, "info");
      const { document } = new JSDOM(data).window;

      const headlines = [...document.querySelectorAll(selector)];

      // Expected result set is 10
      // TODO: Set up automated check for length 10
      const results = transform(headlines, config).map((headline) => ({
        category,
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
  category: Category,
  lang: Lang = defaultLang,
  maxPageIndex: ResultPage,
  config: SearchConfig
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
    await new Promise((resolve) => {
      timeout = setTimeout(resolve, (i + 1) * 5000);
    });
    clearTimeout(timeout);

    let response = await getResults(
      query,
      category,
      lang,
      (i + 1) as ResultPage,
      config
    )
      .then((res) => {
        createLogMsg(
          `Data for query '${query}' in lang '${lang}' from page ${
            i + 1
          } processed successfully.`,
          "success"
        );
        return res;
      })
      .catch((err) => {
        createLogMsg(
          `Requesting data for query '${query}' in lang '${lang}' from page ${
            i + 1
          } returned an error.`,
          "error"
        );

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
const transformGoogle = (
  headlines: any[],
  config: SearchConfig
): HeadlineData[] => {
  const { environment } = config;

  return headlines.map((el: any, i: number) => ({
    headline: el
      .querySelector(environment === prod ? "h3 > div" : ".JheGif.nDgy9d")
      .textContent.trim(),
    provider: el
      .querySelector(environment === prod ? "h3 + div" : ".XTjFC.WF4CUc")
      .textContent.trim(),
    // TODO: Set up automated test for href format
    url:
      environment === prod
        ? el.href.substring(7, el.href.indexOf("&")).trim()
        : el.href, // href is in format: '/url?q=https://...&param1=...', so we need to extract here the actual url
    timestamp: Date.now(),
  }));
};

const transformBing = (
  headlines: any[],
  config: SearchConfig
): HeadlineData[] =>
  headlines
    .filter((el: any) => el.textContent !== "")
    .map((el: any) => ({
      // remove spaces, tabs and new line substrings '\n'
      headline: el.textContent.replace(/\s\s+/g, " ").trim(),
      url: el.href,
      provider:
        el.attributes.getNamedItem("data-author") !== null
          ? el.attributes.getNamedItem("data-author").value
          : "",
      timestamp: Date.now(),
    }));
