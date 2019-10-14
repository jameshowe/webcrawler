const WebCrawler = require('./src/web_crawler');

const START_URL = process.argv[2] || process.env.START_URL;// || 'http://wiprodigital.com';

(async () => {
  const crawler = new WebCrawler();
  const results = await crawler.crawl(START_URL);
  console.log(results);
})();