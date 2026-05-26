const dns = require('dns');

const domains = [
  'api.rapidoreach.com',
  'rewardcenter.rapidoreach.com',
  'surveys.rapidoreach.com',
  'offerwall.rapidoreach.com',
  'www.rapidoreach.com',
  'rapidoreach.com'
];

domains.forEach(domain => {
  dns.lookup(domain, (err, address) => {
    if (err) console.log(`${domain}: FAILED`);
    else console.log(`${domain}: SUCCESS (${address})`);
  });
});
