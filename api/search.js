const SITE_DOMAINS = {
  MLA: 'listado.mercadolibre.com.ar',
  MLM: 'listado.mercadolibre.com.mx',
  MCO: 'listado.mercadolibre.com.co',
  MLC: 'listado.mercadolibre.cl',
  MLB: 'lista.mercadolivre.com.br',
  MPE: 'listado.mercadolibre.com.pe',
  MLU: 'listado.mercadolibre.com.uy',
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, site = 'MLA' } = req.query;
  if (!q) return res.status(400).json({ error: 'q required' });

  const domain = SITE_DOMAINS[site] || SITE_DOMAINS.MLA;
  const slug = q.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const mlUrl = `https://${domain}/${slug}`;

  const response = await fetch(mlUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.105 Mobile Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'es-AR,es;q=0.9',
    },
  });

  const html = await response.text();
  const results = [];

  for (const match of html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)) {
    try {
      const data = JSON.parse(match[1].trim());
      for (const item of (data['@graph'] || [])) {
        if (item['@type'] === 'Product' && item.offers?.price) {
          results.push({
            title:    item.name,
            price:    item.offers.price,
            permalink: item.offers.url,
            thumbnail: item.image || null,
            condition: 'new',
            shipping:  { free_shipping: false },
          });
        }
      }
    } catch {}
  }

  results.sort((a, b) => a.price - b.price);
  res.json({ results });
}
