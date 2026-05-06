export interface FAQ {
  q: string;
  a: string;
}

export interface RegionConfig {
  slug: string;
  urlSlug: string; // e.g. 'northeast-onlyfans'
  label: string;
  abbr: string;
  terms: string[];
  h1: string;
  metaTitle: string;
  metaDesc: string;
  intro: string;
  faqs: FAQ[];
  relatedCities: string[];
  relatedRegions: string[];
}

export const regions: RegionConfig[] = [
  {
    slug: 'northeast',
    urlSlug: 'northeast-onlyfans',
    label: 'Northeast',
    abbr: 'NE',
    terms: [
      'new york', 'boston', 'philadelphia', 'new jersey', 'connecticut',
      'massachusetts', 'pennsylvania', 'rhode island', 'new hampshire', 'vermont', 'maine',
      'brooklyn', 'manhattan', 'bronx', 'queens', 'staten island',
      'newark', 'hartford', 'providence', 'albany', 'buffalo',
    ],
    h1: 'Best OnlyFans Creators in the Northeast',
    metaTitle: 'Best Northeast OnlyFans Creators (2026) | OnlyAmericanFans',
    metaDesc: 'Find the best OnlyFans creators from the Northeast US — New York, Boston, Philadelphia and beyond. Free and premium profiles updated daily.',
    intro: "The Northeast is America's most densely populated and culturally diverse region, producing an OnlyFans creator community that is cosmopolitan, ambitious and endlessly varied. New York City alone generates more creators than most entire countries — from the art-world edge of Brooklyn to the glamour of Manhattan, NYC's creator ecosystem reflects the city's unmatched diversity and global influence. Boston's academic powerhouses (Harvard, MIT, Northeastern) fuel a creator community with genuine intellectual range. Philadelphia's working-class authenticity and rising creative scene produce creators who build intensely loyal fanbases. The Northeast's concentration of major universities, global cities and high-earning demographics makes it one of the world's premier OnlyFans creator hubs.",
    faqs: [
      { q: 'How many OnlyFans creators are in the Northeast?', a: 'The Northeast has more OnlyFans creators than any other US region, with New York City alone contributing tens of thousands of active profiles. Our directory indexes hundreds of verified Northeast creators across every niche.' },
      { q: 'Are there free Northeast OnlyFans creators?', a: "Yes — many Northeast creators use free subscriptions to build their following. Use the 'Free' pricing filter to find creators in New York, Boston and Philadelphia with $0 subscription prices." },
      { q: 'What cities in the Northeast have the most OnlyFans creators?', a: 'New York City leads by a wide margin, followed by Boston, Philadelphia, Providence and Hartford. NYC borough creators — particularly Brooklyn and Queens — are especially active.' },
      { q: 'What content styles are popular with Northeast creators?', a: 'New York creators lean toward urban glamour and high-production content. Boston has strong college and alt niches. Philadelphia produces authentic, direct content. All share a no-nonsense confidence characteristic of the region.' },
    ],
    relatedCities: ['new-york', 'boston', 'philadelphia'],
    relatedRegions: ['southeast', 'midwest'],
  },
  {
    slug: 'southeast',
    urlSlug: 'southeast-onlyfans',
    label: 'Southeast',
    abbr: 'SE',
    terms: [
      'florida', 'georgia', 'north carolina', 'south carolina', 'virginia', 'tennessee',
      'alabama', 'mississippi', 'arkansas', 'louisiana', 'kentucky', 'west virginia',
      'miami', 'atlanta', 'nashville', 'charlotte', 'richmond', 'new orleans',
      'jacksonville', 'orlando', 'tampa', 'raleigh', 'memphis',
    ],
    h1: 'Best OnlyFans Creators in the Southeast',
    metaTitle: 'Best Southeast OnlyFans Creators (2026) | OnlyAmericanFans',
    metaDesc: 'Discover top OnlyFans creators from the Southeast US — Miami, Atlanta, Nashville and New Orleans. Free and premium profiles updated daily.',
    intro: "The Southeast is one of America's fastest-growing OnlyFans creator regions, fueled by warm weather, a booming population and a culture that celebrates boldness and self-expression. Miami is arguably the most photogenic city in the country for creator content — stunning beaches, Art Deco architecture, Latin flair and year-round sunshine combine to make South Florida a world-class content production location. Atlanta has become America's new entertainment capital, its Peach State creators blending Southern charm with hip-hop influenced aesthetics. Nashville's music city energy produces creators with exceptional personality and performer instincts. New Orleans brings a uniquely decadent, culturally rich flavour found nowhere else in America. The Southeast is diverse, vibrant and producing some of the country's most exciting OnlyFans talent.",
    faqs: [
      { q: 'Why is Miami popular for OnlyFans creators?', a: "Miami's year-round sunshine, world-class beaches, multicultural population and glamorous lifestyle make it one of America's top creator cities. The combination of South Beach aesthetics, Latin culture and influencer infrastructure creates ideal conditions." },
      { q: 'What content is popular with Southeast OnlyFans creators?', a: "Beach, bikini and outdoor content thrive thanks to warm weather. Atlanta drives hip-hop and urban aesthetics. Nashville contributes country, girl-next-door and Southern belle content. New Orleans produces unique Creole and festival-influenced content." },
      { q: 'Are there free Southeast OnlyFans creators?', a: "Yes — many Southeast creators offer free subscriptions. Use the 'Free' pricing filter to find them." },
      { q: 'What are the top Southeast cities for OnlyFans creators?', a: 'Miami, Atlanta and Nashville lead the region. Orlando, Tampa and Charlotte are rapidly growing. New Orleans has a smaller but intensely creative and unique creator community.' },
    ],
    relatedCities: ['miami', 'atlanta', 'nashville', 'new-orleans'],
    relatedRegions: ['northeast', 'midwest', 'southwest'],
  },
  {
    slug: 'midwest',
    urlSlug: 'midwest-onlyfans',
    label: 'Midwest',
    abbr: 'MW',
    terms: [
      'illinois', 'ohio', 'michigan', 'indiana', 'wisconsin', 'minnesota',
      'iowa', 'missouri', 'north dakota', 'south dakota', 'nebraska', 'kansas',
      'chicago', 'detroit', 'cleveland', 'columbus', 'indianapolis', 'minneapolis',
      'milwaukee', 'st louis', 'kansas city', 'omaha', 'cincinnati',
    ],
    h1: 'Best OnlyFans Creators in the Midwest',
    metaTitle: 'Best Midwest OnlyFans Creators (2026) | OnlyAmericanFans',
    metaDesc: 'Find the best OnlyFans creators from the Midwest — Chicago, Detroit, Cleveland and beyond. Free and premium profiles updated daily.',
    intro: "The Midwest is home to some of America's most genuine, down-to-earth and loyal-fanbase-building OnlyFans creators. Chicago — the region's dominant creative hub — punches at the very top level nationally with a creator community that blends urban sophistication with Midwestern authenticity. Detroit's gritty creative scene produces bold, uncompromising content that fans across the country celebrate. Columbus, Ohio has become a quietly significant creator city thanks to Ohio State University and a thriving arts district. Minneapolis brings Scandinavian-influenced aesthetics and exceptional quality to its creator output. Midwest creators are celebrated in fan communities for their reliability, genuine fan connection and value for money — qualities that build the long-term subscriber loyalty that serious creators covet.",
    faqs: [
      { q: 'Is the Midwest significant for OnlyFans creators?', a: "Absolutely — the Midwest has a substantial and rapidly growing creator community. Chicago rivals coastal cities in creator volume, and university cities like Columbus, Ann Arbor and Madison contribute excellent emerging talent." },
      { q: 'What makes Midwest OnlyFans creators distinctive?', a: "Midwest creators are celebrated for authenticity, approachability and genuine fan engagement. The region's culture of hard work and directness translates into creator-subscriber relationships that fans describe as more personal than their coastal counterparts." },
      { q: 'Are there free Midwest OnlyFans accounts?', a: "Yes — many Midwest creators offer free subscriptions, reflecting the region's value-conscious culture. Use the Free pricing filter to find them." },
      { q: 'Which Midwest cities have the most creators?', a: 'Chicago leads by a substantial margin. Columbus, Detroit, Minneapolis, Indianapolis and Cleveland all have active creator communities.' },
    ],
    relatedCities: ['chicago'],
    relatedRegions: ['northeast', 'southeast', 'southwest'],
  },
  {
    slug: 'southwest',
    urlSlug: 'southwest-onlyfans',
    label: 'Southwest',
    abbr: 'SW',
    terms: [
      'texas', 'arizona', 'new mexico', 'oklahoma', 'nevada',
      'dallas', 'houston', 'san antonio', 'austin', 'phoenix', 'scottsdale',
      'tucson', 'las vegas', 'albuquerque', 'fort worth', 'el paso',
      'mesa', 'tempe', 'chandler',
    ],
    h1: 'Best OnlyFans Creators in the Southwest',
    metaTitle: 'Best Southwest OnlyFans Creators (2026) | OnlyAmericanFans',
    metaDesc: 'Discover top OnlyFans creators from the Southwest US — Las Vegas, Phoenix, Houston, Dallas and Austin. Free and premium profiles updated daily.',
    intro: "The Southwest combines sun, space and Southern hospitality to produce one of America's most vibrant OnlyFans creator landscapes. Las Vegas is the undisputed entertainment capital of the region — creators leverage the city's 24-hour performance culture, world-class production infrastructure and perpetual tourist traffic to build international fanbases. Phoenix and Scottsdale have cultivated a fitness-forward, glamorous creator community that thrives on year-round sunshine and desert aesthetics. Texas is a creator powerhouse in its own right: Austin's tech culture and music scene produce sophisticated, progressive creators; Houston's enormous, culturally diverse population generates exceptional variety; Dallas and Fort Worth contribute polished, ambitious content. The Southwest's warm climate, affordable cost of living and growing population make it increasingly attractive to creators migrating from more expensive coastal markets.",
    faqs: [
      { q: 'Why is Las Vegas popular for OnlyFans creators?', a: "Las Vegas attracts creators because of its 24-hour entertainment culture, abundance of professional production studios, constant stream of tourists willing to subscribe, and the city's general openness to adult content creation as a legitimate profession." },
      { q: 'Which Texas city has the most OnlyFans creators?', a: 'Houston leads Texas in creator volume due to its massive, diverse population. Austin is close behind and generates creators with particularly sophisticated aesthetics. Dallas and San Antonio are also major creator cities.' },
      { q: 'Are there free Southwest OnlyFans accounts?', a: "Yes — many Southwest creators offer free accounts, particularly in major university cities like Tempe, Austin and Albuquerque. Use the Free pricing filter to find them." },
      { q: 'Is Phoenix a growing creator city?', a: "Phoenix is one of the fastest-growing creator cities in America. Its affordability relative to LA and NYC, year-round warm weather and massive population make it ideal for serious creator operations." },
    ],
    relatedCities: ['las-vegas', 'phoenix', 'houston', 'dallas', 'austin'],
    relatedRegions: ['southeast', 'midwest', 'west-coast'],
  },
  {
    slug: 'west-coast',
    urlSlug: 'west-coast-onlyfans',
    label: 'West Coast',
    abbr: 'WC',
    terms: [
      'california', 'oregon', 'washington',
      'los angeles', 'san francisco', 'san diego', 'seattle', 'portland',
      'sacramento', 'san jose', 'fresno', 'long beach', 'oakland', 'tacoma',
      'la jolla', 'socal', 'norcal', 'southern california', 'northern california',
      'hollywood', 'venice beach', 'santa monica', 'malibu', 'beverly hills',
    ],
    h1: 'Best OnlyFans Creators on the West Coast',
    metaTitle: 'Best West Coast OnlyFans Creators (2026) | OnlyAmericanFans',
    metaDesc: 'Find the best West Coast OnlyFans creators from Los Angeles, San Francisco, Seattle and Portland. Free and premium profiles updated daily.',
    intro: "The West Coast is OnlyFans ground zero for the United States. Los Angeles — the global capital of entertainment and adult content creation — has produced more top-earning OnlyFans creators than any other city in the world. Hollywood's professional production infrastructure, perpetual sunshine and the city's culture of performance excellence give LA creators a structural advantage that is virtually unmatched. San Francisco's tech culture and progressive values have created a creator community that is sophisticated, intellectually engaged and extremely well-funded. San Diego brings beach lifestyle, military demographics and proximity to the Mexican border to create a creator scene unlike anywhere else in California. Seattle's rainy, introspective culture paradoxically produces some of America's most creatively ambitious creators. Portland's fiercely independent counterculture generates alt, goth and artistic content that has built devoted international fanbases.",
    faqs: [
      { q: 'Is Los Angeles the top city for OnlyFans creators in the US?', a: "Yes — Los Angeles generates more top-earning OnlyFans creators than any other US city. The combination of entertainment industry infrastructure, professional talent (photographers, editors), and a population accustomed to performance careers creates unmatched conditions." },
      { q: 'Are there many OnlyFans creators in Seattle?', a: "Seattle has a significant and growing creator community. The tech industry workforce creates affluent subscribers, while the city's creative culture produces creators with sophisticated aesthetics and strong production values." },
      { q: 'What OnlyFans content styles are popular in California?', a: "Los Angeles is known for glamour, fitness, and lifestyle content. San Francisco for intellectual and alternative content. San Diego for beach, outdoor and military-adjacent niches. All California cities produce high-quality visuals due to the climate and production culture." },
      { q: 'Are there free West Coast OnlyFans accounts?', a: "Yes — many West Coast creators use free subscriptions to build audiences before monetising with PPV and tips. Use the Free filter to find them." },
    ],
    relatedCities: ['los-angeles', 'san-francisco', 'san-diego', 'seattle'],
    relatedRegions: ['southwest', 'mountain-west'],
  },
  {
    slug: 'mountain-west',
    urlSlug: 'mountain-west-onlyfans',
    label: 'Mountain West',
    abbr: 'MW',
    terms: [
      'colorado', 'utah', 'montana', 'idaho', 'wyoming',
      'denver', 'salt lake city', 'boise', 'billings', 'cheyenne',
      'boulder', 'fort collins', 'colorado springs', 'provo',
    ],
    h1: 'Best OnlyFans Creators in the Mountain West',
    metaTitle: 'Best Mountain West OnlyFans Creators (2026) | OnlyAmericanFans',
    metaDesc: 'Find the best OnlyFans creators from Colorado, Utah, Montana and the Mountain West region. Free and premium profiles updated daily.',
    intro: "The Mountain West is America's most scenically dramatic OnlyFans creator region — creators here have access to the Rocky Mountains, national parks, ski resorts and rugged wilderness that provides content backdrops of almost incomprehensible beauty. Denver has emerged as a major creator city on its own merits, its outdoor culture, cannabis-forward progressive values and rapidly growing population producing a creator community that is active, adventurous and authentically western. Salt Lake City's surprisingly vibrant creator scene benefits from a young population and proximity to world-class ski resorts and red rock canyons. Boise, Idaho has become a creator destination for those priced out of coastal markets — the city's affordability, natural beauty and growing population make it an increasingly attractive creative base.",
    faqs: [
      { q: 'Are there many OnlyFans creators in Denver?', a: "Denver has a growing and active creator community. The city's outdoor culture, progressive values and rapidly expanding population have created excellent conditions for content creation across every niche." },
      { q: 'What makes Mountain West OnlyFans content distinctive?', a: "Mountain West creators uniquely leverage stunning natural landscapes — Rocky Mountain peaks, ski slopes, national parks, red rock deserts — as content backdrops unavailable in coastal or urban markets." },
      { q: 'Can I find free Mountain West OnlyFans accounts?', a: "Yes — use the Free pricing filter to find creators from Colorado, Utah and other Mountain West states with free subscriptions." },
      { q: 'Is Salt Lake City significant for OnlyFans?', a: "Contrary to expectations given the region's religious demographics, Salt Lake City has a growing and active creator community, particularly among younger, more progressive residents and the city's expanding tech workforce." },
    ],
    relatedCities: ['denver'],
    relatedRegions: ['west-coast', 'southwest'],
  },
];

export function getRegionBySlug(slug: string): RegionConfig | undefined {
  return regions.find((r) => r.slug === slug);
}

export function getRegionByUrlSlug(urlSlug: string): RegionConfig | undefined {
  return regions.find((r) => r.urlSlug === urlSlug);
}
