import type { ReactNode } from 'react';
import {
  fetchCreatorStatLeaders,
  type StatLeader,
  type StatLeaderParams,
  type StatMetric,
} from '@/lib/supabase';
import { getSponsorOverride } from '@/config/sponsor-overrides';

interface StatSectionConfig {
  metric: StatMetric;
  heading: string;
  icon: string;
  /** Clause that ends right before the #1 creator's name, e.g. "...and the list is led by" */
  intro: (pageLabel: string) => string;
  /** Unit word appended after each creator's number, e.g. "favorites" */
  unit: string;
  closing: (pageLabel: string) => string;
}

const STAT_SECTIONS: StatSectionConfig[] = [
  {
    metric: 'favoritedcount',
    heading: 'Most Liked',
    icon: '❤️',
    intro: (l) => `${l} OnlyFans creators live and die by how many likes they rack up, and the list is currently led by`,
    unit: 'likes',
    closing: (l) =>
      `If you're browsing ${l} OnlyFans and want the creators fans keep coming back to, like count is the fastest signal to follow.`,
  },
  {
    metric: 'subscriberscount',
    heading: 'Current Subscribed Fans',
    icon: '👥',
    intro: (l) => `Subscriber count is the clearest read on a creator's real fanbase size, and among ${l} OnlyFans profiles that publicly display it, the most subscribed is`,
    unit: 'subscribers',
    closing: (l) =>
      `Keep in mind not every creator makes their subscriber count public, so this only ranks the ${l} creators who choose to show it. Plenty of others may have just as large a following behind the scenes.`,
  },
  {
    metric: 'finishedstreamscount',
    heading: 'Most Live Streams',
    icon: '🎥',
    intro: (l) => `Live streaming is one of the best ways ${l} OnlyFans creators connect with fans in real time, and the most active streamer is`,
    unit: 'streams',
    closing: (l) =>
      `For fans who want real-time interaction instead of just posts and photos, these ${l} creators are the ones consistently going live.`,
  },
  {
    metric: 'photoscount',
    heading: 'Most Photos Posted',
    icon: '📸',
    intro: (l) => `Photo volume is a strong signal of how active a creator's library is, and the biggest photo count among ${l} OnlyFans creators belongs to`,
    unit: 'photos',
    closing: (l) =>
      `Fans looking for a deep photo archive to scroll through will find these ${l} creators post more consistently than almost anyone else.`,
  },
  {
    metric: 'postscount',
    heading: 'Most Posts',
    icon: '📝',
    intro: (l) => `Total post count reflects overall activity and consistency, and the most active ${l} OnlyFans creator by post count is`,
    unit: 'posts',
    closing: (l) =>
      `If you want a creator who updates regularly instead of going quiet for weeks, these are the ${l} profiles posting the most.`,
  },
  {
    metric: 'videoscount',
    heading: 'Most Videos Posted',
    icon: '🎬',
    intro: (l) => `Video content tends to convert best, and the creator with the most videos among ${l} OnlyFans profiles is`,
    unit: 'videos',
    closing: (l) =>
      `For fans who prefer video over photos, these ${l} creators have built out the largest video libraries on the platform.`,
  },
  {
    metric: 'audioscount',
    heading: 'Most Audio Posts',
    icon: '🎧',
    intro: (l) => `Audio content is a niche but loyal format, and the ${l} OnlyFans creator with the most audio posts is`,
    unit: 'audio posts',
    closing: (l) =>
      `For fans who want voice notes and audio-exclusive content, these ${l} creators are the ones posting the most.`,
  },
  {
    metric: 'archivedpostscount',
    heading: 'Most Archived Posts',
    icon: '🗄️',
    intro: (l) => `Archived posts show just how much back catalog content a creator has built up over time, and the deepest archive among ${l} OnlyFans creators belongs to`,
    unit: 'archived posts',
    closing: (l) =>
      `A deep archive means new subscribers get years of content to dig through the moment they follow one of these ${l} creators.`,
  },
];

function formatNum(n: number): string {
  return n.toLocaleString('en-US');
}

/** Mirrors CreatorCard.tsx's link logic: tracked/paid creators route through /go/[username] (for
 *  click logging + linkOverride), everyone else links straight to OnlyFans. Never rel=noreferrer
 *  since the /go/ route needs the Referer for placement attribution. */
