export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, language } = req.body;
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'No message provided' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API not configured' });

  const langName = language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English';

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: 'You are a cybercrime detection expert helping Indian victims. Always respond ONLY in valid JSON with no markdown, no explanation outside JSON.'
          },
          {
            role: 'user',
            content: `Analyse this message and respond ONLY in valid JSON.

Message: "${message.substring(0, 1000)}"

JSON format:
{
  "risk_level": "HIGH or MEDIUM or LOW",
  "risk_percent": number 0-100,
  "verdict": "one sentence in ${langName}",
  "flags": ["flag1 in ${langName}", "flag2 in ${langName}", "flag3 in ${langName}"],
  "immediate_action": "one clear action in ${langName}"
}

HIGH (70-100): threats, blackmail, fake police/CBI/TRAI, prize claims, OTP requests, urgent money demands
MEDIUM (30-69): suspicious links, unusual offers
LOW (0-29): appears legitimate`
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq API error:', err);
      return res.status(500).json({ error: 'Analysis failed' });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { message, language } = req.body;
  if (!message || message.trim().length === 0) {
    return res.status(400).json({ error: 'No message provided' });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API not configured' });

  const langName = language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English';

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        temperature: 0.1,
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content: 'You are a cybercrime detection expert helping Indian victims. Always respond ONLY in valid JSON with no markdown, no explanation outside JSON.'
          },
          {
            role: 'user',
            content: `Analyse this message and respond ONLY in valid JSON.

Message: "${message.substring(0, 1000)}"

JSON format:
{
  "risk_level": "HIGH or MEDIUM or LOW",
  "risk_percent": number 0-100,
  "verdict": "one sentence in ${langName}",
  "flags": ["flag1 in ${langName}", "flag2 in ${langName}", "flag3 in ${langName}"],
  "immediate_action": "one clear action in ${langName}"
}

HIGH (70-100): threats, blackmail, fake police/CBI/TRAI, prize claims, OTP requests, urgent money demands
MEDIUM (30-69): suspicious links, unusual offers
LOW (0-29): appears legitimate`
          }
        ]
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Groq API error:', err);
      return res.status(500).json({ error: 'Analysis failed' });
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}
