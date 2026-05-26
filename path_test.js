const https = require('https');

const paths = [
  '/',
  '/RewardCenter',
  '/rewardcenter',
  '/surveys'
];

paths.forEach(path => {
  const url = `https://surveys.rapidoreach.com${path}?api_key=parPnrD9RiU&user_id=test_uid`;
  https.get(url, (res) => {
    console.log(`${url} -> Status: ${res.statusCode}`);
  }).on('error', (e) => {
    console.error(`${url} -> Error: ${e.message}`);
  });
});
