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