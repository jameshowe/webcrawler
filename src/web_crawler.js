const { HttpPage, HttpPageLoadError } = require('./http_page');

class WebCrawler {

  /**
   * Creates a new WebCrawler
   */
  constructor() {
    this.crawled = null;
  }
  /**
   * Begins crawling process
   * @param {String} url  URL to start crawling from
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

  async traverse(page, crawled, result) {
    // avoid re-crawling same URL
    if (crawled.includes(page.href())) return;

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