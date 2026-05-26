const https = require('https');
const appId = "parPnrD9RiU";
const url = `https://rewardcenter.rapidoreach.com?api_key=${appId}&user_id=test_uid`;

https.get(url, (res) => {
  console.log('Status Code:', res.statusCode);
  console.log('Headers:', res.headers);
}).on('error', (e) => {
  console.error('Error:', e.message);
});
