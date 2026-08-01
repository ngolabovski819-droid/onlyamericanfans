// Quick diagnostic: test all state location queries against Supabase
// Usage: node scripts/test-states.mjs
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env.local
const envPath = resolve(__dirname, '../.env.local');
const envRaw = readFileSync(envPath, 'utf-8');
const env = Object.fromEntries(
  envRaw.split('\n').filter(l => l.includes('=')).map(l => {
    const [k, ...v] = l.split('=');
    return [k.trim(), v.join('=').trim()];
  })
);

const SUPABASE_URL = env.SUPABASE_URL?.replace(/\/+$/, '');
const SUPABASE_KEY = env.SUPABASE_KEY;

// All state terms extracted from states.ts
const STATES = [
  { slug: 'alabama', terms: ['alabama', 'birmingham', 'montgomery', 'huntsville', 'mobile alabama'] },
  { slug: 'alaska', terms: ['alaska', 'anchorage', 'fairbanks', 'juneau'] },
  { slug: 'arizona', terms: ['arizona', 'phoenix', 'tucson', 'scottsdale', 'mesa', 'tempe', 'chandler', 'gilbert'] },
  { slug: 'arkansas', terms: ['arkansas', 'little rock', 'fayetteville', 'fort smith'] },
  { slug: 'california', terms: ['california', 'los angeles', 'san diego', 'san francisco', 'san jose', 'sacramento', 'fresno', 'oakland', 'long beach', 'socal', 'norcal', 'bay area', 'hollywood', 'beverly hills', 'silver lake', 'east la', 'compton', 'anaheim', 'riverside', 'irvine'] },
  { slug: 'colorado', terms: ['colorado', 'denver', 'colorado springs', 'fort collins', 'boulder', 'aurora colorado'] },
  { slug: 'connecticut', terms: ['connecticut', 'hartford', 'new haven', 'bridgeport', 'stamford'] },
  { slug: 'delaware', terms: ['delaware', 'wilmington', 'dover delaware', 'newark delaware'] },
  { slug: 'florida', terms: ['florida', 'miami', 'orlando', 'tampa', 'jacksonville', 'fort lauderdale', 'tallahassee', 'clearwater'] },
  { slug: 'georgia', terms: ['georgia', 'atlanta', 'augusta', 'savannah', 'columbus georgia', 'athens georgia'] },
  { slug: 'hawaii', terms: ['hawaii', 'honolulu', 'maui', 'oahu'] },
  { slug: 'idaho', terms: ['idaho', 'boise', 'meridian', 'nampa', 'twin falls'] },
  { slug: 'illinois', terms: ['illinois', 'chicago', 'aurora illinois', 'rockford', 'naperville', 'joliet'] },
  { slug: 'indiana', terms: ['indiana', 'indianapolis', 'fort wayne', 'south bend', 'evansville', 'bloomington indiana'] },
  { slug: 'iowa', terms: ['iowa', 'des moines', 'cedar rapids', 'iowa city', 'davenport iowa'] },
  { slug: 'kansas', terms: ['kansas', 'wichita', 'overland park', 'kansas city kansas', 'topeka', 'lawrence kansas'] },
  { slug: 'kentucky', terms: ['kentucky', 'louisville', 'lexington kentucky', 'bowling green kentucky', 'covington kentucky'] },
  { slug: 'louisiana', terms: ['louisiana', 'new orleans', 'baton rouge', 'shreveport', 'nola'] },
  { slug: 'maine', terms: ['maine', 'portland maine', 'bangor', 'lewiston', 'augusta maine'] },
  { slug: 'maryland', terms: ['maryland', 'baltimore', 'annapolis', 'rockville'] },
  { slug: 'massachusetts', terms: ['massachusetts', 'boston', 'worcester', 'springfield massachusetts', 'cambridge', 'lowell', 'new bedford', 'somerville', 'quincy'] },
  { slug: 'michigan', terms: ['michigan', 'detroit', 'grand rapids', 'lansing', 'ann arbor'] },
  { slug: 'minnesota', terms: ['minnesota', 'minneapolis', 'saint paul', 'rochester minnesota', 'duluth', 'bloomington minnesota', 'twin cities'] },
  { slug: 'mississippi', terms: ['mississippi', 'jackson mississippi', 'gulfport', 'biloxi', 'hattiesburg', 'oxford mississippi'] },
  { slug: 'missouri', terms: ['missouri', 'kansas city', 'st louis', 'springfield missouri', 'columbia missouri', 'independence missouri'] },
  { slug: 'montana', terms: ['montana', 'billings', 'missoula', 'great falls', 'bozeman'] },
  { slug: 'nebraska', terms: ['nebraska', 'omaha', 'lincoln nebraska', 'bellevue nebraska'] },
  { slug: 'nevada', terms: ['nevada', 'las vegas', 'henderson', 'reno', 'north las vegas'] },
  { slug: 'new-hampshire', terms: ['new hampshire', 'manchester new hampshire', 'nashua', 'concord new hampshire'] },
  { slug: 'new-jersey', terms: ['new jersey', 'newark', 'jersey city', 'paterson', 'elizabeth nj', 'trenton', 'camden nj', 'hoboken'] },
  { slug: 'new-mexico', terms: ['new mexico', 'albuquerque', 'santa fe', 'las cruces', 'rio rancho'] },
  { slug: 'new-york', terms: ['new york', 'nyc', 'brooklyn', 'queens', 'manhattan', 'bronx', 'buffalo', 'long island'] },
  { slug: 'north-carolina', terms: ['north carolina', 'charlotte', 'raleigh', 'greensboro', 'durham', 'winston-salem', 'chapel hill', 'fayetteville nc', 'research triangle'] },
  { slug: 'north-dakota', terms: ['north dakota', 'fargo', 'bismarck', 'grand forks', 'minot'] },
  { slug: 'ohio', terms: ['ohio', 'columbus ohio', 'cleveland', 'cincinnati', 'toledo', 'akron', 'dayton ohio'] },
  { slug: 'oklahoma', terms: ['oklahoma', 'oklahoma city', 'tulsa', 'broken arrow', 'edmond oklahoma', 'norman oklahoma'] },
  { slug: 'oregon', terms: ['oregon', 'portland', 'eugene', 'salem oregon', 'gresham', 'hillsboro', 'beaverton', 'pdx'] },
  { slug: 'pennsylvania', terms: ['pennsylvania', 'philadelphia', 'pittsburgh', 'allentown', 'philly', 'erie pennsylvania'] },
  { slug: 'rhode-island', terms: ['rhode island', 'providence', 'cranston', 'warwick rhode island'] },
  { slug: 'south-carolina', terms: ['south carolina', 'charleston south carolina', 'columbia south carolina', 'greenville sc', 'spartanburg', 'myrtle beach'] },
  { slug: 'south-dakota', terms: ['south dakota', 'sioux falls', 'rapid city', 'aberdeen south dakota'] },
  { slug: 'tennessee', terms: ['tennessee', 'nashville', 'memphis', 'knoxville', 'chattanooga', 'clarksville', 'murfreesboro'] },
  { slug: 'texas', terms: ['texas', 'houston', 'dallas', 'san antonio', 'austin', 'fort worth', 'el paso', 'arlington texas', 'lubbock', 'dfw', 'plano', 'irving', 'laredo', 'corpus christi'] },
  { slug: 'utah', terms: ['utah', 'salt lake city', 'provo', 'west valley city', 'west jordan', 'ogden utah', 'slc'] },
  { slug: 'vermont', terms: ['vermont', 'burlington vermont', 'south burlington', 'montpelier'] },
  { slug: 'virginia', terms: ['virginia', 'virginia beach', 'richmond virginia', 'norfolk', 'arlington virginia', 'chesapeake', 'hampton roads'] },
  { slug: 'washington', terms: ['washington', 'seattle', 'spokane', 'tacoma', 'bellevue washington', 'kirkland', 'redmond washington'] },
  { slug: 'west-virginia', terms: ['west virginia', 'charleston west virginia', 'huntington wv', 'morgantown', 'parkersburg'] },
  { slug: 'wisconsin', terms: ['wisconsin', 'milwaukee', 'madison wisconsin', 'green bay', 'kenosha', 'racine'] },
  { slug: 'wyoming', terms: ['wyoming', 'cheyenne', 'casper', 'laramie'] },
];

