// https://stenevang.wordpress.com/2013/02/22/google-advanced-power-search-url-request-parameters/
// q - query;
// tbm=nws - search in news section
// start=10 - second page, start from the 10th result (10 per page)
// cr=xx - results from country of origin
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

import {
  Country,
  HeadlineData,
  Lang,
  ResultPage,
  SearchConfig,
  SelectorData,
} from "../logic/types";

export const getSelections = (
  query: string,
  country: Country,
  lang: Lang
): SelectorData => ({
  bing: {
    production: {
      url: `https://www.bing.com/news/search?q=${query}&cc=${country}&setLang=${lang}&qft=sortbydate%3d"1"+interval%3d"4"`,
      selector: ".news-card",
      transform: transformBing,
    },
    staging: {
      url: `https://www.bing.com/news/search?q=${query}&cc=${country}&setLang=${lang}&qft=sortbydate%3d"1"+interval%3d"4"`,
      selector: ".news-card",
      transform: transformBing,
    },
    development: {
      url: `https://www.bing.com/news/search?q=${query}&cc=${country}&setLang=${lang}&qft=sortbydate%3d"1"+interval%3d"4"`,
      selector: ".news-card",
      transform: transformBing,
    },
  },
});

// Receive html elements with headlines and transform to desired output format
// HTML objects array is in format: [headline0, image0, headline1, image1, headline2...].
// We need only the headline, so the array is first filtered by even indexes
// TODO: this is not working well enough yet
const transformGoogle = (
  headlines: any[],
  config: SearchConfig
): HeadlineData[] => {
  const { environment } = config;

  return headlines.map((el: any, i: number) => ({
    headline:
      el.querySelector("div > div:nth-child(2) > div + div:nth-child(2)") !=
      null
        ? el.querySelector("div > div:nth-child(2) > div + div:nth-child(2)")
            .textContent
        : "",
    // el
    //   .querySelector(environment === prod ? "h3 > div" : ".JheGif.nDgy9d")
    //   .textContent.trim(),
    url: el.href,
    // environment === prod
    //   ? el.href.substring(7, el.href.indexOf("&")).trim()
    //   : el.href, // href is in format: '/url?q=https://...&param1=...', so we need to extract here the actual url
    provider:
      el.querySelector("div > div:nth-child(2) > div + div:nth-child(1)") !=
      null
        ? el.querySelector("div > div:nth-child(2) > div + div:nth-child(1)")
            .textContent
        : "",
    // el
    //   .querySelector(environment === prod ? "h3 + div" : ".XTjFC.WF4CUc")
    //   .textContent.trim(),
    // TODO: Set up automated test for href format
    age: "",
    timestamp: Date.now(),
  }));
};

const transformBing = (
  headlines: any[],
  config: SearchConfig
): HeadlineData[] =>
  headlines
    .filter((el: any) => el.textContent !== "")
    .filter((el: any) => el.querySelector("a.title").textContent !== "")
    .map((el: any) => {
      const anchor = el.querySelector("a.title");
      const ageEl = el.querySelector(".source span:nth-child(3)");

      return {
        // remove spaces, tabs and new line substrings '\n'
        headline: anchor.textContent.replace(/\s\s+/g, " ").trim(),
        url: anchor.href,
        provider:
          anchor.attributes.getNamedItem("data-author") != null
            ? anchor.attributes.getNamedItem("data-author").value
            : "",
        age: ageEl != null ? ageEl.textContent : "",
        timestamp: Date.now(),
      };
    });
