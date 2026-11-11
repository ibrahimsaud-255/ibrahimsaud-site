import type { Metadata } from "next";
import Link from "next/link";
import { share, SITE_URL } from "@/lib/share";
import "@/components/v2/v2.css";
import "./blog.css";
import Shell from "@/components/v2/Shell";
import Nav from "@/components/v2/Nav";
import Footer from "@/components/v2/Footer";
import { dateLabel, getPosts, getSettings, slugFor, topicOf, TOPIC_ORDER, TOPICS } from "@/lib/blog";

const meta = {
  title: "المدونة — إبراهيم سعود | الذكاء الاصطناعي والأنظمة والأعمال",
  description: "مقالات إبراهيم سعود عن الذكاء الاصطناعي في الأعمال، وأنظمة إدارة المنشآت والجمعيّات، وصناعة المحتوى — بلغة بسيطة ومن تجربة حقيقية.",
};

export const metadata: Metadata = {
  ...meta,
  ...share(meta, "/blog/"),
  alternates: { canonical: `${SITE_URL}/blog/`, types: { "application/rss+xml": `${SITE_URL}/blog/feed.xml` } },
};

export default async function BlogIndex() {
  const [posts, s] = await Promise.all([getPosts(), getSettings()]);

  // الروابط القديمة (/blog/?id=…) المنتشرة في الرسائل والقائمة البريدية → رابط المقال الجديد.
  const legacy = Object.fromEntries(posts.map((p) => [p.id, `/blog/${slugFor(p)}/`]));
  const redirect = `(function(){var m=${JSON.stringify(legacy)};var id=new URLSearchParams(location.search).get('id');if(id&&m[id])location.replace(m[id]);})();`;

  const groups = TOPIC_ORDER.map((key) => ({ key, posts: posts.filter((p) => topicOf(p) === key) })).filter((g) => g.posts.length);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/blog/#blog`,
    name: "مدونة إبراهيم سعود",
    url: `${SITE_URL}/blog/`,
    inLanguage: "ar",
    author: { "@id": `${SITE_URL}/#ibrahim` },
    blogPost: posts.map((p) => ({ "@type": "BlogPosting", headline: p.title, url: `${SITE_URL}/blog/${slugFor(p)}/`, datePublished: p.published_at })),
  };

  return (
    <Shell>
      <script dangerouslySetInnerHTML={{ __html: redirect }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Nav />
      <main className="bl-wrap">
        <header className="bl-intro">
          <p className="bl-kicker">المدونة</p>
          <h1>أكتب عن اللي أشتغل عليه.</h1>
          <p>{s.author_name} — أدلّة عمليّة عن أنظمة إدارة المنشآت والجمعيّات، والذكاء الاصطناعي في العمل، والإعلانات وصناعة المحتوى.</p>
        </header>
        {posts.length === 0 ? (
          <p className="bl-empty">لا توجد مقالات منشورة بعد.</p>
        ) : (
          <>
            <nav className="bl-topics" aria-label="أقسام المدونة">
              {groups.map((g) => <a key={g.key} href={`#${g.key}`}>{TOPICS[g.key].name} ({g.posts.length})</a>)}
            </nav>
            {groups.map((g) => (
              <section key={g.key} id={g.key} className="bl-topic">
                <h2>{TOPICS[g.key].name}</h2>
                {g.key !== "journal" ? <p>وكلّ اللي هنا أقدّمه فعلاً: <Link href={TOPICS[g.key].cta.href}>{TOPICS[g.key].cta.label}</Link></p> : null}
                <ul className="bl-list bl-grid">
                  {g.posts.map((p) => (
                    <li key={p.id}>
                      <Link className="bl-card" href={`/blog/${slugFor(p)}/`}>
                        {p.cover_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img className="bl-cover" src={p.cover_url} alt="" loading="lazy" />
                        ) : null}
                        <div className="bl-card-body">
                          <h3>{p.title}</h3>
                          {p.excerpt ? <p className="bl-ex">{p.excerpt}</p> : null}
                          <p className="bl-date"><time dateTime={p.published_at}>{dateLabel(p)}</time>{p.reading_min ? ` · ${p.reading_min} د قراءة` : ""}</p>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </>
        )}
      </main>
      <Footer />
    </Shell>
  );
}
