import type { DirectoryFaq } from './build-directory-faqs';

interface BuildDirectoryFallbackFaqsOptions {
  label: string;
  terms: string[];
  estimatedInventory: number;
  visibleSampleSize: number;
}

export function buildDirectoryFallbackFaqs({
  label,
  terms,
  estimatedInventory,
  visibleSampleSize,
}: BuildDirectoryFallbackFaqsOptions): DirectoryFaq[] {
  const signalPreview = terms.slice(0, 5).join(', ');
  return [
    {
      q: `How are profiles matched to ${label}?`,
      a: `The directory searches public source-location text for configured geographic signals such as ${signalPreview}. A match is useful for discovery but is not proof that a creator resides in or is currently located in ${label}.`,
    },
    {
      q: `How many profiles currently match ${label}?`,
      a: `The live query currently returns a database-planner estimate of about ${estimatedInventory.toLocaleString('en-US')} matching profiles. This is deliberately labeled as an estimate until a complete aggregate snapshot supplies an exact, auditable count.`,
    },
    {
      q: `What do the visible ${label} sample statistics measure?`,
      a: `They are calculated from the ${visibleSampleSize.toLocaleString('en-US')} non-sponsored profiles visible on the first results page. They describe that sample only and must not be read as totals for the whole location.`,
    },
    {
      q: 'What do “verified” and “free” mean in this directory?',
      a: 'Verified means the source record explicitly reported verification. Free means a known current advertised subscription price of exactly $0; a missing price is treated as unknown, never as free.',
    },
    {
      q: 'Do sponsored cards affect the location statistics?',
      a: 'No. Paid placements are labeled “Ad” and are excluded from the visible-page sample calculations because placement does not prove a geographic match.',
    },
  ];
}
