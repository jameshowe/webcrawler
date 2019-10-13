const axios = require('axios');
const cheerio = require('cheerio');
const urlParser = require('url');

class HttpPage {

  /**
   * Creates a new HttpPage
   * @param {String} url  URL for page
   * @class
   */
  constructor(url) {
    this.url = urlParser.parse(url);
    this.$ = null;
    this.links = null;
  }

  /**
   * Fetches HTML content for page
   * @param {Boolean} reload  Flag to ensure page is refetched if previously loaded (Default: false)
   */
  async load(reload = false) {
    if (this.$ && !reload) return;

    try {
      const result = await axios.get(this.url);
      this.$ = cheerio.load(result.data);
      this.links = []; // reset links on a fresh load
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Extracts all possible links from the HTML content
   * 
   * @returns {Array} Array of links
   */
  async getLinks() {
    if (!this.links) {
      // lazily load HTTP content
      await this.load();
      if (this.$) {
        this.$("[src*='/'],[href*='/']")
          .each(async (i, link) => {
            let src = link.attribs.src || link.attribs.href;
            this.links.push(src);
          });
      }
    }
    return this.links;
  }
}

module.exports = HttpPage;