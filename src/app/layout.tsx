import type { Metadata } from 'next';
import { DM_Sans, Oswald } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import AgeGate from '@/components/AgeGate';
import { SITE_URL } from '@/lib/site-url';

const GA_ID = 'G-00EBQM04JD';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap', weight: ['400', '500', '600', '700'] });
const oswald = Oswald({ subsets: ['latin'], variable: '--font-oswald', display: 'swap', weight: ['400', '500', '600', '700'] });

const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'OnlyAmericanFans';

export const metadata: Metadata = {
  title: {
    default: 'OnlyAmericanFans — American Creator Directory & Search',
    template: '%s | OnlyAmericanFans',
  },
  description:
    'Browse public American creator profiles by state, city, price and category with transparent directory data and search.',
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    siteName: SITE_NAME,
    locale: 'en_US',
    type: 'website',
  },
  alternates: {
    canonical: SITE_URL,
    languages: { 'en-US': SITE_URL },
  },
  other: {
    rating: 'adult',
    'revisit-after': '3 days',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: ['Only American Fans', 'OAF'],
      description: 'American creator directory and search by state, city, category and advertised price.',
      inLanguage: 'en-US',
      publisher: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/onlyfans-search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      url: SITE_URL,
      name: SITE_NAME,
      alternateName: 'Only American Fans',
      description: 'Search engine for American OnlyFans creators — browse by state, city, category and price.',
      logo: {
        '@type': 'ImageObject',
        url: `${SITE_URL}/og-image.png`,
        width: 1200,
        height: 630,
      },
      sameAs: [],
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en-US"
      className={`${dmSans.variable} ${oswald.variable}`}
      data-scroll-behavior="smooth"
    >
      <head>
        <meta name="rating" content="adult" />
        <meta name="DC.language" content="en-US" />
        <link rel="preconnect" href="https://images.weserv.nl" />
        <link rel="alternate" hrefLang="en-US" href={SITE_URL} />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/favicon.svg" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
      </head>
      <body>
        <AgeGate />
        <Nav />
        <main>{children}</main>
        <Footer />
        <GoogleAnalytics gaId={GA_ID} />
      </body>
    </html>
  );
}
