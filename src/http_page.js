const axios = require('axios');
const cheerio = require('cheerio');
const urlParser = require('url');
const crypto = require('crypto');

// ensure we only ever return string responses
axios.defaults.transformResponse = data => data;

/**
 * Class to respresnt a HTTP page load error
 */
class HttpPageLoadError extends Error {

  /**
   * Creates a HttpPageLoadError instance
   * @param {String} url 
   */
  constructor(url, statusCode) {
    super(`URL failed with status code ${statusCode} - ${url}`);
    this.url = url;
    this.statusCode = statusCode;
  }
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
    this.contentHash = null;
  }

  /**
   * Returns href for page
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
      const hash = crypto.createHash('sha256');
      hash.update(result.data, 'utf8');
      this.contentHash = hash.digest('hex');
      this.loaded = true;
      return this.$;
    } catch (e) {
      console.error(e.stack);
      let status = e.response ? e.response.status : 500;
      throw new HttpPageLoadError(this.url.href, status);
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
    return (/\.(gif|jpe?g|tiff|png|bmp|svg)$/i).test(url);
  }

  /**
   * Verifies whether the supplied url is JS or CSS content
   * @param {String} url  URL to verify
   */
  isJsOrCssUrl(url) {
    return (/\.(css|js)$/i).test(url);
  }

  /**
   * Convert a relative URL to an absolute URL
   * @param {String} url  Relative URL
   */
  relToAbs(url) {
    // ensure host name for URL, strip away query string parameters
    return new urlParser.URL(url, this.url.href).href;
  }

  /**
   * Scrape HTML content all possible links
   * @returns Scrape results
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

        // skip CSS / JS / Data / Mailto URLs
        if (this.isJsOrCssUrl(relUrl)) return;
        if (relUrl && relUrl.startsWith('data:')) return;
        if (relUrl && relUrl.startsWith('mailto:')) return;

        if (this.isImageUrl(relUrl)) {
          result.mediaUrls.set(pageUrl.host ? src : this.relToAbs(src), null);
        } else if (pageUrl.host && !this.isSameDomain(pageUrl.host)) {
          result.externalUrls.set(src, null);
        } else if (relUrl !== this.url.pathname) {
          result.linkUrls.set(this.relToAbs(relUrl), null);
        }
      });
    return result;
  }
}

module.exports = {
  HttpPage,
  HttpPageLoadError
};