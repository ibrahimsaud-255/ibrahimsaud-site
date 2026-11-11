// «اقرأ أكثر» في صفحات الخدمات: مقالات القسم المنشورة من المدوّنة (تُقرأ وقت البناء).
// ربط داخليّ يفيد جوجل (الصفحة ومقالاتها يقوّون بعض) ويفيد الزائر المتردّد.
import Link from "next/link";
import { getPosts, slugFor, topicOf, type TopicKey } from "@/lib/blog";

export default async function BlogLinks({ topic, first = [], max = 6, alt = false }: { topic: TopicKey; first?: string[]; max?: number; alt?: boolean }) {
  let posts;
  try {
    posts = (await getPosts()).filter((p) => topicOf(p) === topic);
  } catch {
    return null;
  }
  const rank = (slug: string) => (first.includes(slug) ? first.indexOf(slug) : first.length);
  const list = posts.sort((a, b) => rank(slugFor(a)) - rank(slugFor(b))).slice(0, max);
  if (!list.length) return null;
  return (
    <section className={`v2-sec${alt ? " alt" : ""}`} id="read">
      <div className="v2-wrap">
        <div className="v2-head" data-rise>
          <h2>اقرأ قبل لا تقرّر.</h2>
          <p>أدلّة كتبتها من شغلي، تجاوب على الأسئلة اللي تجيني كلّ يوم.</p>
        </div>
        <ul className="v2-reads" data-rise>
          {list.map((p) => (
            <li key={p.id}>
              <Link href={`/blog/${slugFor(p)}/`}>
                <b>{p.title}</b>
                {p.excerpt ? <span>{p.excerpt}</span> : null}
              </Link>
            </li>
          ))}
        </ul>
        <p className="v2-reads-all" data-rise><Link href={`/blog/#${topic}`}>كلّ المقالات <span className="chev">‹</span></Link></p>
      </div>
    </section>
  );
}
