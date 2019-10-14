const HttpPage = require('./http_page');

class WebCrawler {

  constructor() {
    this.crawled = null;
  }
  /**
   * Begins crawling process
   * @param {String} url  URL to start crawling from
   */
  async crawl(url) {
    this.crawled = [];
    return this.traverse(new HttpPage(url));
  }

  async traverse(page) {
    console.log(`Crawling ${page.url.href}...`)
    const result = await page.getLinks();
    for (const [url] of result.pages.entries()) {
      if (this.crawled.includes(url)) continue;

      this.crawled.push(url);
      try {
        const res = await this.traverse(new HttpPage(url));
        result.pages.set(url, res);
      } catch (e) {
        // URL failed, skip
        console.error(e);
      }
    }
    return result;
  }
}

module.exports = WebCrawler;