import type { Metadata } from 'next';

import { SITE_URL } from '@/lib/site-url';

export const metadata: Metadata = {
  title: 'About the OnlyAmericanFans Creator Directory',
  description: 'Learn how OnlyAmericanFans organizes public creator records by location, category and advertised price, including its limitations.',
  alternates: { canonical: `${SITE_URL}/about` },
};

export default function AboutPage() {
  return (
    <div className="legal-page">
      <h1>About OnlyAmericanFans</h1>
      <p className="legal-page-date">Independent creator discovery directory</p>

      <h2>What We Do</h2>
      <p>
        OnlyAmericanFans is an independent creator search and discovery directory. We organize
        public profile records by location, category and advertised price to make them easier to explore.
      </p>
      <p>
        Our platform is refreshed regularly with new and existing creator records, allowing you to search
        by region, city, category and price. We&apos;re independent and not affiliated with OnlyFans.
      </p>

      <h2>Our Mission</h2>
      <p>
        We believe directory search should be useful, transparent and honest about its limits.
        Our goal is to make public creator records easier to explore without presenting location,
        verification or price information as more certain than the source data supports.
      </p>

      <h2>How We Work</h2>
      <ul>
        <li>We index publicly available creator information from OnlyFans</li>
        <li>Creator profiles are updated regularly to reflect current pricing and status</li>
        <li>Location pages use curated public-profile terms and explain that this is not proof of residence</li>
        <li>We do not manage, operate or take fees from any OnlyFans creator</li>
      </ul>

      <h2>Content Policy</h2>
      <p>
        OnlyAmericanFans is an adult content directory. All creators listed on our platform are 18+
        and have agreed to OnlyFans&apos; terms of service. We do not host any adult content directly
        on our platform — we link to external OnlyFans profiles only.
      </p>

      <h2>Contact</h2>
      <p>
        For enquiries, corrections, or DMCA requests, please use the relevant page linked in our
        footer. We aim to respond to all legitimate requests within 48 hours.
      </p>
    </div>
  );
}
