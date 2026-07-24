/**
 * User-Agent based bot/crawler filter for the click-tracking redirect (src/app/go/[username]/route.ts).
 * Deliberately conservative — a missing/empty UA is treated as a bot too, since real browsers
 * always send one and paid-click accuracy matters more than logging every edge case.
 */
const BOT_PATTERNS: RegExp[] = [
  // Generic tells — narrow enough to avoid false-positiving on real browser UAs
  /\bbot\b/i, /spider/i, /crawl(er)?\b/i, /slurp/i, /headless/i, /scrapy/i,
  // CLI / HTTP libraries (never a real click)
  /curl\//i, /wget/i, /python-requests/i, /python-urllib/i, /go-http-client/i, /okhttp/i,
  /node-fetch/i, /^axios/i, /postmanruntime/i, /^java\//i, /libwww-perl/i,
  // Headless / automation browsers
  /phantomjs/i, /puppeteer/i, /playwright/i, /selenium/i, /headlesschrome/i,
  // Named search/social/link-preview crawlers
  /googlebot/i, /bingbot/i, /yandexbot/i, /baiduspider/i, /duckduckbot/i, /applebot/i,
  /facebookexternalhit/i, /twitterbot/i, /linkedinbot/i, /whatsapp/i, /telegrambot/i,
  /discordbot/i, /slackbot/i, /pinterestbot/i, /redditbot/i,
  // SEO / uptime crawlers
  /ahrefsbot/i, /semrushbot/i, /mj12bot/i, /dotbot/i, /petalbot/i, /bytespider/i, /uptimerobot/i,
];

export function isBotUserAgent(userAgent: string | null | undefined): boolean {
  const ua = (userAgent ?? '').trim();
  if (!ua) return true;
  return BOT_PATTERNS.some((re) => re.test(ua));
}
