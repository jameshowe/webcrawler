const { HttpPage, HttpPageLoadError } = require('./http_page');

/**
 * Class to represent a web crawler 
 */
class WebCrawler {

  /**
   * Crawl links for the specified URL
   * @param {String} url
   */
  async crawl(url) {
    const result = {
      linkUrls: new Map(),
      externalUrls: new Map(),
      mediaUrls: new Map(),
      deadLinks: new Map()
    };
    await this.traverse(new HttpPage(url), [], [], result);
    return result;
  }

  /**
   * Recursively scrape page URLs ensuring each crawlable link is visited once
   * @param {HttpPage} page   Page to crawl
   * @param {Array} crawled   Array of URLs that have already been crawled
   * @param {Array} hashes    Array of Page Content hashes that have already been crawled
   * @param {Object} result   Resultset to be updated from crawl
   */
  async traverse(page, urls, hashes, result) {
    try {
      // if we've already processed this URL then skip
      if (urls.includes(page.href())) return;

      urls.push(page.href());
      await page.load();
      if (hashes.includes(page.contentHash)) {
        // we haven't seen this URL, but we've seen this content before
        // ignore the URL and don't rescrape the content
        urls.pop();
        return;
      }

      console.log(`Crawling ${page.href()}...`);
      // take a note of the content hash for the current page & scrape the links
      hashes.push(page.contentHash);
      const pageResult = await page.scrape();
      // merge page results with overall results
      result.linkUrls = new Map([...result.linkUrls, ...pageResult.linkUrls]);
      result.externalUrls = new Map([...result.externalUrls, ...pageResult.externalUrls]);
      result.mediaUrls = new Map([...result.mediaUrls, ...pageResult.mediaUrls]);
      // traverse page links
      for (const [url] of pageResult.linkUrls) {
        await this.traverse(new HttpPage(url), urls, hashes, result);
      }
    } catch (e) {
      console.error(e);
      // skip pages we couldn't load (for whatever reason)
      if (e instanceof HttpPageLoadError) {
        if (e.statusCode === 404) {
          result.deadLinks.set(e.url);
        }
      } else {
        throw e;
      }
    }
  }
}

module.exports = WebCrawler;
