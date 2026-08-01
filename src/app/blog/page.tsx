import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllPosts } from '@/lib/blog';

export const revalidate = 3600;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://www.onlyamericanfans.com';

export const metadata: Metadata = {
  title: 'Blog — American OnlyFans Tips & Guides',
  description: 'Tips, guides and news about American OnlyFans creators. Find advice on subscribing, discovering creators, and making the most of your experience.',
  alternates: { canonical: `${SITE_URL}/blog/` },
};

export default function BlogPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="page-container" style={{ paddingTop: '0.5rem', paddingBottom: '4rem' }}>
      <section className="hero-shell hero-shell--compact starfield">
        <div className="hero-shell-inner">
          <p className="eyebrow-pill">The Blog</p>
          <h1 className="display-h1">
            Guides &amp; <span className="gradient-accent">Insights</span>
          </h1>
          <p className="display-sub">
            Tips, guides and news about American OnlyFans creators — how to discover, subscribe, and find the best.
          </p>
        </div>
      </section>

      {posts.length === 0 ? (
        <div className="empty-state" style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
          <p>Blog posts coming soon — check back shortly.</p>
        </div>
      ) : (
        <>
          {featured && (
            <Link href={`/blog/${featured.slug}/`} className="blog-featured" style={{ textDecoration: 'none' }}>
              <div className="blog-featured-body">
                <p className="blog-featured-eyebrow">★ Featured Post</p>
                <h2 className="blog-featured-title gradient-accent" style={{ display: 'inline-block' }}>{featured.title}</h2>
                <p className="blog-featured-excerpt">{featured.description}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', fontWeight: 600 }}>
                  {new Date(featured.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · Read more →
                </p>
              </div>
              <div style={{ position: 'relative', zIndex: 2, minHeight: 200, background: 'radial-gradient(ellipse at 60% 40%, rgba(200,16,46,0.22), transparent 70%), radial-gradient(ellipse at 40% 60%, rgba(1,33,105,0.3), transparent 70%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '5rem', opacity: 0.4 }}>★</div>
            </Link>
          )}

          {rest.length > 0 && (
            <>
              <div className="section-rail">
                <h2 className="section-rail-title">More Posts</h2>
              </div>
              <div className="blog-grid">
                {rest.map(post => (
                  <Link key={post.slug} href={`/blog/${post.slug}/`} className="blog-card card-lift" style={{ textDecoration: 'none' }}>
                    <div className="blog-card-body">
                      <p className="blog-card-date">{new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                      <h2 className="blog-card-title">{post.title}</h2>
                      <p className="blog-card-desc">{post.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
