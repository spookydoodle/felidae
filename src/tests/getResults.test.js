/* 
  Below tests should not mock the fetch but actually pull data from the source
  to make sure that the source's DOM structure is still the same
  and returns expected values. If the test fails, the scrape method might need to 
  adjust the query selectors accordingly.
*/
import { getResults } from "../search/searchHTML";

test("Check bing result objects key structure", async () => {
  const res = await getResults("news", "general", "gb", "en", 1, {
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

// // Obsolete - google sucks
// test("Check google result objects key structure", async () => {
//   const res = await getResults("news", "general", "gb", "en", 1, {
//     environment: "production",
//     engine: "google",
//   });
//   const keys = Object.keys(res.results[0] || {});
//   const { headline, url } = res.results[0] || {};

//   expect(keys).toStrictEqual([
//     "category",
//     "country",
//     "lang",
//     "headline",
//     "url",
//     "provider",
//     "age",
//     "timestamp",
//   ]);
//   expect(typeof headline).toBe("string");
//   expect(headline.length > 0).toBe(true);
//   expect(url.substring(0, 4)).toBe("http");
// });