function creatorLinkProps(username: string): { href: string; rel: string } {
  const isTracked = !!getSponsorOverride(username);
  return {
    href: isTracked ? `/go/${username}` : `https://onlyfans.com/${username}`,
    rel: isTracked ? 'noopener nofollow sponsored' : 'noopener nofollow',
  };
}

function CreatorRef({ leader }: { leader: StatLeader }) {
  const { href, rel } = creatorLinkProps(leader.username);
  return (
    <a href={href} target="_blank" rel={rel} className="about-stats-link">
      {leader.name?.trim() || leader.username}
    </a>
  );
}

function StatParagraph({
  pageLabel,
  config,
  leaders,
}: {
  pageLabel: string;
  config: StatSectionConfig;
  leaders: StatLeader[];
}): ReactNode {
  const [l1, l2, l3, l4, l5] = leaders;
  return (
    <p className="about-stats-body">
      {config.intro(pageLabel)} <CreatorRef leader={l1} /> at {formatNum(l1.value)} {config.unit}
      {l2 && (
        <>
          , ahead of <CreatorRef leader={l2} /> at {formatNum(l2.value)}
        </>
      )}
      {l3 && (
        <>
          {' '}
          and <CreatorRef leader={l3} /> at {formatNum(l3.value)}
        </>
      )}
      {'. '}
      {l4 && (
        <>
          <CreatorRef leader={l4} /> follows at {formatNum(l4.value)}
          {l5 && (
            <>
              {' '}
              and <CreatorRef leader={l5} /> at {formatNum(l5.value)}
            </>
          )}
          {'. '}
        </>
      )}
      {config.closing(pageLabel)}
    </p>
  );
}

function StatCard({
  index,
  pageLabel,
  config,
  leaders,
}: {
  index: number;
  pageLabel: string;
  config: StatSectionConfig;
  leaders: StatLeader[];
}) {
  const leader = leaders[0];
  return (
    <article className="about-stats-card">
      <span className="about-stats-card-index">{String(index + 1).padStart(2, '0')}</span>
      <div className="about-stats-card-top">
        <span className="about-stats-card-icon" aria-hidden="true">{config.icon}</span>
        <h3 className="about-stats-card-label">{config.heading}</h3>
      </div>

      <div className="about-stats-hero">
        <div className="about-stats-hero-value">
          <span className="about-stats-hero-num">{formatNum(leader.value)}</span>
          <span className="about-stats-hero-unit">{config.unit}</span>
        </div>
        <span className="about-stats-rank-badge">🏆 #1</span>
      </div>
      <p className="about-stats-hero-name">
        <CreatorRef leader={leader} />
      </p>

      <StatParagraph pageLabel={pageLabel} config={config} leaders={leaders} />
    </article>
  );
}

export interface CreatorStatsSectionProps {
  /** Short label slotted into "About {headingLabel} OnlyFans Creators" and "{headingLabel} OnlyFans creators…" throughout — e.g. "American", "Texas", "MILF" */
  headingLabel: string;
  /** Usually the same as headingLabel; lets a caller pass a cleaned-up label for body copy while
   *  keeping the fuller version (e.g. "Teen (18+)") in the heading. */
  pageLabel?: string;
  /** Same scoping terms the page's CreatorGrid uses, so the leaderboard matches what's on screen */
  params: StatLeaderParams;
}

export default async function CreatorStatsSection({ headingLabel, pageLabel, params }: CreatorStatsSectionProps) {
  const results = await Promise.all(
    STAT_SECTIONS.map((section) => fetchCreatorStatLeaders(section.metric, params, 5)),
  );

  const sections = STAT_SECTIONS.map((config, i) => ({ config, leaders: results[i] })).filter(
    (s) => s.leaders.length > 0 && s.leaders[0].value > 0,
  );

  if (sections.length === 0) return null;

  const effectivePageLabel = pageLabel ?? headingLabel;

  return (
    <section className="about-stats-section">
      <p className="about-stats-eyebrow">Creator Rankings</p>
      <h2 className="about-stats-heading">About {headingLabel} OnlyFans Creators</h2>
      <div className="about-stats-grid">
        {sections.map(({ config, leaders }, i) => (
          <StatCard key={config.metric} index={i} pageLabel={effectivePageLabel} config={config} leaders={leaders} />
        ))}
      </div>
    </section>
  );
}
