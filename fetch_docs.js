const https = require('https');
const fs = require('fs');

const urls = [
  'https://docs.rapidoreach.com/docs/v2/sdk/EmbedIframe',
  'https://docs.rapidoreach.com/docs/v2/api/surveyentrylink'
];

urls.forEach((url, i) => {
  https.get(url, { rejectUnauthorized: false }, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      // Strip HTML tags simply
      const text = data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
      fs.writeFileSync(`doc_${i}.txt`, text);
      console.log(`Saved doc_${i}.txt`);
    });
  }).on('error', err => console.error(err));
});
