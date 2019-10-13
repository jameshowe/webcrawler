const WebCrawler = require('./src/web_crawler');

(async () => {
  const crawler = new WebCrawler();
  const results = await crawler.crawl('http://mindgenius.com');
  console.log(results);
})();