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
    if (!this.url.host) throw Error(`Invalid URL ${url} - must include protocol`);

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
      const result = await axios.get(this.url.href);
      this.$ = cheerio.load(result.data);
      // reset links on a fresh load
      this.links = {
        pages: new Map(),
        external: new Map(),
        media: new Map()
      };
    } catch (e) {
      console.error(e);
    }
  }

  /**
   * Verifies that the supplied hostname matches the domain of the loaded HTTP page
   * @param {String} host  Hostname to verify
   */
  isSameDomain(host) {
    const hostA = host.replace('www.', '');
    const hostB = this.url.host.replace('www.', '');
    return hostA === hostB;
  }

  /**
   * Verifies whether the supplied url is image content
   * @param {String} url  URL to verify
   */
  isImageUrl(url) {
    return (/\.(gif|jpe?g|tiff|png|bmp)$/i).test(url);
  }

  /**
   * Verifies whether the supplied url is JS or CSS content
   * @param {String} url  URL to verify
   */
  isJsOrCssUrl(url) {
    return (/\.(css|js)$/i).test(url);
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

            const pageUrl = urlParser.parse(src);
            const relUrl = pageUrl.pathname;
            if (pageUrl.host && !this.isSameDomain(pageUrl.host)) {
              this.links.external.set(src, null);
            } else if (this.isImageUrl(relUrl)) {
              this.links.media.set(src, null);
            } else if (relUrl !== this.url.pathname && !this.isJsOrCssUrl(relUrl)) {
              if (!pageUrl.host) {
                src = urlParser.resolve(this.url.host, relUrl);
              }
              this.links.pages.set(src, {});
            }
          });
      }
    }
    return this.links;
  }
}

module.exports = HttpPage;