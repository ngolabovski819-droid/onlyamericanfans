import type { Metadata } from 'next';
import { DM_Sans, Playfair_Display } from 'next/font/google';
import { GoogleAnalytics } from '@next/third-parties/google';
import './globals.css';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import AgeGate from '@/components/AgeGate';

const GA_ID = 'G-JMC006C5K7';

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-dm-sans', display: 'swap', weight: ['400', '500', '600', '700'] });
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair', display: 'swap', weight: ['700', '800', '900'] });

const SITE_URL  = process.env.NEXT_PUBLIC_SITE_URL  ?? 'https://onlybritishfans.com';
const SITE_NAME = process.env.NEXT_PUBLIC_SITE_NAME ?? 'OnlyBritishFans';

export const metadata: Metadata = {
  title: {
    default: 'OnlyBritishFans — #1 British OnlyFans Search Engine',
    template: '%s | OnlyBritishFans',
  },
  description:
    'Find the best British OnlyFans creators. Search by location, price and more. Thousands of verified UK creators — updated daily.',
  metadataBase: new URL(SITE_URL),
  robots: { index: true, follow: true, googleBot: { index: true, follow: true } },
  openGraph: {
    siteName: SITE_NAME,
    locale: 'en_GB',
    type: 'website',
  },
  alternates: {
    canonical: SITE_URL,
    languages: { 'en-GB': SITE_URL },
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
      description: 'The #1 British OnlyFans search engine — find UK creators by location and price.',
      inLanguage: 'en-GB',
      potentialAction: {
        '@type': 'SearchAction',
        target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
        'query-input': 'required name=search_term_string',
      },
    },
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      url: SITE_URL,
      name: SITE_NAME,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.png` },
    },
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-GB" className={`${dmSans.variable} ${playfair.variable}`}>
      <head>
        <meta name="rating" content="adult" />
        <meta name="DC.language" content="en-GB" />
        <link rel="preconnect" href="https://images.weserv.nl" />
        <link rel="alternate" hrefLang="en-GB" href={SITE_URL} />
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

