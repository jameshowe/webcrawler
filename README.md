# WebCrawler
A simple web crawler CLI application.

The aim of the application is to enumerate all the links for each page on a given domain. The result of the crawl will be output to a JSON file in the `results` under the crawl domain e.g. `https://wiprodigital.com -> /results/wiprodigital.com.json` (a sample has been included)

There are some caveats:

- The application will automatically exclude JS / CSS links
- The application will not crawl external URLs
- The application will not crawl sub-domain URLs e.g. test.google.com

## Installing
```
npm i
```
## Running
```
npm start <domain>
```
*Note - `<domain>` may also be set as an environment variable `START_URL`, if both values are used the CLI takes precedence*

## Testing
```
npm test
```

## Notes

- Apply [SRP](https://en.wikipedia.org/wiki/Single_responsibility_principle) for scraping (`HttpPage`) and traversing (`WebCrawler`)
- Make use of [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) to dedupe links
- Use [recursion](https://en.wikipedia.org/wiki/Recursion_(computer_science)) to traverse pages
- Took the decision to not create an "exporter" or "deserializer" class, given the native support in Node for JSON serialization & file exporting. However, if the application needed to support various export types then this would perhaps be a good approach to introduce a common interface.

## TODO

- improve performance and speed of crawl e.g. run scrapes in parallel, use [pm2](https://pm2.keymetrics.io/) to scale out (although we need to be wary of race conditions, would need a mutex of some kind)
- include additional processing options e.g. max page depth, rate-limiting (protect against [429](https://httpstatuses.com/429) errors)
- decouple HTML parsing from `HttpPage` class (maybe down the line we want to move away from `cheerio`)
- move results deserialization / file exporting to separate classes
- avoid crawling CMS-related URLs (`/xmlrpc.php`, `/wp-json` etc.)
- improve canonicalization of URLs to avoid duplicatation / re-processing
- better hashtag URL processing (although the page is the same, they may pull dynamic content)
- better file name validation
- include stats e.g. total links found, pages crawled, crawl times etc.
- include more unit tests (happy-day, edge-case, error scenarios)
- include integration tests (validate against a real URL)
- implement [Babel](https://babeljs.io/) to leverage ES2017 syntax (i.e. `yield`, `Object.fromEntries`)
- improve parameter validation (or better yet, use [TypeScript](https://www.typescriptlang.org/))
- improve instrumentation, utilise remote services like [Loggly](https://www.loggly.com/), [Prometheus](https://prometheus.io/) or equivalent
- perf tests against readily available libs like [crawler](https://www.npmjs.com/package/crawler), make sure you are reinventing the wheel for good reason