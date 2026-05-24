const fs = require('fs');
const path = require('path');
const https = require('https');

const logos = [
  { name: 'interac.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/2/23/Interac_Logo.svg' },
  { name: 'tim_hortons.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/3/3d/Tim_Hortons_logo.svg' },
  { name: 'canadian_tire.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/Canadian_Tire_logo.svg' },
  { name: 'cineplex.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/9/95/Cineplex_Entertainment_logo.svg' },
  { name: 'shoppers.svg', url: 'https://upload.wikimedia.org/wikipedia/en/9/98/Shoppers_Drug_Mart_logo.svg' },
  { name: 'litecoin.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Litecoin_Logo.jpg' }, // fallback to jpg
  { name: 'paypal.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg' },
  { name: 'bitcoin.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Bitcoin.svg' },
  { name: 'visa.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg' },
  { name: 'steam.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/8/83/Steam_icon_logo.svg' },
  { name: 'roblox.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Roblox_player_icon_black.svg' },
];

const dir = path.join(__dirname, 'public', 'logos');
if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        return download(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Status ${response.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(dest);
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => reject(err));
    });
  });
}

Promise.all(logos.map(logo => download(logo.url, path.join(dir, logo.name))))
  .then(() => console.log('All logos downloaded successfully!'))
  .catch(err => console.error('Error downloading logos:', err));
