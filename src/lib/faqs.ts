/**
 * Centralized FAQ generators for SEO rich results.
 * Each helper returns 10 questions tailored to the page context.
 */

export interface Faq {
  q: string;
  a: string;
}

/* ───────────────────────── Homepage ───────────────────────── */
export const homepageFaqs: Faq[] = [
  {
    q: 'How do I find American OnlyFans creators?',
    a: 'Search current public profile records by name and advertised price, or browse state, city and category directories. Geographic pages use documented public-text matching and should be treated as discovery aids rather than proof of residence.',
  },
  {
    q: 'Is OnlyAmericanFans free to use?',
    a: 'Yes. Browsing and searching the directory does not require payment or an OnlyAmericanFans account. Any subscription or purchase happens on the creator\'s destination platform under its current terms.',
  },
  {
    q: 'Are the creators on OnlyAmericanFans verified?',
    a: 'Not every listed profile has a verified flag. A blue check appears only when the current source record reports verified status; OnlyAmericanFans does not independently verify identity, residence or profile ownership.',
  },
  {
    q: 'Do you list free American OnlyFans accounts?',
    a: 'Use the Free filter to find records whose current known advertised subscription price is $0. Unknown prices are not counted as free, and creators may separately charge for optional content.',
  },
  {
    q: 'How often is the directory updated?',
    a: 'Profile cards use the latest successfully stored public record. Location statistics show an explicit snapshot cutoff and update time, and the last complete snapshot remains visible if a refresh fails.',
  },
  {
    q: 'Can I search OnlyFans creators by state or city?',
    a: 'Yes. The directory has pages for all 50 states and configured US cities. Matches are based on curated public location terms, so aliases can be ambiguous and the methodology page explains the limits.',
  },
  {
    q: 'How are creator categories assigned?',
    a: 'Category pages match configured terms in current public directory fields. A match helps discovery but is not an endorsement or an independent claim about a creator\'s identity or content.',
  },
  {
    q: 'Do I need to create an account to browse?',
    a: 'No. You can search, filter and open public creator links without creating an OnlyAmericanFans account.',
  },
  {
    q: 'How are sponsored creators handled?',
    a: 'Paid placements are marked with an Ad disclosure. Sponsorship can change a configured card position or destination link, but it does not change the creator\'s organic fields or the published directory statistics.',
  },
  {
    q: 'Should I confirm profile details before subscribing?',
    a: 'Yes. Prices, availability and profile details can change after a record is refreshed. Confirm the current offer, identity signals and terms on the destination profile before making a purchase.',
  },
];

/* ───────────────────────── Search page ───────────────────────── */
export const searchPageFaqs: Faq[] = [
  {
    q: 'How does the OnlyAmericanFans search work?',
    a: 'Search matches the query against current public directory fields such as display name, username, biography and location text. The selected sort and filters are then applied to those stored records.',
  },
  {
    q: 'Can I filter by free OnlyFans creators?',
    a: 'Yes. Select Free to show records with a current known advertised subscription price of $0. Unknown prices are not treated as free; other paid products may still be offered.',
  },
  {
    q: 'What does the Verified Only filter mean?',
    a: 'It shows records whose source data currently reports verified status. The flag is not an independent OnlyAmericanFans identity, residence or ownership check.',
  },
  {
    q: 'Can I search OnlyFans by city or state?',
    a: 'You can search public location text or use a dedicated state or city directory. Dedicated location pages explain the curated matching terms and publish snapshot-backed statistics when available.',
  },
  {
    q: 'How do I sort OnlyFans creators by newest first?',
    a: 'Open Filters, expand Sort, and select Newest. This orders stored records by the directory\'s discovery timestamp, which is not necessarily the date a creator first joined the destination platform.',
  },
  {
    q: 'Why can a profile be missing from a search?',
    a: 'A public profile may not be in the current dataset, may be inactive, may use different terms, or may have changed since the last successful refresh. Search results are directory matches, not a complete census.',
  },
  {
    q: 'Why do some cards have an Ad label?',
    a: 'Ad identifies a paid placement. Sponsored links use the appropriate sponsored link relationship, and sponsorship is kept separate from the profile data and location statistics.',
  },
  {
    q: 'How do I contact a creator I find here?',
    a: 'Click anywhere on a creator card to open its configured destination in a new tab. Any subscription or messaging happens on that external platform.',
  },
  {
    q: 'How current are prices and profile details?',
    a: 'Cards show the latest successfully stored public values. Because creators can change details after a refresh, verify the current price and offer on the destination profile.',
  },
  {
    q: 'Does browsing the search directory cost anything?',
    a: 'No. Searching and browsing OnlyAmericanFans is free. Any later subscription or purchase is made on the external destination platform.',
  },
];

/* ───────────────────────── State / city pages ───────────────────────── */
/**
 * Returns ~10 FAQs for a state or city page.
 * Combines the location-specific custom FAQs (already authored) with
 * generic location-aware questions to reach the 10-question target.
 */
