/**
 * Terms for searching the `location` column.
 */
export const UK_TERMS_LOCATION: string[] = [
  'united kingdom', 'uk', 'britain', 'british', 'england', 'english',
  'scotland', 'scottish', 'wales', 'welsh', 'northern ireland',
  'london', 'manchester', 'birmingham', 'glasgow', 'liverpool',
  'edinburgh', 'bristol', 'cardiff', 'leeds', 'sheffield',
  'newcastle', 'nottingham', 'southampton', 'leicester', 'brighton',
  'aberdeen', 'swansea', 'belfast',
  'eng', 'sco', 'wal', 'nir',
];

/**
 * Terms safe to search inside free-text bio (`about`).
 */
export const UK_TERMS_BIO: string[] = [
  'united kingdom', 'britain', 'british', 'england', 'english',
  'scotland', 'scottish', 'wales', 'welsh', 'northern ireland',
  'london', 'manchester', 'birmingham', 'glasgow', 'liverpool',
  'edinburgh', 'bristol', 'cardiff', 'leeds', 'sheffield',
  'newcastle', 'nottingham', 'southampton', 'leicester', 'brighton',
  'aberdeen', 'swansea', 'belfast',
];

/**
 * Returns a PostgREST OR expression covering all UK location terms.
 */
export function buildUkOrExpression(): string {
  const parts = UK_TERMS_LOCATION.map((t) => `location.ilike.*${t}*`);
  return `(${parts.join(',')})`;
}

/** @deprecated use UK_TERMS_LOCATION / UK_TERMS_BIO directly */
export const AU_TERMS_LOCATION = UK_TERMS_LOCATION;
export const AU_TERMS_BIO = UK_TERMS_BIO;
export const AU_TERMS = UK_TERMS_LOCATION;
export function buildAuOrExpression() { return buildUkOrExpression(); }