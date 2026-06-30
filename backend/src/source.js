// Turn a pasted link into study text, server-side.
// Supports YouTube (caption transcript) and generic web pages / articles.
// Video-only platforms without captions (X/Twitter, TikTok, Instagram) can't be
// transcribed here — that needs a speech-to-text step we don't run yet.

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

function decodeEntities(s) {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(+n));
}

function youtubeId(url) {
  try {
    const u = new URL(url);
    const h = u.hostname.replace(/^www\./, "");
    if (h === "youtu.be") return u.pathname.slice(1) || null;
    if (h === "youtube.com" || h === "m.youtube.com") {
      if (u.pathname === "/watch") return u.searchParams.get("v");
      const m = u.pathname.match(/^\/(shorts|embed|live)\/([^/?]+)/);
      if (m) return m[2];
    }
  } catch {}
  return null;
}

// YouTube transcript via Supadata (https://supadata.ai). Direct scraping is
// blocked from the Worker's datacenter IPs (YouTube returns 429 + captcha), so
// we use a transcript provider. Requires SUPADATA_API_KEY to be set.
async function youtubeTranscript(env, id) {
  if (!env.SUPADATA_API_KEY) return null;
  try {
    const r = await fetch(
      `https://api.supadata.ai/v1/youtube/transcript?url=${encodeURIComponent(
        "https://www.youtube.com/watch?v=" + id,
      )}&text=true`,
      { headers: { "x-api-key": env.SUPADATA_API_KEY } },
    );
    if (!r.ok) return null;
    const j = await r.json();
    if (typeof j.content === "string") return j.content.trim() || null;
    if (Array.isArray(j.content)) {
      return (
        j.content
          .map((s) => s.text || "")
          .join(" ")
          .replace(/\s+/g, " ")
          .trim() || null
      );
    }
    return null;
  } catch {
    return null;
  }
}

async function pageText(url) {
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "en-US,en;q=0.9" },
  });
  if (!res.ok) return null;
  const ct = res.headers.get("content-type") || "";
  if (!ct.includes("text/html") && !ct.includes("text/plain")) return null;
  const html = await res.text();
  const body = html
    .replace(/<head[\s\S]*?<\/head>/i, " ")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ");
  const text = decodeEntities(body).replace(/\s+/g, " ").trim();
  return text || null;
}

// Basic SSRF guard: only public http(s) targets.
export function isValidHttpUrl(raw) {
  try {
    const u = new URL(raw);
    if (u.protocol !== "http:" && u.protocol !== "https:") return false;
    const host = u.hostname.toLowerCase();
    if (
      host === "localhost" ||
      host.endsWith(".local") ||
      /^127\./.test(host) ||
      /^10\./.test(host) ||
      /^192\.168\./.test(host) ||
      /^169\.254\./.test(host) ||
      /^172\.(1[6-9]|2\d|3[01])\./.test(host)
    )
      return false;
    return true;
  } catch {
    return false;
  }
}

export async function fetchSourceText(env, url) {
  const id = youtubeId(url);
  if (id) {
    const t = await youtubeTranscript(env, id);
    if (t) return { text: t, kind: "youtube" };
    return {
      error:
        "Couldn't fetch this YouTube transcript automatically. Open the video → “…more → Show transcript”, copy it, and paste it above — or use the NoteJet browser extension on the video page.",
    };
  }

  let host = "";
  try {
    host = new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {}
  if (/(^|\.)(x|twitter)\.com$|(^|\.)tiktok\.com$|(^|\.)instagram\.com$/.test(host)) {
    return {
      error: `${host} videos can't be transcribed automatically yet (that needs speech-to-text). Paste the transcript or caption text instead.`,
    };
  }

  const t = await pageText(url);
  if (t && t.length > 200) return { text: t, kind: "page" };
  return {
    error: "Couldn't read enough text from that link. Paste the transcript or notes instead.",
  };
}