export function expandLocationFaqs(opts: {
  customFaqs: Faq[];
  label: string;
  total: number;
  isState: boolean;
  abbr?: string;
  parentStateLabel?: string;
}): Faq[] {
  const { customFaqs, label, total, isState, abbr, parentStateLabel } = opts;
  const ctx = isState ? `${label}` : `${label}${parentStateLabel ? `, ${parentStateLabel}` : ''}`;
  const totalText = total > 0 ? total.toLocaleString() : 'no currently counted';

  const generic: Faq[] = [
    {
      q: `How many OnlyFans creators are from ${label}?`,
      a: `The current directory result contains ${totalText} active profile matches for ${ctx}. This is a public-text directory match, not a census or independent proof that every listed creator resides there.`,
    },
    {
      q: `Are there free OnlyFans creators in ${label}?`,
      a: `Use the Free filter to show matched records whose current known advertised subscription price is $0. Unknown prices are not counted as free, and paid extras may still be available.`,
    },
    {
      q: `How do I find verified ${label} OnlyFans creators?`,
      a: `Use the Verified Only filter to show matched records whose current source data reports verified status. OnlyAmericanFans does not independently verify identity or residence.`,
    },
    {
      q: `Which ${isState ? 'cities in ' + label : 'neighborhoods near ' + label} have the most OnlyFans creators?`,
      a: isState
        ? `The ${label} page lists configured city directories. When a complete city snapshot is available, the table can be compared using the same cutoff and methodology.`
        : `Browse the parent state page for configured nearby city directories. City labels and aliases can overlap, so review the published matching methodology.`,
    },
    {
      q: `What categories of ${label} OnlyFans creators are popular?`,
      a: `Category directories use configured terms found in current public profile fields. These matches are discovery aids, not endorsements or independent claims about identity or content.`,
    },
    {
      q: `How often is the ${label} OnlyFans directory updated?`,
      a: `Profile cards use the latest successfully stored records. Published location statistics include an explicit snapshot cutoff and retain the last complete snapshot if a refresh fails.`,
    },
    {
      q: `Is it free to browse ${label} OnlyFans creators on this site?`,
      a: `Yes. Browsing the directory is free. Any subscription or purchase is made on the creator\'s destination platform under its current terms.`,
    },
    {
      q: `Can I search ${label} OnlyFans by price?`,
      a: `Yes. Open the Filters panel and select Free, Under $5 or Under $10 to narrow ${label} results by advertised subscription price.`,
    },
    {
      q: `Are ${label} OnlyFans creators all from ${label}?`,
      a: `No residency guarantee is made. ${abbr ? `${abbr} ` : ''}Matches use curated location terms in current public directory fields; aliases, travel references and incomplete text can create ambiguity.`,
    },
    {
      q: `How do I subscribe to a ${label} OnlyFans creator?`,
      a: `Click anywhere on a creator card to open its configured external destination in a new tab, then review that platform\'s current price and terms.`,
    },
  ];

  // Merge custom FAQs first (authored, unique), pad with generics until 10.
  const merged: Faq[] = [...customFaqs];
  for (const g of generic) {
    if (merged.length >= 10) break;
    // Avoid duplicate questions
    if (!merged.some(m => m.q.toLowerCase() === g.q.toLowerCase())) {
      merged.push(g);
    }
  }
  return merged.slice(0, 10);
}

/* ───────────────────────── Category pages ───────────────────────── */
export function categoryFaqs(opts: {
  label: string;
  slug: string;
  total: number;
  priceFilter?: string;
}): Faq[] {
  const { label, priceFilter } = opts;
  const lower = label.toLowerCase();
  const isFreeCategory = priceFilter === 'free';

  return [
    {
      q: `How are profiles included in the ${label} directory?`,
      a: `Profiles are matched using configured ${lower} terms found in current public directory fields. A category match is a discovery aid, not an endorsement or a claim about a creator's identity.`,
    },
    {
      q: `Can I find free ${label} accounts?`,
      a: isFreeCategory
        ? `This directory is filtered to profiles whose current known advertised subscription price is $0. Prices and paid extras can change after a record is refreshed.`
        : `Use the Free pricing filter to narrow the current ${lower} directory to profiles whose known advertised subscription price is $0. Unknown prices are not treated as free.`,
    },
    {
      q: `Are all ${label} profiles verified?`,
      a: `No. A verification check appears only when the source directory record explicitly reports verified status. Verification is not inferred from a profile name, image or biography.`,
    },
    {
      q: `How are ${label} profiles ordered?`,
      a: `Organic results use the selected directory sort. A paid placement can occupy a separately configured position, but it is visibly labeled as an advertisement and does not change a profile's underlying data.`,
    },
    {
      q: `How current are ${label} prices and profile details?`,
      a: `Cards use the latest successfully stored public directory record. A creator can change a price or profile after that refresh, so confirm current terms on the destination profile before subscribing.`,
    },
    {
      q: `Can I browse ${label} creators by state or city?`,
      a: `Use the state and city links below to open geographic directories. Location pages explain their matching methodology and publish local statistics when a complete snapshot is available.`,
    },
    {
      q: `Does OnlyAmericanFans charge to browse the ${label} directory?`,
      a: `No. Browsing and searching this directory is free. Any subscription or purchase happens on the creator's destination platform under that platform's current terms.`,
    },
  ];
}
