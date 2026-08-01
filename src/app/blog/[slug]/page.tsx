import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getAllPosts } from '@/lib/blog';

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onlyamericanfans.com';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map(p => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `${SITE_URL}/blog/${slug}/` },
    openGraph: { title: post.title, description: post.description, type: 'article' },
  };
}

/** Minimal Markdown → HTML (headings, paragraphs, bold, links, lists — passes through block-level HTML for tables/charts/infographics) */
function renderMarkdown(md: string): string {
  return md
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
    .split(/\n{2,}/)
    .map(block => {
      const t = block.trim();
      // Pass-through for any HTML block-level element so tables/figures/divs render verbatim
      if (/^<(h[1-6]|ul|ol|li|table|thead|tbody|tr|td|th|figure|figcaption|div|section|aside|blockquote|pre|hr|p)\b/i.test(t)) return block;
      if (t === '') return '';
      return `<p>${t.replace(/\n/g, '<br>')}</p>`;
    })
    .join('\n');
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    datePublished: post.date,
    description: post.description,
    publisher: { '@type': 'Organization', name: 'OnlyAmericanFans', url: SITE_URL },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <article className="blog-post page-container">
        <nav className="breadcrumb" style={{ marginBottom: '1.5rem' }} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span className="breadcrumb-sep">›</span>
          <Link href="/blog/">Blog</Link>
          <span className="breadcrumb-sep">›</span>
          <span className="breadcrumb-current">{post.title}</span>
        </nav>

        <section className="detail-hero starfield" style={{ marginBottom: '2rem' }}>
          <div className="detail-hero-inner">
            <p className="eyebrow-pill">Article</p>
            <h1 style={{ fontSize: 'clamp(1.8rem, 4.2vw, 3rem)' }}>
              <span className="gradient-accent">{post.title}</span>
            </h1>
            <p className="display-sub" style={{ margin: '0.5rem 0 0', maxWidth: 700 }}>{post.description}</p>
            <div className="detail-hero-meta">
              <span className="detail-hero-meta-item">📅 {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span className="detail-hero-meta-item">🗂️ Blog</span>
            </div>
          </div>
        </section>

        <div
          className="blog-post-content"
          dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
        />

        <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-subtle)' }}>
          <Link href="/blog/" style={{ color: 'var(--accent-light)', fontWeight: 600 }}>← Back to Blog</Link>
        </div>
      </article>
    </>
  );
}
