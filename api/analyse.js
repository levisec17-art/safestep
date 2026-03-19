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

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API not configured' });

  const langName = language === 'ta' ? 'Tamil' : language === 'hi' ? 'Hindi' : 'English';

  const prompt = `You are a cybercrime detection expert helping Indian victims. Analyse this message and respond ONLY in valid JSON, no markdown fences, no text outside JSON.

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
LOW (0-29): appears legitimate`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.1, maxOutputTokens: 500 }
        })
      }
    );

    if (!response.ok) {
      const err = await response.text();
      console.error('Gemini API error:', err);
      return res.status(500).json({ error: 'Analysis failed' });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
    const cleaned = text.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(cleaned);
    return res.status(200).json(parsed);

  } catch (error) {
    console.error('Handler error:', error);
    return res.status(500).json({ error: 'Analysis failed' });
  }
}
