import axios from 'axios';
import jsdom from 'jsdom';
const { JSDOM } = jsdom;
import { ResultPage, Lang } from '../logic/types';

// Get raw HTML and pull HTML elements properties. Only 20 results returned.
const searchHtml = async (query: string = 'news', resultPage: ResultPage = 1, lang: Lang = 'lang_en') => {
    const url = `https://www.google.com/search?q=${query}&tbm=nws&start=${(resultPage - 1) * 10}&lr=${lang}`;
    console.log(url);

    return axios
        .get(url)
        .then((results: { data: any }) => {
            const data = results.data;
            const dom = new JSDOM(data);

            const cards = [...dom.window.document.querySelectorAll('a div')];

            return cards.filter((card, i) => i % 4 === 0).map((card) => card.textContent);
        })
        .catch((err: any) => err)

    // TODO: test 1: Check for an empty array = Google changed table structure in html
    // TODO: test 2: checl for an array of empty objects = Google changed row structure in the image results table
}

export { searchHtml };