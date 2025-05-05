import {
  Country,
  HeadlineData,
  Lang,
  SelectorData,
  UrlSelectorData,
} from "../logic/types";

export const getSelections = (
  query: string,
  country: Country,
  lang: Lang
): SelectorData => ({
  bing: {
    production: {
      url: `https://www.bing.com/news/search?q=${query}&cc=${country}&setLang=${lang}&qft=sortbydate%3d"1"+interval%3d"7"&form=YFNR`,
      selector: ".news-card",
      transform: transformBing,
    },
    staging: {
      url: `https://www.bing.com/news/search?q=${query}&cc=${country}&setLang=${lang}&qft=sortbydate%3d"1"+interval%3d"7"&form=YFNR`,
      selector: ".news-card",
      transform: transformBing,
    },
    development: {
      url: `https://www.bing.com/news/search?q=${query}&cc=${country}&setLang=${lang}&qft=sortbydate%3d"1"+interval%3d"7"&form=YFNR`,
      selector: ".news-card",
      transform: transformBing,
    },
  },
});

const transformBing: UrlSelectorData['transform'] = (headlines): HeadlineData[] => {
    const result: HeadlineData[] = [];

    for (const headline of headlines) {
        const title = headline.querySelector("a.title");
        const anchor: HTMLAnchorElement | null = title?.hasAttribute("href") ? title as HTMLAnchorElement : null;
        const img = headline.querySelector("a.imagelink > img") as HTMLImageElement | null;
        const ageEl = headline.querySelector(".source span:nth-child(3)");
        if (!anchor?.textContent) {
            continue;
        }

        result.push({
            headline: anchor.textContent.replace(/\s\s+/g, " ").trim(),
            url: anchor.href,
            provider: anchor.attributes.getNamedItem("data-author")?.value ?? "",
            img: img?.src ?? null,
            age: ageEl?.textContent ?? "",
            timestamp: Date.now()
        });
    }

    return result;
}
