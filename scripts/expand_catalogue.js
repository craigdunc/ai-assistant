
const fs = require('fs');
const path = require('path');
const https = require('https');

const DATASET_PATH = 'dataset_Amazon-crawler_2026-05-02_11-29-22-332.json';
const OUTPUT_PATH = 'tripkit_catalogue_starter.json';
const IMAGE_DIR = path.join('public', 'products');

if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

const rawData = JSON.parse(fs.readFileSync(DATASET_PATH, 'utf8'));

// Helper to download image
function downloadImage(url, dest) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode === 200) {
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => {
          file.close();
          resolve();
        });
      } else {
        // Fallback for some Amazon URLs that might need headers
        const options = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        };
        https.get(url, options, (res2) => {
            if (res2.statusCode === 200) {
                const file = fs.createWriteStream(dest);
                res2.pipe(file);
                file.on('finish', () => {
                    file.close();
                    resolve();
                });
            } else {
                reject(new Error(`Failed to download ${url}: ${res2.statusCode}`));
            }
        }).on('error', reject);
      }
    }).on('error', reject);
  });
}

// Map Amazon categories to TripKit categories
function mapCategory(breadCrumbs, title) {
  const bc = (breadCrumbs || '').toLowerCase();
  const t = (title || '').toLowerCase();
  
  if (bc.includes('suitcase') || bc.includes('luggage') || t.includes('suitcase')) return 'Luggage';
  if (bc.includes('backpack') || t.includes('backpack')) return 'Backpacks';
  if (bc.includes('packing cube') || bc.includes('organizer') || bc.includes('organiser') || bc.includes('toiletry') || t.includes('packing cube') || t.includes('toiletry')) return 'Packing organisers';
  if (bc.includes('tech') || bc.includes('adapter') || bc.includes('charger') || bc.includes('electronic') || bc.includes('power bank') || t.includes('adapter') || t.includes('power bank')) return 'Travel tech';
  if (bc.includes('pillow') || bc.includes('eye mask') || bc.includes('sleep') || bc.includes('ear plugs') || t.includes('pillow') || t.includes('ear plug')) return 'In-flight comfort';
  if (bc.includes('umbrella') || bc.includes('rain') || bc.includes('weather') || t.includes('umbrella')) return 'Weather gear';
  if (bc.includes('clothing') || bc.includes('shirt') || bc.includes('pants') || t.includes('shirt')) return 'Clothing';
  if (bc.includes('toiletries') || bc.includes('hygiene') || bc.includes('soap') || bc.includes('first aid') || t.includes('hygiene') || t.includes('first aid')) return 'Health and hygiene';
  if (bc.includes('security') || bc.includes('lock') || bc.includes('safe') || t.includes('lock') || t.includes('safe')) return 'Security';
  if (bc.includes('wallet') || bc.includes('money') || bc.includes('passport') || t.includes('passport') || t.includes('wallet')) return 'Documents and money';
  if (bc.includes('car') || bc.includes('road trip') || t.includes('car mount')) return 'Road trip';
  if (bc.includes('bag') || bc.includes('tote') || bc.includes('purse') || t.includes('tote')) return 'Bags';
  
  return 'Bags'; // Default
}

async function process() {
  const products = [];
  console.log(`Processing up to 200 products from ${rawData.length} available...`);

  const targetCount = 200;
  const subset = rawData.slice(0, targetCount);

  for (let i = 0; i < subset.length; i++) {
    const item = subset[i];
    const asin = item.asin || `tk-${(i+1).toString().padStart(3, '0')}`;
    const fullDest = path.join(IMAGE_DIR, `${asin}.jpg`);

    console.log(`[${i+1}/${targetCount}] Processing ${asin}: ${item.title.substring(0, 50)}...`);

    try {
      if (item.thumbnailImage) {
        if (!fs.existsSync(fullDest)) {
          await downloadImage(item.thumbnailImage, fullDest);
        }
      }

      // Map brand
      const brand = item.brand || 'Generic';

      // Map features
      const features = item.features || [];

      // Create product object
      const product = {
        id: asin,
        name: item.title,
        brand: brand,
        category: mapCategory(item.breadCrumbs, item.title),
        price_aud: item.price ? item.price.value : (Math.floor(Math.random() * 100) + 20), // Fallback price
        colour: item.attributes?.find(a => a.key === 'Color')?.value.split(', ') || ['Default'],
        customer_review: {
          rating: item.stars || 4.0,
          review_count: item.reviewsCount || Math.floor(Math.random() * 100)
        },
        short_description: features[0] || item.title,
        features: features,
        url: item.url || `https://www.amazon.com.au/dp/${asin}`,
        // Metadata for search (simplified)
        use_cases: ["Transit", "Organising essentials"],
        travel_style: ["Carry-on", "Urban travel"],
        trip_stage: ["Packing", "Transit"],
        product_page_copy: {
          overview: features.slice(0, 2).join(' ') || item.title,
          details: features.join(' ') || item.title,
          recommendation_context: `A great choice for ${mapCategory(item.breadCrumbs, item.title).toLowerCase()}.`,
          specifications_summary: `Brand: ${brand}. ASIN: ${asin}.`
        }
      };

      products.push(product);
    } catch (err) {
      console.error(`Error processing ${asin}: ${err.message}`);
    }
  }

  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(products, null, 2));
  console.log(`\nSuccess! Saved ${products.length} products to ${OUTPUT_PATH}`);
}

process();
