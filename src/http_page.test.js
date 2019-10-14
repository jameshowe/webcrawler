
const HttpPage = require('./http_page');
const axios = require('axios');
const cheerio = require('cheerio');

jest.mock('axios');
jest.mock('cheerio');

let page;

describe('HttpPage', () => {

  describe('#constructor', () => {
    test('throws if URL does not include protocol', () => {
      expect(() => new HttpPage('test.domain.com')).toThrowError(Error);
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

    beforeAll(() => {
      axios.get.mockResolvedValue({
        data: '<div></div>'
      });
      page = new HttpPage('http://wiprodigital.com');
    })

    test('fetches HTTP content', async () => {
      await page.load();
      expect(axios.get).toBeCalledWith('http://wiprodigital.com/');
    })

    test('parse HTML via cheerio', async () => {
      await page.load();
      expect(cheerio.load).toBeCalledWith('<div></div>');
    })

    test('resets links', async () => {
      page.links = { media: ['test'] };
      await page.load();
      expect(page.links).toEqual({
        pages: new Map(),
        external: new Map(),
        media: new Map()
      })
    })

    test('does not throw if invalid HTML returned from URL', () => {
      axios.get.mockResolvedValue({
        data: '<p></div>'
      });
      expect(async () => await page.load()).not.toThrowError(Error);
    })
  })

  describe('#getLinks', () => {

  })

})