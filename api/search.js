export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { q, site = 'MLA' } = req.query;
  if (!q) return res.status(400).json({ error: 'q required' });

  const token = (req.headers.authorization || '').replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'token required' });

  const mlUrl = `https://api.mercadolibre.com/sites/${site}/search?q=${encodeURIComponent(q)}&limit=20`;

  const mlRes = await fetch(mlUrl, {
    headers: { Authorization: `Bearer ${token}` },
  });

  const data = await mlRes.json();
  res.status(mlRes.status).json(data);
}
