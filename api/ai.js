// Server-side proxy to the Google Gemini API. Keeps GEMINI_API_KEY out of the
// browser. Two modes:
//   - "briefing":  headlines -> { briefing, featuredIndex }
//   - "summarise": { title, snippet } -> markdown bullet points
// Each pinned model only allows ~20 free requests/day. The rolling "latest"
// aliases track their own quota bucket, buying more headroom on the free tier.
// The durable fix for repeated 429s is to enable billing on the Google project.
const MODEL = 'gemini-flash-lite-latest';
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

async function callGemini(prompt, { json = false } = {}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY is not configured');

  const body = {
    contents: [{ parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.4,
      maxOutputTokens: 1024,
      ...(json ? { responseMimeType: 'application/json' } : {}),
    },
  };

  // Gemini's free tier occasionally returns 503/429 under load — retry briefly.
  let res;
  for (let attempt = 0; attempt < 3; attempt++) {
    res = await fetch(`${ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (res.ok) break;
    if (res.status !== 503 && res.status !== 429) break;
    await new Promise((r) => setTimeout(r, 600 * (attempt + 1)));
  }

  if (!res.ok) {
    const detail = await res.text();
    throw new Error(`Gemini ${res.status}: ${detail.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') ?? '';
  if (!text) throw new Error('Gemini returned an empty response');
  return text;
}

async function handleBriefing(headlines) {
  const list = headlines
    .slice(0, 24)
    .map((h, i) => `${i + 1}. ${h.au ? '[AU] ' : ''}[${h.source}] ${h.title}`)
    .join('\n');

  const prompt = `You are a finance analyst writing for an Australian investor. Given these headlines (ones tagged [AU] are Australian-market relevant), do two things:
1. Write a market briefing of about 4-6 sentences. FIRST cover what's happening in Australian markets (the [AU] stories: ASX, RBA, AUD, major ASX-listed companies). THEN broaden to international/global markets. If there are no Australian stories, say so briefly and focus on global markets.
2. Pick the single most significant story overall and return its 1-based number.

Headlines:
${list}

Respond ONLY as JSON matching: {"briefing": string, "featuredIndex": number}
featuredIndex is the 1-based number from the list above.`;

  const text = await callGemini(prompt, { json: true });
  const parsed = JSON.parse(text);
  // Convert to a 0-based index, clamped to a valid range.
  const oneBased = Number(parsed.featuredIndex) || 1;
  const featuredIndex = Math.min(Math.max(oneBased - 1, 0), headlines.length - 1);
  return {
    briefing: String(parsed.briefing || '').trim(),
    featuredIndex,
  };
}

async function handleMarketOutlook(headlines) {
  const list = headlines
    .slice(0, 20)
    .map((h, i) => `${i + 1}. ${h.au ? '[AU] ' : ''}[${h.source}] ${h.title}`)
    .join('\n');

  const prompt = `You are a senior financial analyst writing a daily market outlook for an Australian investor. Based on these headlines (ones tagged [AU] are Australian-market relevant), do two things:
1. Write a detailed market outlook of 4-6 substantial paragraphs covering: the overall macro environment and market mood, key themes and sector dynamics, risk factors and potential catalysts, and what to watch this week. Lead with Australian-market context where the [AU] stories support it, then broaden to global markets. Be specific and insightful.
2. Judge the overall market sentiment from these headlines: Bullish, Neutral, or Bearish, with a confidence score from 0 to 100 and a one-sentence reason.

Headlines:
${list}

Respond ONLY as JSON matching:
{"outlook": string (paragraphs separated by \\n\\n, plain text no markdown),
 "sentiment": "Bullish" | "Neutral" | "Bearish",
 "confidence": number (0-100),
 "sentimentReason": string (one sentence)}`;

  const text = await callGemini(prompt, { json: true });
  const parsed = JSON.parse(text);
  const allowed = ['Bullish', 'Neutral', 'Bearish'];
  const confidence = Math.min(Math.max(Number(parsed.confidence) || 0, 0), 100);
  return {
    outlook: String(parsed.outlook || '').trim(),
    sentiment: allowed.includes(parsed.sentiment) ? parsed.sentiment : 'Neutral',
    confidence,
    sentimentReason: String(parsed.sentimentReason || '').trim(),
  };
}

async function handleStockOutlook(stock) {
  const fmt = (v, prefix = '', suffix = '') =>
    v == null || Number.isNaN(v) ? 'n/a' : `${prefix}${v}${suffix}`;

  const prompt = `You are an equity analyst. Analyse this stock and respond ONLY as JSON.

Stock: ${stock.name || stock.symbol} (${stock.symbol})
Current price: ${fmt(stock.price, '$')}
Change today: ${fmt(stock.changePercent, '', '%')}
52-week range: ${fmt(stock.low52, '$')} - ${fmt(stock.high52, '$')}
MA20: ${fmt(stock.ma20, '$')} | MA50: ${fmt(stock.ma50, '$')}
Market cap: ${fmt(stock.marketCap)}
P/E: ${fmt(stock.peRatio)}
Analyst mean target: ${fmt(stock.analyst?.mean, '$')} (rating: ${stock.analyst?.rating || 'n/a'}, ${fmt(stock.analyst?.count)} analysts, range ${fmt(stock.analyst?.low, '$')}-${fmt(stock.analyst?.high, '$')})
Last EPS: ${fmt(stock.earnings?.lastEps)} vs estimate ${fmt(stock.earnings?.lastEpsEstimate)}
Recent headlines: ${(stock.headlines || []).slice(0, 5).join(' | ') || 'none'}

Respond ONLY as JSON matching:
{"sentiment": "Bullish" | "Neutral" | "Bearish",
 "sentimentReason": "one sentence",
 "technicalSummary": "2-3 sentences interpreting price vs MAs and the 52-week range",
 "outlook": "3-4 paragraphs on recent performance, catalysts, and risks (plain text, use \\n\\n between paragraphs)",
 "analystSummary": "2-3 sentences on the analyst consensus and implied upside/downside",
 "earningsSnapshot": "2-3 sentences on the latest earnings vs estimate and what's next"}`;

  const text = await callGemini(prompt, { json: true });
  const parsed = JSON.parse(text);
  const allowed = ['Bullish', 'Neutral', 'Bearish'];
  return {
    sentiment: allowed.includes(parsed.sentiment) ? parsed.sentiment : 'Neutral',
    sentimentReason: String(parsed.sentimentReason || '').trim(),
    technicalSummary: String(parsed.technicalSummary || '').trim(),
    outlook: String(parsed.outlook || '').trim(),
    analystSummary: String(parsed.analystSummary || '').trim(),
    earningsSnapshot: String(parsed.earningsSnapshot || '').trim(),
  };
}

async function handleSummarise(title, snippet) {
  const prompt = `Summarise this finance news article in 3-4 bullet points covering the key facts and implications for investors. Be concise and specific.

Title: ${title}
Snippet: ${snippet}

Respond in plain markdown bullet points only (each line starting with "- "), no preamble.`;

  const summary = await callGemini(prompt);
  return { summary: summary.trim() };
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mode, headlines, title, snippet, stock } = req.body || {};

    if (mode === 'briefing') {
      if (!Array.isArray(headlines) || headlines.length === 0) {
        return res.status(400).json({ error: 'headlines array is required' });
      }
      return res.status(200).json(await handleBriefing(headlines));
    }

    if (mode === 'marketOutlook') {
      if (!Array.isArray(headlines) || headlines.length === 0) {
        return res.status(400).json({ error: 'headlines array is required' });
      }
      return res.status(200).json(await handleMarketOutlook(headlines));
    }

    if (mode === 'stockOutlook') {
      if (!stock || !stock.symbol) {
        return res.status(400).json({ error: 'stock object with symbol is required' });
      }
      return res.status(200).json(await handleStockOutlook(stock));
    }

    if (mode === 'summarise') {
      if (!title) return res.status(400).json({ error: 'title is required' });
      return res.status(200).json(await handleSummarise(title, snippet || ''));
    }

    return res.status(400).json({ error: 'Unknown mode' });
  } catch (err) {
    console.error('[api/ai]', err);
    return res.status(502).json({ error: err.message || 'AI request failed' });
  }
}
