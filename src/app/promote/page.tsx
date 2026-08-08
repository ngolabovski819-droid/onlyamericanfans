import type { Metadata } from 'next';
import FAQ from '@/components/FAQ';

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onlyamericanfans.com';
const APPLY_URL = 'https://tally.so/r/kd16Xe';

export const metadata: Metadata = {
  title: 'Promote Your OnlyFans — Get Real American Fans from Google',
  description:
    'Get your OnlyFans featured on America\'s #1 creator directory. Reach high-intent fans searching Google every month. Go live in 24 hours — no password required.',
  alternates: { canonical: `${SITE_URL}/promote/` },
  openGraph: {
    title: 'Promote Your OnlyFans — OnlyAmericanFans',
    description: 'Get featured in front of high-intent American fans searching Google. Go live in 24 hours.',
    url: `${SITE_URL}/promote/`,
    images: [{ url: `${SITE_URL}/og-default.svg`, width: 1200, height: 630 }],
  },
};

const STEPS = [
  {
    num: '01',
    icon: '📝',
    title: 'Submit Your Profile',
    desc: 'Fill in a short form with your OnlyFans username and the categories you want to appear in. Takes under 2 minutes.',
  },
  {
    num: '02',
    icon: '🛠️',
    title: 'We Optimize Your Listing',
    desc: 'Our team crafts your placement for maximum visibility in our directory and in Google search results.',
  },
  {
    num: '03',
    icon: '🚀',
    title: 'Go Live in 24 Hours',
    desc: 'Your profile is published and starts appearing in front of fans actively searching for creators like you.',
  },
  {
    num: '04',
    icon: '📈',
    title: 'Watch Subscribers Grow',
    desc: 'Track new subscribers and revenue directly in your OnlyFans analytics. No extra dashboards needed.',
  },
];

const BENEFITS = [
  {
    icon: '🎯',
    title: 'High-Intent Audience',
    desc: 'Fans arrive from Google searches like "OnlyFans near me" — they\'re actively looking to subscribe, not passively scrolling.',
  },
  {
    icon: '📊',
    title: 'Consistent, Predictable Traffic',
    desc: 'Search traffic compounds month after month. No algorithm roulette, no praying a post goes viral.',
  },
  {
    icon: '🔒',
    title: '100% Safe & Compliant',
    desc: 'We never ask for your password or account access, and nothing we do violates OnlyFans\' terms of service.',
  },
  {
    icon: '💎',
    title: 'Fans Who Stick Around',
    desc: 'Search-driven subscribers spend more and stay subscribed longer than followers from shout-outs or spam.',
  },
  {
    icon: '📍',
    title: 'State & Niche Targeting',
    desc: 'Get listed by your state, city and categories so nearby fans searching for your exact niche find you first.',
  },
  {
    icon: '😌',
    title: 'No Ongoing Work Required',
    desc: 'Once you\'re live, promotion runs on autopilot. Keep posting as usual — we handle the discovery.',
  },
];

const COMPARISON = [
  { channel: 'OnlyAmericanFans', intent: 'High — actively searching', consistency: 'Compounds monthly', effort: 'One-time setup', highlight: true },
  { channel: 'Reddit', intent: 'Medium — browsing', consistency: 'Posts die in hours', effort: 'Daily posting', highlight: false },
  { channel: 'Twitter / X', intent: 'Low — passive scrolling', consistency: 'Algorithm-dependent', effort: 'Constant content', highlight: false },
  { channel: 'Instagram', intent: 'Low — link restrictions', consistency: 'Ban risk', effort: 'Constant content', highlight: false },
  { channel: 'Bought followers', intent: 'None — bots don\'t pay', consistency: 'Worthless', effort: 'Wasted money', highlight: false },
];

const promoteFaqs = [
  {
    q: 'Is this safe for my OnlyFans account?',
    a: 'Yes. We only list publicly available information — your username, link, categories and location. We never ask for your password or access your account, and directory listings fully comply with OnlyFans\' terms of service.',
  },
  {
    q: 'Do I need to share my OnlyFans password?',
    a: 'Never. We only need your public OnlyFans username. Anyone asking for your password is a scam — we will never request login credentials.',
  },
  {
    q: 'How fast will my profile go live?',
    a: 'Most profiles are reviewed, optimized and published within 24 hours of applying. You\'ll start appearing in the directory and in Google search results shortly after.',
  },
  {
    q: 'Is this the same as buying followers?',
    a: 'No. Bought followers are bots that never spend a cent. We put your profile in front of real American fans who are actively searching Google for creators to subscribe to — real people, real intent, real revenue.',
  },
  {
    q: 'Can agencies submit multiple creators?',
    a: 'Yes. Agencies can apply on behalf of their creators. Submit one application per creator, or mention in the form that you manage multiple models and we\'ll follow up.',
  },
  {
    q: 'What niches and locations do you cover?',
    a: 'We cover all 50 US states, hundreds of cities and every major content niche. Whatever your niche or location, there are fans searching for exactly what you offer.',
  },
];

