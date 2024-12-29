import {
  Country,
  HeadlineData,
  Lang,
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
      url: `https://www.bing.com/news/search?q=${query}&cc=${country}&setLang=${lang}&qft=sortbydate%3d\"1\"+interval%3d\"7\"&form=YFNR`,
      selector: ".news-card",
      transform: transformBing,
    },
    staging: {
      url: `https://www.bing.com/news/search?q=${query}&cc=${country}&setLang=${lang}&qft=sortbydate%3d\"1\"+interval%3d\"7\"&form=YFNR`,
      selector: ".news-card",
      transform: transformBing,
    },
    development: {
      url: `https://www.bing.com/news/search?q=${query}&cc=${country}&setLang=${lang}&qft=sortbydate%3d\"1\"+interval%3d\"7\"&form=YFNR`,
      selector: ".news-card",
      transform: transformBing,
    },
  },
});

const transformBing = (
  headlines: any[],
  _config: SearchConfig
): HeadlineData[] =>
  headlines
    .filter((el: any) => el.textContent !== "")
    .filter((el: any) => el.querySelector("a.title")?.textContent !== "")
    .map((el: any) => [el.querySelector("a.title"), el.querySelector(".source span:nth-child(3)")])
    .filter(([anchor, _ageEl]) => !!anchor?.textContent)
    .map(([anchor, ageEl]) => ({
      // remove spaces, tabs and new line substrings '\n'
      headline: anchor.textContent.replace(/\s\s+/g, " ").trim(),
      url: anchor.href,
      provider:
        anchor.attributes.getNamedItem("data-author") != null
          ? anchor.attributes.getNamedItem("data-author").value
          : "",
      age: ageEl != null ? ageEl.textContent : "",
      timestamp: Date.now(),
    }));
