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
    a: 'Use OnlyAmericanFans to browse thousands of verified US-based creators by state, city, category or price. Every profile in our directory is confirmed to be from the United States, so you never have to filter through international results.',
  },
  {
    q: 'Is OnlyAmericanFans free to use?',
    a: 'Yes — browsing the OnlyAmericanFans directory is 100% free. There are no signup fees, paywalls or hidden charges. You only pay if you choose to subscribe to an individual creator on OnlyFans itself.',
  },
  {
    q: 'Are the creators on OnlyAmericanFans verified?',
    a: 'Yes — every profile we list is publicly verified on OnlyFans and confirmed to be from the United States. Use the "Verified Only" toggle on the search page to display only ID-confirmed creators.',
  },
  {
    q: 'Do you list free American OnlyFans accounts?',
    a: 'Yes — many American creators offer free subscriptions and monetize through tips, PPV (pay-per-view) and bundles. Filter by the "Free" pricing option on the search page to see only no-cost American profiles.',
  },
  {
    q: 'How often is the directory updated?',
    a: 'The OnlyAmericanFans directory is updated daily with new creators, refreshed pricing and current subscriber counts. We continuously discover new American profiles and remove inactive accounts.',
  },
  {
    q: 'Can I search OnlyFans creators by state or city?',
    a: 'Yes — we have dedicated pages for every US state and major city. Browse by state via the navigation menu, or visit the State Directory to see all 50 states ranked by creator count.',
  },
  {
    q: 'What categories of American OnlyFans creators are available?',
    a: 'We index every popular category including MILF, BBW, Latina, Asian, Ebony, Blonde, Trans, Fitness, Petite, Teen (18+) and many more. Visit the Categories page for the full list.',
  },
  {
    q: 'Do I need to create an account to browse?',
    a: 'No — OnlyAmericanFans requires no signup. Just visit any page, search, filter and click through to a creator\'s OnlyFans profile. Your privacy is preserved because we don\'t track personal accounts.',
  },
  {
    q: 'How is OnlyAmericanFans different from searching OnlyFans directly?',
    a: 'OnlyFans does not offer location filtering. We solve this by indexing every American profile and letting you filter by state, city, category and price — something OnlyFans itself doesn\'t support.',
  },
  {
    q: 'Is it legal to browse OnlyFans creators on this site?',
    a: 'Yes — OnlyAmericanFans is a search engine that links to publicly listed OnlyFans profiles. We do not host any adult content. The site is intended for adults aged 18+ in jurisdictions where adult content is legal.',
  },
];

