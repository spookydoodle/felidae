"use strict";
// https://stenevang.wordpress.com/2013/02/22/google-advanced-power-search-url-request-parameters/
// q - query;
// tbm=nws - search in news section
// start=10 - second page, start from the 10th result (10 per page)
// cr=xx - results from country of origin
// lr=lang_xx - results language
// tbs=qdr:d,sbd:n -  (sbd)sort by: relevance 0; date 1
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSelections = void 0;
var getSelections = function (query, country, lang, resultPageIndex) { return ({
    google: {
        production: {
            url: "https://www.google.com/search?q=" + query + "&tbm=nws&start=" + (resultPageIndex - 1) * 10 + "&cr=" + country + "&lr=lang_" + lang + "&tbs=qdr:d,sbd:0",
            // selector: "#main > div:nth-child(n+2) > div > div:nth-child(1) > a",
            selector: "#search > div > div > div a",
            transform: transformGoogle,
        },
        staging: {
            url: "https://www.google.com/search?q=" + query + "&tbm=nws&start=" + (resultPageIndex - 1) * 10 + "&cr=" + country + "&lr=lang_" + lang + "&tbs=qdr:d,sbd:0",
            selector: "#search > div > div > div a",
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
            url: "https://www.bing.com/news/search?q=" + query + "&cc=" + country + "&setLang=" + lang + "&qft=sortbydate%3d\"1\"+interval%3d\"4\"",
            selector: ".news-card",
            transform: transformBing,
        },
        staging: {
            url: "https://www.bing.com/news/search?q=" + query + "&cc=" + country + "&setLang=" + lang + "&qft=sortbydate%3d\"1\"+interval%3d\"4\"",
            selector: ".news-card",
            transform: transformBing,
        },
        development: {
            url: "http://localhost:5000/news/dummy/bing",
            selector: ".news-card",
            transform: transformBing,
        },
    },
}); };
exports.getSelections = getSelections;
// Receive html elements with headlines and transform to desired output format
// HTML objects array is in format: [headline0, image0, headline1, image1, headline2...].
// We need only the headline, so the array is first filtered by even indexes
// TODO: this is not working well enough yet
var transformGoogle = function (headlines, config) {
    var environment = config.environment;
    return headlines.map(function (el, i) { return ({
        headline: el.querySelector("div > div:nth-child(2) > div + div:nth-child(2)") !=
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
        provider: el.querySelector("div > div:nth-child(2) > div + div:nth-child(1)") !=
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
    }); });
};
var transformBing = function (headlines, config) {
    return headlines
        .filter(function (el) { return el.textContent !== ""; })
        .filter(function (el) { return el.querySelector("a.title").textContent !== ""; })
        .map(function (el) {
        var anchor = el.querySelector("a.title");
        var ageEl = el.querySelector(".source span:nth-child(3)");
        return {
            // remove spaces, tabs and new line substrings '\n'
            headline: anchor.textContent.replace(/\s\s+/g, " ").trim(),
            url: anchor.href,
            provider: anchor.attributes.getNamedItem("data-author") != null
                ? anchor.attributes.getNamedItem("data-author").value
                : "",
            age: ageEl != null ? ageEl.textContent : "",
            timestamp: Date.now(),
        };
    });
};
