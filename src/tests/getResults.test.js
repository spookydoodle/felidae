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

// test("Check if heading type is string", async () => {
//   const res = await getResults();
//   const heading = res.results[0].heading;

//   expect(typeof heading).toBe("string");
// });

// test("Check if heading length > 0", async () => {
//   const res = await getResults();
//   const heading = res.results[0].heading;

//   expect(heading.length > 0).toBe(true);
// });

// test("Check that url starts with 'http'", async () => {
//   const res = await getResults();
//   const url = res.results[0].url;

//   expect(url.substring(0, 4)).toBe("http");
// });
