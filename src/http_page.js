const axios = require('axios');
const cheerio = require('cheerio');
const urlParser = require('url');
const { mapToObject } = require('./utils');

/**
 * Class to respresnt a HTTP page load error
 */
class HttpPageLoadError extends Error {
}

/**
 * Class to reprsent a HTTP page
 */
class HttpPage {

  /**
   * Creates a new HttpPage instance
   * @param {String} url  URL for HTTP page
   */
  constructor(url) {
    this.url = urlParser.parse(url);
    if (!this.url.host) throw Error(`Invalid URL ${url} - must include protocol`);

    this.$ = null;
    this.loaded = false;
  }

  /**
   * Returns href for page
   * 
   * @readonly
   */
  href() {
    return this.url.href;
  }

  /**
   * Fetches HTML content for page
   * @param {Boolean} reload  Flag to ensure page is refetched if previously loaded (Default: false)
   */
  async load(reload = false) {
    // optimization to avoid re-fetching HTML content
    if (this.loaded && !reload) return this.$;

    try {
      const result = await axios.get(this.url.href);
      this.$ = cheerio.load(result.data);
      this.loaded = true;
      return this.$;
    } catch (e) {
      if (e.isAxiosError) {
        console.error(e.data, e.stack);
      } else {
        console.error(e);
      }
      throw new HttpPageLoadError('Failed to load URL')
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
   * Scrape HTML content all possible links
   * 
   * @returns {Object} Scrape result
   */
  async scrape() {
    // use maps to dedupe URLs
    const result = {
      linkUrls: new Map(),
      externalUrls: new Map(),
      mediaUrls: new Map()
    }
    // lazily load HTTP content
    const $ = await this.load();
    // deem any elements with a src / href attribute a link
    $("[src],[href]")
      .each(async (i, link) => {
        let src = link.attribs.src || link.attribs.href;
        // skip hash links (most likely used for event handling)
        if (src.startsWith('#')) return;

        // extract query string / hash from URLs
        const pageUrl = urlParser.parse(src, false, true);
        let relUrl = pageUrl.pathname;
        if (!relUrl) return; // skip root entries

        // remove trailing slash (unless root)
        if (relUrl.length > 1 && relUrl.endsWith('/')) {
          relUrl = relUrl.substr(0, relUrl.length-1);
        }

        // skip CSS / JS / Data URLs
        if (this.isJsOrCssUrl(relUrl)) return;
        if (relUrl && relUrl.startsWith('data:')) return;

        if (this.isImageUrl(relUrl)) {
          result.mediaUrls.set(src, null);
        } else if (pageUrl.host && !this.isSameDomain(pageUrl.host)) {
          result.externalUrls.set(src, null);
        } else if (relUrl !== this.url.pathname) {
          // ensure host name for URL, strip away query string parameters
          const parsedUrl = new urlParser.URL(relUrl, this.url.href);
          result.linkUrls.set(parsedUrl.href, null);
        }
      });
    return result;
  }
}

module.exports = {
  HttpPage,
  HttpPageLoadError
};