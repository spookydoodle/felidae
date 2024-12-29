import { getResults } from "../search/searchHTML";

describe('News', () => {
  test("Check bing result objects key structure", async () => {
    const res = await getResults("news", { 
      category: "general", 
      country: "de", 
      lang: "de" 
    }, {
      environment: "production",
      engine: "bing",
    });
    const keys = Object.keys(res.results[0] || {});
    const { headline, url } = res.results[0] || {};

    expect(keys).toStrictEqual([
      "category",
      "country",
      "lang",
      "headline",
      "url",
      "provider",
      "age",
      "timestamp",
    ]);
    expect(typeof headline).toBe("string");
    expect(headline.length > 0).toBe(true);
    expect(url.substring(0, 4)).toBe("http");
  });
})