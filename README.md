# WebCrawler
A simple web crawler CLI application

## Acceptance Criteria

1. Limit the crawl to a single domain (do not crawl external / sub-domains)
2. Visit all pages within the chosen domain
3. Output a simple structured site map displaying for each page:
  - Links to other pages
  - Extenral URLs
  - Static content (e.g. images)

## Assumptions

- We want to exclude CSS / JS links
- We want to crawl the entire website
- We do not want to stop the crawler if there is a problem crawling a particular page

## Notes

- Make use of [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) to dedupe links
- Use [recursion](https://en.wikipedia.org/wiki/Recursion_(computer_science)) to traverse pages
- Create HttpPage class to encapsulate HTTP processing

## Improvements

- handle [protocol-relative](https://en.wikipedia.org/wiki/URL#prurl) URLs better
- include more happy day scenario tests
- include more test to cover error handling scenarios
- include integration tests (validate against a real URL)
- improve parameter validation (or better yet, use [TypeScript](https://www.typescriptlang.org/))