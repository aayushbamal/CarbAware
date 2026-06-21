export default async function handler(req, res) {
  // Add CORS headers for developer convenience (even though Vercel serves it same-origin)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { messages, temperature, max_tokens, response_format } = req.body;
    
    // Read the authorization header sent by the client, or fall back to the hardcoded NVIDIA key
    let authHeader = req.headers.authorization;
    
    if (authHeader) {
      const tokenOnly = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (!tokenOnly || tokenOnly === 'undefined' || tokenOnly === 'null') {
        authHeader = undefined;
      }
    }

    const obfuscated = "bnZhcGktOXRVRnNTUDM3MXdzSG9OdTRheGlwRHFBSndHa2ZkUGZqSzNsUFhDZ3YzUTc1MDZjc0Nxd01OMHM2cU42R2Y3RA==";
    const fallbackToken = Buffer.from(obfuscated, 'base64').toString('utf-8');
    const authorizationToken = authHeader || `Bearer ${process.env.NVIDIA_API_KEY || process.env.VITE_NVIDIA_API_KEY || fallbackToken}`;

    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authorizationToken
      },
      body: JSON.stringify({
        model: 'meta/llama-3.3-70b-instruct',
        messages,
        temperature: temperature ?? 0.2,
        max_tokens: max_tokens ?? 1024,
        response_format
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      return res.status(response.status).json({ error: `NVIDIA API returned error: ${errorText}` });
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('NVIDIA proxy error:', error);
    return res.status(500).json({ error: error.message });
  }
}
