import axios from 'axios';
import createLogMsg from "../utils/createLogMsg";
import jsdom from "jsdom";
import {
    ResultPage,
    Lang,
    Country,
    SearchResult,
    Headline,
    SearchConfig,
    SelectorData,
    SearchParams,
} from "../logic/types";
import { getSelections } from "./selections";

interface ErrorType {
    response?: {
        status?: string | number;
    };
    message?: string;
};

const { JSDOM } = jsdom;

const defaultQuery = "news";
const defaultLang: Lang = "en";
const defaultCountry: Country = "gb";

const headers = {
    "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36 Edg/92.0.902.73",
};

export const getResults = async (
    query: string = defaultQuery,
    params: SearchParams,
    config: SearchConfig
): Promise<SearchResult> => {
    const { category, country = defaultCountry, lang = defaultLang } = params;
    const { environment, engine } = config;
    const selectorData: SelectorData = getSelections(query, country, lang);
    const { url, selector, transform } = selectorData[engine][environment || "development"];

    // Request url and transform results to the right format
    const result: SearchResult = await axios
        .get<string>(url, { headers })
        .then(({ data }) => {
            createLogMsg(`Processing data received from ${url}`, "info");
            const { document } = new JSDOM(data).window;

            const headlines = [...document.querySelectorAll(selector)];

            // Expected result set is 10
            // TODO: Set up automated check for length 10
            const results: Headline[] = transform(headlines).map((headline) => ({
                category,
                country,
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
            console.error(err);
            const results: Headline[] = [];

            return {
                error: Number(err?.response?.status) || err?.message || "Unknown error",
                results,
            };
        });

    return result;
};

// To avoid 429 errors, add throttling and assure 5s breaks between each request
// Below method needs to be executed synchronously
// TODO: Add generic 'for ... of ...'throttle method as a wrapper to reuse in the other parts of the app
export const getAllResults = async (
    query: string = defaultQuery,
    params: SearchParams,
    maxPageIndex: ResultPage,
    config: SearchConfig
): Promise<SearchResult> => {
    const { category, country = defaultCountry, lang = defaultLang } = params;
    const results: {
        error: string | number | null;
        results: Headline[][];
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

        const response: SearchResult = await getResults(
            query,
            { category, country, lang },
            config
        )
            .then((res) => {
                createLogMsg(
                    `Data for query '${query}' from country '${country}' in lang '${lang}' from page ${i + 1} processed successfully.`,
                    "success"
                );
                return res;
            })
            .catch((err) => {
                createLogMsg(
                    `Requesting data for query '${query}' from country '${country}' in lang '${lang}' from page ${i + 1} returned an error.`,
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

    return {
        error: results.error,
        results: results.results.flat(),
    };
};

