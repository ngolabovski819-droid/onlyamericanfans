interface Stat {
  value: string;
  label: string;
}

interface Props {
  stats?: Stat[];
}

const DEFAULT_STATS: Stat[] = [
  { value: states.length.toLocaleString('en-US'), label: 'US States' },
  { value: cities.length.toLocaleString('en-US'), label: 'City Directories' },
  { value: 'Public', label: 'Profile Data' },
  { value: 'Free', label: 'To Browse' },
];

export default function StatsBar({ stats = DEFAULT_STATS }: Props) {
  return (
    <div className="stats-bar">
      {stats.map((s) => (
        <div key={s.label} className="stat-item">
          <span className="stat-value">{s.value}</span>
          <span className="stat-label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
import { cities } from '@/config/cities';
import { states } from '@/config/states';
