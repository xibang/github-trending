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

axios.get('https://github.com/trending').then(({ data }) => {
  const $ = cheerio.load(data);
  const arr = [];
  $('.Box .Box-row').each((i, elm) => {
    const lang = $(elm).find('[itemprop="programmingLanguage"]');
    const desc = $(elm).find('p.text-gray');
    const item = {
      title: $(elm).find('h1 a').text().replace(/\s/g, ''),
      url: `https://github.com${$(elm).find('h1 a').attr('href')}`
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
