const fs = require('fs');
const https = require('https');
const path = require('path');

const dir = path.join(__dirname, 'public', 'images', 'logos');
if (!fs.existsSync(dir)){
    fs.mkdirSync(dir, { recursive: true });
}

const logos = [
  { name: 'timhortons.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/4/4e/Tim_Hortons_logo.svg' },
  { name: 'canadiantire.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/e/ea/Canadian_Tire_logo.svg' },
  { name: 'cineplex.svg', url: 'https://upload.wikimedia.org/wikipedia/en/b/b3/Cineplex_Entertainment_logo.svg' },
  { name: 'shoppers.svg', url: 'https://upload.wikimedia.org/wikipedia/commons/c/c2/Shoppers_Drug_Mart_logo.svg' }
];

const getWithRedirects = (url, dest, callback) => {
  https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' } }, (res) => {
    if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
      getWithRedirects(res.headers.location, dest, callback);
    } else {
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        callback();
      });
    }
  }).on('error', (err) => console.error(err));
};

logos.forEach(logo => {
  const filePath = path.join(dir, logo.name);
  getWithRedirects(logo.url, filePath, () => {
    console.log(`Downloaded ${logo.name}`);
  });
});
