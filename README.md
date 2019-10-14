# WebCrawler
A simple web crawler CLI application.

The aim of the application is to enumerate all the links for each page on a given domain. The result of the crawl will be output to a JSON file in the same directory as the application, with the same name as the domain provided. 

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

- Make use of [Map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map) to dedupe links
- Use [recursion](https://en.wikipedia.org/wiki/Recursion_(computer_science)) to traverse pages
- Create `HttpPage` class to encapsulate HTTP processing

## TODO

- handle [protocol-relative](https://en.wikipedia.org/wiki/URL#prurl) URLs better
- include more happy day scenario tests
- include more tests to cover error handling scenarios
- include integration tests (validate against a real URL)
- improve parameter validation (or better yet, use [TypeScript](https://www.typescriptlang.org/))
- improve the parallelism of page crawling
- implement [babel](https://babeljs.io/) to leverage ES2017 syntax (i.e. `yield`)
- implement rate-limiting to avoid potential [429](https://httpstatuses.com/429) errors
- include stats e.g. total links found, pages crawled etc.