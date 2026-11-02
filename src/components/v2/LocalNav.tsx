// شريط المنتج اللاصق (مثل شريط «iPhone 17 Pro» في آبل): الاسم، روابط الصفحة، وزرّ «اطلب».
export default function LocalNav({ name, links }: { name: string; links: { label: string; href: string }[] }) {
  return (
    <nav className="v2-lnav" aria-label={name}>
      <div className="v2-wrap v2-lnav-in">
        <a href="#top" className="name">{name}</a>
        <div className="links">
          {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
          <a href="#buy" className="buy">اطلب</a>
        </div>
      </div>
    </nav>
  );
}
