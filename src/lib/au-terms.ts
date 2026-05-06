/**
 * Terms for searching the `location` column.
 */
export const US_TERMS_LOCATION: string[] = [
  'usa', 'us', 'united states', 'america', 'american',
  'new york', 'los angeles', 'chicago', 'houston', 'phoenix',
  'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose',
  'austin', 'jacksonville', 'fort worth', 'columbus', 'charlotte',
  'indianapolis', 'san francisco', 'seattle', 'denver', 'nashville',
  'oklahoma city', 'el paso', 'las vegas', 'louisville', 'baltimore',
  'miami', 'atlanta', 'portland', 'tucson', 'fresno', 'sacramento',
  'mesa', 'kansas city', 'albuquerque', 'omaha', 'raleigh',
  'minneapolis', 'cleveland', 'new orleans', 'memphis', 'detroit',
  'boston', 'orlando', 'tampa', 'pittsburgh', 'cincinnati',
  'buffalo', 'st louis', 'salt lake city', 'richmond', 'baton rouge',
  'california', 'texas', 'florida', 'new york state',
];

/**
 * Terms safe to search inside free-text bio (`about`).
 */
export const US_TERMS_BIO: string[] = [
  'usa', 'united states', 'america', 'american',
  'new york', 'los angeles', 'chicago', 'houston', 'phoenix',
  'philadelphia', 'san antonio', 'san diego', 'dallas', 'san jose',
  'austin', 'jacksonville', 'fort worth', 'columbus', 'charlotte',
  'indianapolis', 'san francisco', 'seattle', 'denver', 'nashville',
  'oklahoma city', 'el paso', 'las vegas', 'louisville', 'baltimore',
  'miami', 'atlanta', 'portland', 'tucson', 'fresno', 'sacramento',
  'kansas city', 'albuquerque', 'omaha', 'raleigh',
  'minneapolis', 'cleveland', 'new orleans', 'memphis', 'detroit',
  'boston', 'orlando', 'tampa', 'pittsburgh', 'cincinnati',
  'california', 'texas', 'florida',
];

/**
 * Returns a PostgREST OR expression covering all US location terms.
 */
export function buildUsOrExpression(): string {
  const parts = US_TERMS_LOCATION.map((t) => `location.ilike.*${t}*`);
  return `(${parts.join(',')})`;
}

/** @deprecated use US_TERMS_LOCATION / US_TERMS_BIO directly */
export const AU_TERMS_LOCATION = US_TERMS_LOCATION;
export const AU_TERMS_BIO = US_TERMS_BIO;
export const AU_TERMS = US_TERMS_LOCATION;
export function buildAuOrExpression() { return buildUsOrExpression(); }