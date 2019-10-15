const { HttpPage, HttpPageLoadError } = require('./http_page');

/**
 * Class to represent a web crawler 
 */
class WebCrawler {

  /**
   * Creates a new WebCrawler instance
   */
  constructor() {
    this.crawled = null;
  }
  
  /**
   * Crawl links for the specified URL
   * @param {String} url
   */
  async crawl(url) {
    const result = {
      linkUrls: new Map(),
      externalUrls: new Map(),
      mediaUrls: new Map()
    };
    await this.traverse(new HttpPage(url), [], result);
    return result;
  }

  /**
   * Recursively scrape page URLs ensuring each crawlable link is visited once
   * @param {HttpPage} page   Page to crawl
   * @param {Array} crawled   Array of URLs that have already been crawled
   * @param {Object} result   Resultset to be updated from crawl
   */
  async traverse(page, crawled, result) {
    console.log(`Crawling ${page.href()}...`);
    try {
      crawled.push(page.href());
      const pageResult = await page.scrape();
      // merge page results with overall results
      result.linkUrls = new Map([...result.linkUrls, ...pageResult.linkUrls]);
      result.externalUrls = new Map([...result.externalUrls, ...pageResult.externalUrls]);
      result.mediaUrls = new Map([...result.mediaUrls, ...pageResult.mediaUrls]);
      // traverse page links
      for (const [url] of pageResult.linkUrls) {
        if (crawled.includes(url)) continue;

        await this.traverse(new HttpPage(url), crawled, result);
      }
    } catch (e) {
      console.error(e);
      // skip pages we couldn't load (for whatever reason)
      if (!(e instanceof HttpPageLoadError)) {
        throw e;
      }
    }
  }
}

module.exports = WebCrawler;