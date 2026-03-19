export default async function handler(req, res) {
  // Allow requests from your site only
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, language } = req.body;

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'No message provided' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API not configured' });
  }

  const langName = language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English';

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 1000,
        messages: [{
          role: 'user',
          content: `You are a cybercrime detection expert helping Indian victims. Analyse this message and respond ONLY in valid JSON, no markdown fences, no explanation outside JSON.

Message: "${message.substring(0, 1000)}"

Respond in this exact JSON format:
{
  "risk_level": "HIGH or MEDIUM or LOW",
  "risk_percent": number between 0 and 100,
  "verdict": "one sentence verdict in ${langName}",
  "flags": ["flag1 in ${langName}", "flag2 in ${langName}", "flag3 in ${langName}"],
  "immediate_action": "one clear action to take right now in ${langName}"
}

Risk rules:
HIGH (70-100): threats, blackmail, fake police/CBI/TRAI calls, prize/lottery claims, OTP requests, urgent money demands
MEDIUM (30-69): suspicious links, unusual offers, unverified claims  
LOW (0-29): appears legitimate`
        }]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Claude API error:', err);
      return res.status(500).json({ error: 'Analysis failed' });
    }

    const data = await response.json();
    const text = data.content
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}
