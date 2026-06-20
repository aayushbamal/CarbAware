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
    const authHeader = req.headers.authorization;
    
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader || `Bearer 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`
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
