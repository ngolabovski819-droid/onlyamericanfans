export interface FAQ {
  q: string;
  a: string;
}

export interface RegionConfig {
  slug: string;
  urlSlug: string; // e.g. 'england-onlyfans'
  label: string;
  abbr: string;
  terms: string[];
  h1: string;
  metaTitle: string;
  metaDesc: string;
  intro: string;
  faqs: FAQ[];
  relatedCities: string[]; // city slugs
  relatedRegions: string[]; // region slugs
}

export const regions: RegionConfig[] = [
  {
    slug: 'england',
    urlSlug: 'england-onlyfans',
    label: 'England',
    abbr: 'ENG',
    terms: [
      'england', 'english',
      'london', 'manchester', 'birmingham', 'liverpool', 'leeds', 'sheffield',
      'bristol', 'newcastle', 'nottingham', 'southampton', 'leicester', 'brighton',
      'coventry', 'bradford', 'hull', 'stoke', 'wolverhampton', 'derby', 'exeter',
      'cambridge', 'oxford', 'york', 'bath', 'norwich', 'portsmouth', 'reading',
    ],
    h1: 'Best OnlyFans Creators in England',
    metaTitle: 'Best England OnlyFans Creators (2026) | OnlyBritishFans',
    metaDesc: 'Browse the hottest OnlyFans creators from England. Find London, Manchester and Birmingham creators with free and premium content. Updated daily.',
    intro: "England is home to Britain's largest and most vibrant OnlyFans creator community. From the cosmopolitan streets of London and the creative powerhouse of Manchester to the independent spirit of Bristol and the culture-rich cities of Birmingham and Leeds, English creators bring an irresistible energy and diversity to their content. The sheer size and variety of England — spanning world-class universities, buzzing nightlife cities, and picturesque countryside — gives creators an extraordinary breadth of environments to work with. Whether you're after free accounts from up-and-coming creators or premium verified content from England's top earners, our directory makes it simple to find exactly what you're looking for. We index thousands of English creators across every niche — from fitness models in London's East End to alternative artists in Bristol's vibrant scene. Our listings are refreshed daily so you're always seeing the most current profiles, prices and subscription deals.",
    faqs: [
      { q: 'How many OnlyFans creators are based in England?', a: 'Our directory indexes thousands of England-based OnlyFans creators, with London contributing the largest share by far. The number changes daily as new creators join and existing ones update their profiles.' },
      { q: 'Are there free OnlyFans creators from England?', a: "Yes — many English creators offer free subscriptions to attract new fans, then monetise through tips and pay-per-view content. Use the Pricing filter and select 'Free' to see them all." },
      { q: 'Can I find verified OnlyFans creators from England?', a: 'Absolutely. Toggle the Verified switch in the filter sidebar to show only creators who have completed OnlyFans identity verification — a quality signal many subscribers look for.' },
      { q: 'What content types are most popular among English creators?', a: "MILF, alt/goth, fitness, amateur and couples content are consistently popular in England. London creators lean toward glamour and lifestyle content, while creators from northern cities like Manchester and Leeds bring a grittier, more authentic working-class aesthetic." },
    ],
    relatedCities: ['london', 'manchester', 'birmingham', 'liverpool', 'leeds', 'bristol', 'sheffield', 'newcastle', 'nottingham', 'southampton', 'leicester', 'brighton'],
    relatedRegions: ['scotland', 'wales'],
  },
  {
    slug: 'scotland',
    urlSlug: 'scotland-onlyfans',
    label: 'Scotland',
    abbr: 'SCO',
    terms: [
      'scotland', 'scottish',
      'glasgow', 'edinburgh', 'aberdeen', 'dundee', 'inverness', 'perth scotland',
      'stirling', 'falkirk', 'ayr', 'kilmarnock', 'paisley', 'highlands', 'orkney',
    ],
    h1: 'Best OnlyFans Creators in Scotland',
    metaTitle: 'Best Scotland OnlyFans Creators (2026) | OnlyBritishFans',
    metaDesc: 'Discover top OnlyFans creators from Scotland. Browse Glasgow, Edinburgh and Aberdeen creators. Free and premium content updated daily.',
    intro: "Scotland's OnlyFans creator community is as bold and distinctive as the nation itself. Glasgow — Scotland's largest city — has cultivated a fiercely creative creator community rooted in the city's world-renowned arts and music scene. Edinburgh, the capital, brings a more refined and internationally-connected aesthetic, with creators who benefit from the city's constant influx of tourists and festival audiences. Aberdeen's oil-industry wealth translates into a premium creator market with subscribers who invest seriously in content. The Scottish Highlands and islands add a truly unique natural backdrop that no other part of Britain can replicate — dramatic glens, rugged coastlines and ancient castles feature in content that international fans find genuinely exotic. Scottish creators are known for their directness, warmth and genuine fan engagement — subscribing to a Scottish creator often feels like a real personal connection.",
    faqs: [
      { q: 'Are there many OnlyFans creators based in Scotland?', a: "Scotland has a thriving creator community, particularly in Glasgow and Edinburgh. Scottish creators are known for being highly engaged with their fans and producing content with a strong sense of local character and pride." },
      { q: 'Do Scottish creators offer bundles or free subscriptions?', a: "Many do. Use the Free pricing filter to find Scottish creators with £0 subscription prices, or enable the bundles option to find those offering multi-month discounted packages." },
      { q: 'What content styles are Scottish creators known for?', a: "Scottish creators span the full spectrum, with notable strength in alt/goth, outdoor/adventure, and authentic amateur content. Edinburgh's festival culture produces a strong cosplay and artistic niche, while Glasgow creators lean toward bold, unapologetic content." },
      { q: 'Can I find creators from the Scottish Highlands on OnlyFans?', a: "Yes — Highland creators use the incredible Scottish landscape as a unique backdrop. Search 'highlands' or 'scotland' in our search bar to find creators based in rural and island Scotland." },
    ],
    relatedCities: ['glasgow', 'edinburgh', 'aberdeen'],
    relatedRegions: ['england', 'northern-ireland'],
  },
  {
    slug: 'wales',
    urlSlug: 'wales-onlyfans',
    label: 'Wales',
    abbr: 'WAL',
    terms: [
      'wales', 'welsh',
      'cardiff', 'swansea', 'newport', 'wrexham', 'bangor', 'brecon',
      'rhondda', 'merthyr', 'aberystwyth', 'llandudno',
    ],
    h1: 'Best OnlyFans Creators in Wales',
    metaTitle: 'Best Wales OnlyFans Creators (2026) | OnlyBritishFans',
    metaDesc: 'Find the hottest Welsh OnlyFans creators from Cardiff, Swansea and beyond. Updated daily. Free and premium profiles.',
    intro: "Wales brings a unique and passionate voice to Britain's OnlyFans creator landscape. Cardiff — the vibrant capital — has a young, diverse creative community shaped by a major university, a thriving sports culture and a growing tech and media sector. Swansea adds a coastal dimension, with creators who take full advantage of the Gower Peninsula — one of the UK's most beautiful stretches of coastline — as a stunning content backdrop. The Welsh Valleys have their own distinct culture, producing authentic, down-to-earth creators with intensely loyal fan communities. Welsh creators are proud of their identity, and many weave Welsh language, culture and landscape into their content in ways that resonate strongly with international audiences looking for something genuinely different from the London mainstream. Wales may be small, but its creator community punches well above its weight.",
    faqs: [
      { q: "Is Cardiff a significant city for OnlyFans creators?", a: "Yes — Cardiff has a growing and diverse creator community driven by its large student population and vibrant arts scene. Welsh creators from Cardiff consistently rank among the UK's most engaging content producers." },
      { q: 'Are there free Welsh OnlyFans accounts?', a: "Several Welsh creators offer free subscription accounts. Apply the Free pricing filter on this page to find them instantly. Many use free subscriptions to build a fan base before introducing premium tiers." },
      { q: 'What makes Welsh OnlyFans content distinctive?', a: "Welsh creators frequently incorporate the country's breathtaking coastal and mountain scenery — particularly around the Gower, Brecon Beacons and Snowdonia — into their content. This gives Welsh creator content a natural, outdoorsy quality distinct from more urban UK creators." },
      { q: 'Can I find Welsh-speaking creators on OnlyFans?', a: "Some Welsh creators incorporate the Welsh language into their content and social media presence. Search 'Welsh' in our search bar — creators often reference language and culture in their bios." },
    ],
    relatedCities: ['cardiff', 'swansea'],
    relatedRegions: ['england', 'scotland'],
  },
  {
    slug: 'northern-ireland',
    urlSlug: 'northern-ireland-onlyfans',
    label: 'Northern Ireland',
    abbr: 'NIR',
    terms: [
      'northern ireland', 'belfast', 'derry', 'londonderry', 'armagh', 'lisburn',
      'newry', 'ballymena', 'antrim', 'newtownabbey', 'causeway coast',
    ],
    h1: 'Best OnlyFans Creators in Northern Ireland',
    metaTitle: 'Best Northern Ireland OnlyFans Creators (2026) | OnlyBritishFans',
    metaDesc: "Browse OnlyFans creators from Northern Ireland and Belfast. Discover NI's best free and premium profiles. Updated daily.",
    intro: "Northern Ireland's OnlyFans creator scene is intimate, passionate and rapidly growing. Belfast — the region's capital and largest city — has undergone an extraordinary cultural renaissance over the past two decades, and this creative confidence is visible in the local creator community. Belfast creators are known for being warm, direct and exceptionally engaged with their subscribers. The city's compact geography means creators form genuine communities and often collaborate, which subscribers notice and appreciate. The stunning natural landscapes of the Causeway Coast, the Glens of Antrim and Fermanagh's lakelands provide content backdrops that rival anywhere in the British Isles. Northern Ireland's creators benefit from the region's fascinating dual identity — part British, part Irish — which produces content perspectives and aesthetics you simply won't find anywhere else in the UK.",
    faqs: [
      { q: 'Are there OnlyFans creators based in Northern Ireland?', a: "Yes — Belfast and the wider Northern Ireland region has a growing creator community. Belfast creators in particular are known for their warmth, authenticity and strong fan relationships." },
      { q: "What is Belfast's OnlyFans scene like?", a: "Belfast has seen rapid growth in its creator community alongside the city's broader cultural renaissance. Creators span a wide range of niches from lifestyle and fitness to alt and couples content." },
      { q: 'Can I find free Northern Ireland OnlyFans accounts?', a: "Several NI creators offer free subscription accounts. Use the Pricing filter to find them. Many Northern Irish creators use free subscriptions to build an initial following before transitioning to paid tiers." },
      { q: 'What content do Northern Ireland creators typically produce?', a: "Northern Irish creators often feature the region's stunning natural scenery — particularly the Causeway Coast and the Glens of Antrim. Content styles range from outdoor lifestyle and fitness to authentic amateur and couples content." },
    ],
    relatedCities: ['belfast'],
    relatedRegions: ['scotland', 'england'],
  },
];

export function getRegionBySlug(slug: string): RegionConfig | undefined {
  return regions.find((r) => r.slug === slug);
}

export function getRegionByUrlSlug(urlSlug: string): RegionConfig | undefined {
  return regions.find((r) => r.urlSlug === urlSlug);
}
