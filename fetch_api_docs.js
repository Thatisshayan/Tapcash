const https = require('https');
const fs = require('fs');

https.get('https://docs.rapidoreach.com/docs/v2/api/apiendpoints', { rejectUnauthorized: false }, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const text = data.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
    fs.writeFileSync('doc_api.txt', text);
    console.log('Saved doc_api.txt');
  });
}).on('error', err => console.error(err));
