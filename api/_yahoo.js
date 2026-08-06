// Shared access to Yahoo Finance's authenticated JSON endpoints (quoteSummary,
// screener). Yahoo gates these behind a cookie + "crumb" pair: fetch a session
// cookie, exchange it for a crumb, then pass both on every request. The pair is
// cached in module memory (reused across warm serverless invocations) and refreshed
// once on a 401 "Invalid Crumb". The v8 chart endpoint needs none of this and is
// fetched directly in api/candles.js / api/stocks.js.

// A real browser UA — Yahoo rejects obvious bot agents on the crumb handshake.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

let session = null; // { cookie, crumb }

async function handshake() {
  // Step 1: hit a Yahoo host to receive a session cookie (fc.yahoo.com 404s but
  // still sets the cookie we need).
  const cookieRes = await fetch('https://fc.yahoo.com', {
    headers: { 'User-Agent': UA },
  });
  const setCookie = cookieRes.headers.get('set-cookie') || '';
  // Keep just the "name=value" pairs for the Cookie header.
  const cookie = setCookie
    .split(/,(?=[^ ;]+=)/)
    .map((c) => c.split(';')[0].trim())
    .filter(Boolean)
    .join('; ');

  // Step 2: exchange the cookie for a crumb.
  const crumbRes = await fetch('https://query2.finance.yahoo.com/v1/test/getcrumb', {
    headers: { 'User-Agent': UA, Cookie: cookie },
  });
  const crumb = (await crumbRes.text()).trim();
  if (!crumb || crumb.includes('<')) throw new Error('Yahoo crumb handshake failed');

  session = { cookie, crumb };
  return session;
}

async function getSession() {
  return session || handshake();
}

// Fetch an authenticated Yahoo JSON endpoint. `url` should NOT include the crumb;
// it's appended here. Refreshes the session once on a 401 and retries.
export async function yahooJson(url, { method = 'GET', body } = {}) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const { cookie, crumb } = await getSession();
    const sep = url.includes('?') ? '&' : '?';
    const res = await fetch(`${url}${sep}crumb=${encodeURIComponent(crumb)}`, {
      method,
      headers: {
        'User-Agent': UA,
        Cookie: cookie,
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });

    if (res.status === 401 && attempt === 0) {
      session = null; // Crumb went stale — re-handshake and retry once.
      continue;
    }
    if (!res.ok) throw new Error(`Yahoo ${res.status}`);
    return res.json();
  }
  throw new Error('Yahoo request failed after crumb refresh');
}

export const YAHOO_UA = UA;
