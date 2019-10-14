
const { HttpPage, HttpPageLoadError } = require('./http_page');
const axios = require('axios');
const cheerio = require('cheerio');

jest.mock('axios');

let page;

describe('HttpPage', () => {

  describe('#constructor', () => {
    test('throws if URL does not include protocol', () => {
      expect(() => new HttpPage('test.domain.com')).toThrow(Error);
    });
  })

  describe('#isSameDomain', () => {

    beforeAll(() => {
      page = new HttpPage('http://wiprodigital.com');
    })

    test('returns true when host equals domain', () => {
      expect(page.isSameDomain('www.wiprodigital.com')).toBe(true);
    })

    test('returns true when www is missing', () => {
      expect(page.isSameDomain('wiprodigital.com')).toBe(true);
    })

    test('returns false when host does not equal domain', () => {
      expect(page.isSameDomain('www.google.com')).toBe(false);
    })

    test('returns false when TLD of host does not match', () => {
      expect(page.isSameDomain('www.wiprodigital.co.uk')).toBe(false);
    })
  })

  describe('#isImageUrl', () => {
    test('returns true for jpg', () => {
      expect(page.isImageUrl('/images/test.jpg')).toBe(true);
    })
    test('returns true for gif', () => {
      expect(page.isImageUrl('/images/test.gif')).toBe(true);
    })
    test('returns false for js', () => {
      expect(page.isImageUrl('/images/test.js')).toBe(false);
    })
  })

  describe('#isJsOrCssUrl', () => {
    test('returns true for js', () => {
      expect(page.isJsOrCssUrl('/assets/test.js')).toBe(true);
    })
    test('returns true for css', () => {
      expect(page.isJsOrCssUrl('/assets/test.css')).toBe(true);
    })
    test('returns false for jpg', () => {
      expect(page.isJsOrCssUrl('/assets/test.jpg')).toBe(false);
    })
  })

  describe('#load', () => {

    let cheerioLoad;

    beforeAll(() => {
      axios.get.mockResolvedValue({
        data: '<div></div>'
      });
      // mock cheerio.load func
      cheerioLoad = cheerio.load;
      cheerio.load = jest.fn(() => null);
      page = new HttpPage('http://wiprodigital.com');
    })

    afterAll(() => {
      // restore cheerio.load
      cheerio.load = cheerioLoad;
    })

    test('fetches HTTP content', async () => {
      await page.load();
      expect(axios.get).toBeCalledWith('http://wiprodigital.com/');
    })

    test('parse HTML via cheerio', async () => {
      await page.load();
      expect(cheerio.load).toBeCalledWith('<div></div>');
    })

    test('throws when HTTP request fails', () => {
      axios.get.mockRejectedValue(new Error());
      expect(async () => await page.load()).toThrow(HttpPageLoadError);
    })

    test('does not throw if invalid HTML returned from URL', () => {
      axios.get.mockResolvedValue({
        data: '<p></div>'
      });
      expect(async () => page.load()).not.toThrow(Error);
    })
  })

  describe('#scrape', () => {

    beforeAll(() => {
      axios.get.mockResolvedValue({
        data: '<div><a href="https://wiprodigital.com/page-one">One</a><a href="/page-two">Two</a><a href="https://www.facebook.com/WiproDigital/">Facebook</a><a href="https://twitter.com/wiprodigital">Twitter</a><img src="/images/logo.jpg" /><img src="/images/logo.gif" /></div>'
      });
      page = new HttpPage('http://wiprodigital.com');
    })

    it('returns map of links for page', async () => {
      const result = await page.scrape();
      expect(result).toEqual({
        linkUrls: {
          'https://wiprodigital.com/page-one': {},
          'https://wiprodigital.com/page-two': {}
        },
        externalUrls: [
          'https://www.facebook.com/WiproDigital',
          'https://twitter.com/wiprodigital'
        ],
        mediaUrls: [
          'https://wiprodigital.com/images/logo.jpg',
          'https://wiprodigital.com/images/logo.gif'
        ]
      })
    })

    it('handles relative URLs', () => { throw new Error('NotImplemented') })
    it('handles protocol-relative URLs', () => { throw new Error('NotImplemented') })
    it('excludes CSS URLs', () => { throw new Error('NotImplemented') })
    it('excludes JS URLs', () => { throw new Error('NotImplemented') })
    it('excludes data URLs', () => { throw new Error('NotImplemented') })

  })

})