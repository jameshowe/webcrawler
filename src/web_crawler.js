const HttpPage = require('./http_page');

class WebCrawler {

  /**
   * Begins crawling process
   * @param {String} url  URL to start crawling from
   */
  async crawl(url) {
    const page = new HttpPage(url);
    const links = await page.getLinks();
    for (const url of links) {
      console.log(url);
    }
  }
}

module.exports = WebCrawler;