/* ───────────────────────── Search page ───────────────────────── */
export const searchPageFaqs: Faq[] = [
  {
    q: 'How does the OnlyAmericanFans search work?',
    a: 'Our search engine indexes thousands of verified American OnlyFans profiles and matches your query against creator names, usernames, bios, cities and states. Results are sorted by popularity by default.',
  },
  {
    q: 'Can I filter by free OnlyFans creators?',
    a: 'Yes — open the Filters panel and select "Free" under Pricing. You can also filter by "Under $5" or "Under $10" to find affordable American creators.',
  },
  {
    q: 'How do I find verified American OnlyFans accounts?',
    a: 'Toggle the "Verified Only" switch in the Filters panel to show only profiles where the creator has completed OnlyFans ID verification.',
  },
  {
    q: 'Can I search OnlyFans by city or state?',
    a: 'Yes — type a state ("California") or city ("Miami") into the search bar. You can also use our dedicated state and city pages from the navigation menu for richer results.',
  },
  {
    q: 'How do I sort OnlyFans creators by newest first?',
    a: 'Open the Filters panel, expand the Sort group, and select "Newest". Results will reorder to show the most recently discovered American creators first.',
  },
  {
    q: 'Can I search by category and location together?',
    a: 'Yes — visit a state page (e.g. /california-onlyfans/) and click any category chip to see only creators of that category in that state. Or browse a category page and pick a state.',
  },
  {
    q: 'Why are some creators marked as verified?',
    a: 'Verified creators have completed OnlyFans\' identity verification process, which confirms they are who they claim to be. We display the verification badge on every confirmed profile.',
  },
  {
    q: 'How do I contact a creator I find here?',
    a: 'Click "View Profile" on any card to open that creator\'s OnlyFans page in a new tab. From there you can subscribe and message them through OnlyFans\' built-in DM system.',
  },
  {
    q: 'Are there American MILFs / BBWs / Latinas on OnlyFans?',
    a: 'Yes — we have dedicated category pages for MILF, BBW, Latina, Asian, Ebony, Blonde, Trans, Fitness, Petite and more. Click any category from the search filters or visit /categories/.',
  },
  {
    q: 'Why use OnlyAmericanFans instead of Google?',
    a: 'Google does not let you filter OnlyFans creators by state, city, category or price. We aggregate every American creator into a structured directory with proper filters that OnlyFans itself doesn\'t offer.',
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
  const totalText = total > 0 ? total.toLocaleString() : 'hundreds of';

  const generic: Faq[] = [
    {
      q: `How many OnlyFans creators are from ${label}?`,
      a: `OnlyAmericanFans currently lists ${totalText} verified OnlyFans creators from ${ctx}. New profiles are added daily as we discover and verify more local creators.`,
    },
    {
      q: `Are there free OnlyFans creators in ${label}?`,
      a: `Yes — many ${label} creators offer free subscriptions and monetize through tips and pay-per-view content. Filter by "Free" on the search page to see only no-cost ${label} accounts.`,
    },
    {
      q: `How do I find verified ${label} OnlyFans creators?`,
      a: `Use the "Verified Only" toggle in the filter panel on this page to display only ID-confirmed ${label} creators. Verified accounts have completed OnlyFans\' identity verification.`,
    },
    {
      q: `Which ${isState ? 'cities in ' + label : 'neighborhoods near ' + label} have the most OnlyFans creators?`,
      a: isState
        ? `${label}\'s largest cities — including the metropolitan areas — produce the highest volume of OnlyFans creators. Use our state page to see all city-level breakdowns.`
        : `${label} and its surrounding metro area concentrate most local creators. Browse the parent state page for nearby cities.`,
    },
    {
      q: `What categories of ${label} OnlyFans creators are popular?`,
      a: `Popular categories among ${label} creators include MILF, fitness, blonde, Latina, Asian, ebony, BBW and amateur. Click any category chip on this page to filter by category within ${label}.`,
    },
    {
      q: `How often is the ${label} OnlyFans directory updated?`,
      a: `Our ${label} directory refreshes daily — pricing, subscriber counts and verification status are continuously updated, and new creators are added as soon as they are discovered.`,
    },
    {
      q: `Is it free to browse ${label} OnlyFans creators on this site?`,
      a: `Yes — browsing the OnlyAmericanFans directory is 100% free. You only pay if you choose to subscribe to an individual ${label} creator directly on OnlyFans.`,
    },
    {
      q: `Can I search ${label} OnlyFans by price?`,
      a: `Yes — open the Filters panel and select Free, Under $5 or Under $10 to narrow ${label} results by subscription price.`,
    },
    {
      q: `Are ${label} OnlyFans creators all from ${label}?`,
      a: `We verify each profile\'s self-reported location against city and state mentions in their bio. ${abbr ? `${abbr} ` : ''}Creators in our ${label} directory have publicly indicated they are from or based in ${label}.`,
    },
    {
      q: `How do I subscribe to a ${label} OnlyFans creator?`,
      a: `Click "View Profile" on any ${label} creator card to open their OnlyFans page in a new tab. From there, click "Subscribe" on OnlyFans to follow their content.`,
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
  const { label, total, priceFilter } = opts;
  const lower = label.toLowerCase();
  const totalText = total > 0 ? total.toLocaleString() : 'hundreds of';
  const isFreeCategory = priceFilter === 'free';

  return [
    {
      q: `Where can I find the best ${label} OnlyFans creators in America?`,
      a: `OnlyAmericanFans lists ${totalText} verified American ${lower} OnlyFans creators, all sorted by popularity. Browse the directory above to find the best ${lower} creators across the United States.`,
    },
    {
      q: `Are there free American ${label} OnlyFans accounts?`,
      a: isFreeCategory
        ? `Yes — every creator on this page offers a free subscription. They monetize through tips, PPV messages and content bundles instead of subscription fees.`
        : `Yes — many American ${lower} creators offer free subscriptions. Use the "Free" pricing filter to see only no-cost ${lower} profiles.`,
    },
    {
      q: `How many ${label} OnlyFans creators are listed on OnlyAmericanFans?`,
      a: `Our directory currently includes ${totalText} American ${lower} OnlyFans creators. New profiles are discovered and added daily.`,
    },
    {
      q: `Which US states have the most ${label} OnlyFans creators?`,
      a: `California, Texas, Florida and New York consistently lead in volume of American ${lower} creators. Use the state chips below to browse ${lower} creators by state.`,
    },
    {
      q: `How do I find verified ${label} American OnlyFans creators?`,
      a: `Toggle the "Verified Only" switch in the filter panel to display only ${lower} creators who have completed OnlyFans\' ID verification process.`,
    },
    {
      q: `Are ${label} OnlyFans creators on this site really American?`,
      a: `Yes — we verify each profile\'s self-reported location against US states and cities in their OnlyFans bio. Every ${lower} creator listed here has indicated they are from the United States.`,
    },
    {
      q: `What\'s the average subscription price for ${label} American OnlyFans creators?`,
      a: `Most American ${lower} creators charge between free and $15/month. Use the pricing filter to find ${lower} accounts in your budget — Free, Under $5, or Under $10.`,
    },
    {
      q: `How often are ${label} creators added to the directory?`,
      a: `Our ${label} category is updated daily. We discover new American ${lower} OnlyFans creators continuously and refresh existing profiles to keep pricing and verification status current.`,
    },
    {
      q: `Can I combine the ${label} filter with a state or city?`,
      a: `Yes — visit any state or city page and click the ${label} category chip to see only ${lower} creators in that location. Conversely, scroll down on this page to browse ${lower} creators by state.`,
    },
    {
      q: `Is it free to browse ${label} American OnlyFans on OnlyAmericanFans?`,
      a: `Yes — using OnlyAmericanFans is 100% free. You only pay if you choose to subscribe to an individual ${lower} creator on OnlyFans.`,
    },
  ];
}
