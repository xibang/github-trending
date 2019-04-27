const axios = require('axios');
const cheerio = require('cheerio');
const path = require('path');
const { writeFileSync } = require('fs');

const formatDate = (inputPattern, inputDate) => {
  const date = new Date(inputDate).toString() === 'Invalid Date' ? new Date() : new Date(inputDate);
  let pattern = inputPattern || 'yyyy-MM-dd hh:mm:ss';
  const y = date.getFullYear().toString();
  const o = {
    M: date.getMonth() + 1, // month
    d: date.getDate(), // day
    h: date.getHours(), // hour
    m: date.getMinutes(), // minute
    s: date.getSeconds() // second
  };
  pattern = pattern.replace(/(y+)/ig, (a, b) => y.substr(4 - Math.min(4, b.length)));
  /* eslint no-restricted-syntax:0,guard-for-in:0 */
  for (const i in o) {
    pattern = pattern.replace(new RegExp(`(${i}+)`, 'g'), (a, b) => ((o[i] < 10 && b.length > 1) ? `0${o[i]}` : o[i]));
  }
  return pattern;
};

axios.get('https://github.com/trending?_pjax=%23container', {
  headers: {
    'X-PJAX': 'true',
    'X-PJAX-Container': '#container',
    'X-Requested-With': 'XMLHttpRequest'
  }
}).then(({ data }) => {
  const $ = cheerio.load(data);
  const arr = [];
  $('.repo-list li').each((i, elm) => {
    const lang = $(elm).find('[itemprop="programmingLanguage"]');
    const desc = $(elm).find('.py-1');
    const item = {
      title: $(elm).find('h3 a').text().replace(/\s/g, ''),
      url: `https://github.com${$(elm).find('h3 a').attr('href')}`
    };
    if (lang.length !== 0) {
      item.lang = lang.text().replace(/\s/g, '');
    }
    if (desc.length !== 0) {
      item.desc = desc.text().replace(/\n/g, '').trim();
      item.cn = /[\u4E00-\u9FA5\uF900-\uFA2D]/.test(item.desc);
    }
    arr.push(item);
  });
  const date = formatDate('yyyy-MM-dd');
  writeFileSync(path.resolve(__dirname, '../data/', `${date}.json`), JSON.stringify(arr, null, 2), 'utf-8');
});
