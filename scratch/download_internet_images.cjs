const https = require('https');
const fs = require('fs');
const path = require('path');

const images = [
  {
    name: 'mesh-wifi.jpg',
    // Unsplash mesh / modern minimalist wifi device
    url: 'https://images.unsplash.com/photo-1544256718-3bcf237f3974?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'fiber-modem.jpg',
    // Unsplash optical terminal / network box
    url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'wifi-extender.jpg',
    // Wireless range booster / tech hardware
    url: 'https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'dualband-router.jpg',
    // High-tech modern router on desk
    url: 'https://images.unsplash.com/photo-1606904825846-647eb07f5be2?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'fiber-ont.jpg',
    // High-tech home gateway device
    url: 'https://images.unsplash.com/photo-1597733336794-12d05021d510?auto=format&fit=crop&w=800&q=80'
  }
];

function download(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return download(res.headers.location, dest).then(resolve).catch(reject);
      }
      if (res.statusCode !== 200) {
        return reject(new Error(`Status ${res.statusCode} for ${url}`));
      }
      const file = fs.createWriteStream(dest);
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', reject);
  });
}

async function main() {
  const dir = path.join(__dirname, '..', 'public', 'images', 'products');
  for (const item of images) {
    const dest = path.join(dir, item.name);
    try {
      console.log(`Downloading ${item.name}...`);
      await download(item.url, dest);
      const stat = fs.statSync(dest);
      console.log(`Saved ${item.name} (${stat.size} bytes)`);
    } catch (err) {
      console.error(`Failed ${item.name}:`, err.message);
    }
  }
}

main();
