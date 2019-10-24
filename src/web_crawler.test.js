const WebCrawler = require('./web_crawler');
const { HttpPage } = require('./http_page');
const axios = require('axios');

jest.mock('axios');

let crawler;

const emptyResultset = {
  deadLinks: new Map(),
  externalUrls: new Map(),
  linkUrls: new Map(),
  mediaUrls: new Map()
}

describe('WebCrawler', () => {

  beforeEach(() => {
    crawler = new WebCrawler();
  })

  describe('#crawl', () => {

    beforeEach(() => {
      jest.spyOn(crawler, 'traverse').mockImplementation();
    });

    test('starts traversing URL', async () => {
      await crawler.crawl('https://wiprodigital.com');
      expect(crawler.traverse).toHaveBeenCalledWith(
        new HttpPage('https://wiprodigital.com'), 
        [], 
        [], 
        emptyResultset
      );
    });
    test('uses fresh resultset on each crawl', async () => {
      await crawler.crawl('https://wiprodigital.com');
      await crawler.crawl('https://buildit.wiprodigital.com');
      await crawler.crawl('https://stackoverflow.com')
      expect(crawler.traverse).toHaveBeenNthCalledWith(
        1,
        new HttpPage('https://wiprodigital.com'), 
        [], 
        [], 
        emptyResultset
      );
      expect(crawler.traverse).toHaveBeenNthCalledWith(
        2,
        new HttpPage('https://buildit.wiprodigital.com'), 
        [], 
        [], 
        emptyResultset
      );
      expect(crawler.traverse).toHaveBeenNthCalledWith(
        3,
        new HttpPage('https://stackoverflow.com'), 
        [], 
        [], 
        emptyResultset
      );
    })
    test('returns crawl result', async () => {
      axios.get.mockResolvedValue({
        data: '<a href="/about"/><a href="https://facebook.com/WiproDigital" /><img src="/images/logo.png" />'
      });
      crawler.traverse.mockRestore()
      const result = await crawler.crawl('https://buildit.wiprodigital.com');
      expect(result).toEqual({
        deadLinks: new Map(),
        externalUrls: new Map([['https://facebook.com/WiproDigital', null]]),
        linkUrls: new Map([['https://buildit.wiprodigital.com/about', null]]),
        mediaUrls: new Map([['https://buildit.wiprodigital.com/images/logo.png', null]])
      })
    })
  })

  describe('#traverse', () => {

    test.skip('loads page', () => {});
    test.skip('scrapes page', () => {});
    test.skip('tracks URL', () => {});
    test.skip('tracks content hash', () => {});
    test.skip('follows crawlable links', () => {});
    test.skip('does not follow external URLs', () => {});
    test.skip('tracks dead links', () => {});
    test('avoids recrawling page if URL has already been processed', async () => {
      const page = new HttpPage('https://buildit.wiprodigital.com/articles/about');
      page.load = jest.fn();
      await crawler.traverse(
        page, 
        ['https://buildit.wiprodigital.com/articles/about'], 
        [],
        emptyResultset
      );
      expect(page.load).not.toBeCalled();
    });
    test('avoids recrawling page if content has already been scraped', async () => {
      const page = new HttpPage('https://buildit.wiprodigital.com/articles/12345/article-one');
      page.loaded = true;
      page.contentHash = 'abcd';
      page.scrape = jest.fn().mockImplementation(() => emptyResultset)
      await crawler.traverse(
        page, 
        ['https://buildit.wiprodigital.com/articles/12345/article-one-renamed'], 
        ['abcd'],
        emptyResultset
      );
      expect(page.scrape).not.toBeCalled();
    });

  })
});