export default function PromotePage() {
  return (
    <>
      {/* — Hero — */}
      <div className="page-container" style={{ paddingTop: '0.5rem' }}>
        <section className="hero-shell starfield">
          <div className="hero-shell-inner">
            <p className="eyebrow-pill">For Creators &amp; Agencies</p>
            <h1 className="display-h1 display-h1--lg">
              Promote Your <span className="gradient-accent">OnlyFans</span> and Get Real Paying Fans
            </h1>
            <p className="display-sub">
              Millions of American fans search Google for creators every month.
              Get your profile featured on America&apos;s #1 OnlyFans directory and put yourself
              in front of a high-intent audience ready to subscribe.
            </p>

            <div className="promote-cta-block">
              <a href={APPLY_URL} target="_blank" rel="noopener noreferrer" className="btn-glow promote-cta-main">
                🚀 Claim Your Spot — Go Live in 24h
              </a>
              <p className="promote-cta-note">No password required · Free to apply · Real Google traffic</p>
            </div>

            <div style={{ marginTop: '2.25rem', display: 'flex', justifyContent: 'center' }}>
              <div className="glass-stats">
                <div className="glass-stat">
                  <div className="glass-stat-num">280K+</div>
                  <div className="glass-stat-label">Creator Profiles</div>
                </div>
                <div className="glass-stat">
                  <div className="glass-stat-num">50</div>
                  <div className="glass-stat-label">States Covered</div>
                </div>
                <div className="glass-stat">
                  <div className="glass-stat-num">Top 3</div>
                  <div className="glass-stat-label">Google Rankings</div>
                </div>
                <div className="glass-stat">
                  <div className="glass-stat-num">24h</div>
                  <div className="glass-stat-label">To Go Live</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* — Trust strip — */}
      <div className="page-container">
        <div className="trust-strip">
          <span className="trust-item"><span className="trust-item-icon">✓</span> No Password Required</span>
          <span className="trust-item"><span className="trust-item-icon">✓</span> Free to Apply</span>
          <span className="trust-item"><span className="trust-item-icon">✓</span> Real Google Traffic</span>
          <span className="trust-item"><span className="trust-item-icon">✓</span> 100% ToS-Safe</span>
        </div>
      </div>

      {/* — How It Works — */}
      <section className="page-container">
        <div className="section-rail">
          <h2 className="section-rail-title">How It Works</h2>
        </div>
        <div className="category-tile-grid">
          {STEPS.map((s) => (
            <div key={s.num} className="feature-card-2026">
              <span className="feature-num">{s.num}</span>
              <div className="feature-icon-2026">{s.icon}</div>
              <h3 className="feature-title" style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>{s.title}</h3>
              <p className="feature-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* — Why It Works — */}
      <section className="page-container" style={{ paddingTop: '1rem' }}>
        <div className="section-rail">
          <h2 className="section-rail-title">Why It Works</h2>
        </div>
        <div className="category-tile-grid">
          {BENEFITS.map((b) => (
            <div key={b.title} className="feature-card-2026">
              <div className="feature-icon-2026">{b.icon}</div>
              <h3 className="feature-title" style={{ fontSize: '1.05rem', marginBottom: '0.4rem' }}>{b.title}</h3>
              <p className="feature-desc">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* — Traffic comparison — */}
      <section className="page-container" style={{ paddingTop: '1rem' }}>
        <div className="section-rail">
          <h2 className="section-rail-title">How We Compare</h2>
        </div>
        <div className="compare-table-wrap">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Traffic Source</th>
                <th>Buyer Intent</th>
                <th>Consistency</th>
                <th>Effort Required</th>
              </tr>
            </thead>
            <tbody>
              {COMPARISON.map((row) => (
                <tr key={row.channel} className={row.highlight ? 'compare-row--highlight' : undefined}>
                  <td>{row.highlight ? <strong>🇺🇸 {row.channel}</strong> : row.channel}</td>
                  <td>{row.intent}</td>
                  <td>{row.consistency}</td>
                  <td>{row.effort}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* — Mid-page CTA — */}
      <div className="page-container">
        <div className="conversion-strip">
          <div className="conversion-strip-text">
            <h3>Your future subscribers are searching right now</h3>
            <p>Every day you&apos;re not listed, fans searching for your niche and location find someone else. Apply in under 2 minutes.</p>
          </div>
          <div className="conversion-strip-cta">
            <a href={APPLY_URL} target="_blank" rel="noopener noreferrer" className="btn-glow">
              🚀 Claim Your Spot — Go Live in 24h
            </a>
          </div>
        </div>
      </div>

      {/* — FAQ — */}
      <section className="page-container">
        <FAQ faqs={promoteFaqs} heading="Promotion FAQ" />
      </section>

      {/* — Final CTA — */}
      <div className="page-container" style={{ paddingBottom: '4rem' }}>
        <section className="hero-shell hero-shell--compact starfield">
          <div className="hero-shell-inner">
            <h2 className="display-h1" style={{ fontSize: 'clamp(1.8rem, 4vw, 2.6rem)' }}>
              Ready to Grow Your <span className="gradient-accent">OnlyFans</span>?
            </h2>
            <p className="display-sub">
              Join the creators already getting discovered by American fans every day.
            </p>
            <div className="promote-cta-block">
              <a href={APPLY_URL} target="_blank" rel="noopener noreferrer" className="btn-glow promote-cta-main">
                🚀 Claim Your Spot — Go Live in 24h
              </a>
              <p className="promote-cta-note">No password required · Free to apply · Real Google traffic</p>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
