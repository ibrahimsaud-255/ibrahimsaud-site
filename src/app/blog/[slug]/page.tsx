import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { OG_IMAGE, SITE_URL } from "@/lib/share";
import "@/components/v2/v2.css";
import "../blog.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import Footer from "@/components/v2/Footer";
import { bookHref } from "@/lib/v2";
import { dateLabel, faqsOf, getPost, getPosts, getSettings, plain, postUrl, related, sanitize, slugFor, topicOf, TOPICS } from "@/lib/blog";

// كلّ مقال منشور = صفحة ثابتة؛ أيّ رابط غيرها يطلع 404.
export const dynamicParams = false;

export async function generateStaticParams() {
  return (await getPosts()).map((p) => ({ slug: slugFor(p) }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const p = await getPost(slug);
  if (!p) return {};
  const url = postUrl(p);
  const description = (p.excerpt || plain(p.body_html)).slice(0, 160);
  const images = p.cover_url ? [{ url: p.cover_url, alt: p.title }] : [OG_IMAGE];
  return {
    title: `${p.title} — إبراهيم سعود`,
    description,
    alternates: { canonical: url },
    authors: [{ name: "إبراهيم سعود", url: SITE_URL }],
    openGraph: { type: "article", title: p.title, description, url, siteName: "إبراهيم سعود", locale: "ar_SA", publishedTime: p.published_at, authors: [SITE_URL], images },
    twitter: { card: "summary_large_image", title: p.title, description, images: images.map((i) => i.url) },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const [p, all, s] = await Promise.all([getPost(slug), getPosts(), getSettings()]);
  if (!p) notFound();

  const url = postUrl(p);
  const body = sanitize(p.body_html);
  const more = related(p, all, 4);
  const topic = TOPICS[topicOf(p)];
  const faqs = faqsOf(p.body_html);

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        "@id": `${url}#post`,
        headline: p.title,
        description: p.excerpt || plain(p.body_html).slice(0, 160),
        url,
        mainEntityOfPage: url,
        inLanguage: "ar",
        datePublished: p.published_at,
        dateModified: p.published_at,
        wordCount: plain(p.body_html).split(" ").length,
        image: p.cover_url || OG_IMAGE.url,
        author: { "@type": "Person", "@id": `${SITE_URL}/#ibrahim`, name: "إبراهيم سعود", url: SITE_URL },
        publisher: { "@type": "Person", "@id": `${SITE_URL}/#ibrahim` },
        isPartOf: { "@id": `${SITE_URL}/blog/#blog` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "إبراهيم سعود", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "المدونة", item: `${SITE_URL}/blog/` },
          { "@type": "ListItem", position: 3, name: p.title, item: url },
        ],
      },
      ...(faqs.length
        ? [{ "@type": "FAQPage", "@id": `${url}#faq`, mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })) }]
        : []),
    ],
  };

  return (
    <Shell>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main className="bl-wrap">
        <nav className="bl-crumbs" aria-label="مسار الصفحة"><Link href="/">الرئيسية</Link> <span>›</span> <Link href="/blog/">المدونة</Link> <span>›</span> <Link href={`/blog/#${topicOf(p)}`}>{topic.name}</Link></nav>
        <article className="bl-article">
          <h1>{p.title}</h1>
          <div className="bl-meta">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {s.author_avatar_url ? <img src={s.author_avatar_url} alt={s.author_name} /> : null}
            <div>
              <div className="who">{s.author_name}</div>
              <div className="when">
                <time dateTime={p.published_at}>{dateLabel(p)}</time>
                {p.hijri_date ? ` · ${p.hijri_date} هـ` : ""} · {p.reading_min || 1} د قراءة
              </div>
            </div>
          </div>
          {p.cover_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img className="bl-hero" src={p.cover_url} alt={p.title} />
          ) : null}
          <div className="bl-content" dangerouslySetInnerHTML={{ __html: body }} />
        </article>

        {/* ربط داخليّ: كلّ مقال يودّي للخدمات — يفيد القارئ وجوجل معاً */}
        <aside className="bl-cta">
          <h2>{topic.cta.title}</h2>
          <p>{topic.cta.text}</p>
          <div className="bl-cta-links">
            <Link className="v2-btn v2-btn-primary" href={topic.cta.href}>{topic.cta.label}</Link>
            <a className="v2-btn v2-btn-ghost" href={bookHref} target="_blank" rel="noopener">مكالمة تعارف مجّانيّة</a>
          </div>
        </aside>

        {more.length ? (
          <section className="bl-more">
            <h2>اقرأ أيضاً</h2>
            <ul className="bl-list">
              {more.map((m) => (
                <li key={m.id}>
                  <Link className="bl-card" href={`/blog/${slugFor(m)}/`}>
                    <div className="bl-card-body">
                      <h3>{m.title}</h3>
                      {m.excerpt ? <p className="bl-ex">{m.excerpt}</p> : null}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
      <Footer />
    </Shell>
  );
}
