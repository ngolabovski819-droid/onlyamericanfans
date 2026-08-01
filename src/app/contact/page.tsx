import type { Metadata } from 'next';
import Link from 'next/link';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onlyamericanfans.com';

export const metadata: Metadata = {
  title: 'Contact Us — OnlyAmericanFans',
  description: 'Get in touch with the OnlyAmericanFans team. Contact us for general enquiries, corrections, or any questions.',
  alternates: { canonical: `${SITE_URL}/contact/` },
};

export default function ContactPage() {
  return (
    <div className="legal-page">
      <h1>Contact Us</h1>
      <p className="legal-page-date">We&apos;d love to hear from you</p>

      <h2>Get in Touch</h2>
      <p>
        Have a question, correction, or general enquiry? Reach out to us directly by email and
        we&apos;ll get back to you within 48 hours.
      </p>
      <p>
        <strong>Email:</strong>{' '}
        <a href="mailto:nick.golabovski@gmail.com" className="footer-link">
          nick.golabovski@gmail.com
        </a>
      </p>

      <h2>DMCA &amp; Takedown Requests</h2>
      <p>
        For content removal and DMCA requests, please use our dedicated{' '}
        <Link href="/dmca/" className="footer-link">DMCA / Takedowns</Link> page which includes all
        required information for a valid takedown notice.
      </p>

      <h2>Creator Listings</h2>
      <p>
        If you are a creator and would like your profile corrected or removed from our directory,
        please email us with your OnlyFans username and we will action it promptly.
      </p>
    </div>
  );
}
