const path = require('path');
const fs = require('fs');
const WebCrawler = require('./src/web_crawler');
const { sortMapKeys } = require('./src/utils');

const START_URL = process.argv[2] || process.env.START_URL;// || 'http://wiprodigital.com';
if (!START_URL) throw new Error('Pass start URL as first CLI parameter or set "START_URL" environment variable');

const saveToJson = (crawl_result, file_name) => {
  const file_dir = path.resolve(__dirname, 'results');
  if (!fs.existsSync(file_dir)){
    fs.mkdirSync(file_dir);
  }
  const file_path = `${path.resolve(file_dir, file_name)}.json`;
  console.log(`Exporting results to ${file_path}`);
  const data = {
    linkUrls: sortMapKeys(crawl_result.linkUrls),
    mediaUrls: sortMapKeys(crawl_result.mediaUrls),
    externalUrls: sortMapKeys(crawl_result.externalUrls)
  }
  fs.writeFileSync(file_path, JSON.stringify(data, null, 2));
}

(async () => {
  const crawler = new WebCrawler();
  const domain = START_URL.split('//')[1];
  console.time('crawl');
  saveToJson(await crawler.crawl(START_URL), domain);
  console.timeEnd('crawl');
  console.log('Crawl complete!');
})();