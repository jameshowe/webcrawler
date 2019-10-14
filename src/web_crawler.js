const { HttpPage, HttpPageLoadError } = require('./http_page');

class WebCrawler {

  constructor() {
    this.crawled = null;
  }
  /**
   * Begins crawling process
   * @param {String} url  URL to start crawling from
   */
  async crawl(url) {
    return this.traverse(new HttpPage(url), []);
  }

  async traverse(page, crawled) {
    console.log(`Crawling ${page.href()}...`);
    try {
      crawled.push(page.href());
      const result = await page.scrape();
      // traverse page links
      const urls = Object.keys(result.linkUrls);
      const uncrawledUrls = urls.filter(x => !crawled.includes(x));
      for (const url of uncrawledUrls) {
        result.linkUrls[url] = await this.traverse(new HttpPage(url), crawled);
      }
      return result;
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