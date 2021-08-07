/* 
  Below tests should not mock the fetch but actually pull data from the source
  to make sure that the source's DOM structure is still the same
  and returns expected values. If the test fails, the scrape method might need to 
  adjust the query selectors accordingly.
*/
import { getResults } from "../search/searchHTML";

test("Check result objects key structure", async () => {
  const res = await getResults();
  const keys = Object.keys(res.results[0]);
  const { heading, url } = res.results[0];
  
  expect(keys).toStrictEqual(["heading", "provider", "url", "date"]);
  expect(typeof heading).toBe("string");
  expect(heading.length > 0).toBe(true);
  expect(url.substring(0, 4)).toBe("http");
});