const TIMEOUT_MS = 9000;

async function testState(slug, terms) {
  const orParts = terms.map(t => `location.ilike.*${t.toLowerCase()}*`);
  const rawFilter = `&or=(${orParts.join(',')})`;
  const qp = new URLSearchParams({
    select: 'id',
    isperformer: 'eq.true',
    order: 'favoritedcount.desc,subscribeprice.asc.nullslast',
    limit: '24',
  });
  const url = `${SUPABASE_URL}/rest/v1/onlyfans_profiles?${qp.toString()}${rawFilter}`;

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  const start = Date.now();

  try {
    const res = await fetch(url, {
      signal: ctrl.signal,
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Accept-Profile': 'public',
        Prefer: 'count=estimated',
      },
    });
    clearTimeout(timer);
    const ms = Date.now() - start;
    const cr = res.headers.get('content-range') ?? '';
    const total = parseInt(cr.split('/')[1] ?? '0', 10) || 0;
    const data = await res.json();
    const rows = Array.isArray(data) ? data.length : 0;
    const status = !res.ok ? `HTTP${res.status}` : (rows === 0 ? 'ZERO' : 'OK');
    return { slug, ms, total, rows, status, terms: terms.length };
  } catch (e) {
    clearTimeout(timer);
    const ms = Date.now() - start;
    return { slug, ms, total: 0, rows: 0, status: e.name === 'AbortError' ? 'TIMEOUT' : `ERR:${e.message}`, terms: terms.length };
  }
}

async function main() {
  console.log(`Testing ${STATES.length} states against ${SUPABASE_URL?.slice(0, 40)}...`);
  console.log('(running sequentially with 2s gap to avoid cold-cache hammering)\n');

  const results = [];
  for (const { slug, terms } of STATES) {
    const r = await testState(slug, terms);
    const flag = r.status !== 'OK' ? ' <<<' : '';
    console.log(`${r.slug.padEnd(22)} ${r.status.padEnd(8)} ${String(r.ms).padStart(5)}ms  rows=${r.rows}  est=${r.total}  nterms=${r.terms}${flag}`);
    results.push(r);
    await new Promise(res => setTimeout(res, 2000)); // let PG buffer warm
  }

  console.log('\n=== SUMMARY ===');
  const broken = results.filter(r => r.status !== 'OK');
  if (broken.length === 0) {
    console.log('All states OK!');
  } else {
    console.log(`${broken.length} states with issues:`);
    broken.forEach(r => console.log(`  ${r.slug}: ${r.status} (${r.ms}ms, ${r.terms} terms)`));
  }
}

main().catch(console.error);
