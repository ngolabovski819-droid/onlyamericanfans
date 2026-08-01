import type { LocationHighlight, LocationHighlightType } from '@/types/location-stats';
import { formatCount } from './format';
import styles from './state-directory.module.css';

interface DirectoryHighlightsProps {
  label: string;
  highlights: readonly LocationHighlight[];
}

const GROUPS: readonly {
  type: LocationHighlightType;
  title: string;
  explanation: string;
}[] = [
  {
    type: 'popular',
    title: 'Most favorited',
    explanation: 'Ranked by the current source-reported favorite count, then creator ID.',
  },
  {
    type: 'newly-discovered',
    title: 'Latest discoveries',
    explanation: 'Ranked by when the profile first entered this directory, newest first.',
  },
  {
    type: 'recently-confirmed',
    title: 'Recently confirmed',
    explanation: 'Ranked by the latest successful source check, newest first.',
  },
];

function metricLabel(highlight: LocationHighlight): string {
  if (highlight.highlightType === 'popular') {
    return `${formatCount(highlight.metricValue ?? 0)} favorites`;
  }
  if (!highlight.metricAt) return 'Date unavailable';
  return new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeZone: 'UTC' })
    .format(new Date(highlight.metricAt));
}

export function DirectoryHighlights({ label, highlights }: DirectoryHighlightsProps) {
  if (highlights.length === 0) return null;

  return (
    <section className={styles.highlightsSection} aria-labelledby="directory-highlights-heading">
      <div className={styles.sectionHeader}>
        <div>
          <p className={styles.eyebrow}>Snapshot leaderboards</p>
          <h2 id="directory-highlights-heading">Profiles shaping the {label} directory</h2>
          <p className={styles.sectionDescription}>
            These top-five lists were captured inside the same database transaction as the aggregate metrics. Paid placement does not affect rank.
          </p>
        </div>
      </div>
      <div className={styles.highlightGrid}>
        {GROUPS.map((group) => {
          const rows = highlights.filter((item) => item.highlightType === group.type);
          if (rows.length === 0) return null;
          return (
            <article key={group.type} className={styles.highlightCard}>
              <h3>{group.title}</h3>
              <p>{group.explanation}</p>
              <ol>
                {rows.map((row) => (
                  <li key={`${group.type}-${row.creatorId}`}>
                    <span className={styles.highlightRank}>{row.rank}</span>
                    <a href={`https://onlyfans.com/${encodeURIComponent(row.username)}`} target="_blank" rel="noopener nofollow">
                      <strong>{row.displayName ?? row.username}</strong>
                      <small>@{row.username}</small>
                    </a>
                    <span className={styles.highlightMetric}>{metricLabel(row)}</span>
                  </li>
                ))}
              </ol>
            </article>
          );
        })}
      </div>
    </section>
  );
}
