// شعارات المنصّات وبطاقاتها لمنتجات البرامج في المتجر (ويندوز، ماك، أندرويد، آيفون).
// الشعار يعرّف النظام بنظرة — نفس فكرة صفحة تحميل حروف ودروس.
import type { ShopItem } from "@/lib/shop";
import { shopT } from "@/lib/shopUi";

type Key = "windows" | "mac" | "android" | "ios";

const PATHS: Record<Key, string> = {
  windows: "M0 0h11.377v11.372H0zM12.623 0H24v11.372H12.623zM0 12.623h11.377V24H0zM12.623 12.623H24V24H12.623z",
  mac: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
  ios: "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701",
  // روبوت أندرويد (رأس)
  android: "M17.6 9.48l1.84-3.18c.16-.31.04-.69-.26-.85-.29-.15-.65-.06-.83.22l-1.88 3.24A11.4 11.4 0 0 0 12 8c-1.6 0-3.12.33-4.47.91L5.65 5.67a.643.643 0 0 0-.87-.2c-.28.18-.37.54-.22.83L6.4 9.48A10.78 10.78 0 0 0 1 18h22a10.78 10.78 0 0 0-5.4-8.52zM7 15.25a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5zm10 0a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5z",
};
const BG: Record<Key, string> = { windows: "#0078D4", mac: "#1D1D1F", ios: "#1D1D1F", android: "#3DDC84" };

export function PlatformLogo({ k, size = 22 }: { k: Key; size?: number }) {
  return (
    <span className="v2-plat-logo" style={{ background: BG[k] }} aria-hidden>
      <svg viewBox="0 0 24 24" width={size} height={size} fill={k === "android" ? "#0B3B22" : "#fff"}><path d={PATHS[k]} fillRule="evenodd" /></svg>
    </span>
  );
}

export function PlatformCards({ item }: { item: ShopItem }) {
  if (!item.platforms) return null;
  const incl = item.platforms.filter((p) => !p.href), ext = item.platforms.filter((p) => p.href);
  // مجموعتان واضحتان: ما يشمله الشراء من هنا، وما يُشترى منفصلاً (الآيفون من App Store)
  if (incl.length && ext.length) {
    return (
      <div className="v2-plat-split">
        <div className="v2-plat-incl">
          {item.platCaptions && <p className="cap">{item.platCaptions.incl}</p>}
          <PlatformList item={item} list={incl} />
        </div>
        <div className="v2-plat-ext">
          {item.platCaptions && <p className="cap">{item.platCaptions.sep}</p>}
          <PlatformList item={item} list={ext} />
        </div>
      </div>
    );
  }
  return <PlatformList item={item} list={item.platforms} />;
}

function PlatformList({ item, list }: { item: ShopItem; list: NonNullable<ShopItem["platforms"]> }) {
  return (
    <div className="v2-plat-grid">
      {list.map((p) => (
        p.href ? (
          // متوفّر من متجر خارجيّ (آيفون من App Store) — البطاقة كلّها رابط
          <a key={p.key} className="v2-plat" href={p.href} target="_blank" rel="noopener">
            <PlatformLogo k={p.key} size={26} />
            <h3>{p.name}</h3>
            <p>{p.note}</p>
            <span className="tag">{p.hrefLabel} ↗</span>
          </a>
        ) : (
        <div key={p.key} className={"v2-plat" + (p.soon ? " soon" : "")}>
          <PlatformLogo k={p.key} size={26} />
          <h3>{p.name}</h3>
          <p>{p.note}</p>
          <span className="tag">{p.soon || shopT(item.lang).availableNow}</span>
        </div>
        )
      ))}
    </div>
  );
}

/** أيقونة الملفّ في صفحة الطلب حسب معرّفه (win / mac / android) */
export function fileKey(id: string): Key | null {
  if (/^win/.test(id)) return "windows";
  if (/^mac/.test(id)) return "mac";
  if (/^(android|apk)/.test(id)) return "android";
  return null;
}
