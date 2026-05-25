const https = require('https');

// From the user's message earlier:
// App Id: parPnrD9RiU
// App Key: 3912bbe80f741af48d3624ce4a4d1b37
const apiKey = '3912bbe80f741af48d3624ce4a4d1b37';
const userId = 'test_user_123';

const url = `https://api.rapidoreach.com/api/v1/surveys?api_key=${apiKey}&user_id=${userId}`;

https.get(url, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('Body:', data);
  });
}).on('error', (e) => {
  console.error(e);
});
