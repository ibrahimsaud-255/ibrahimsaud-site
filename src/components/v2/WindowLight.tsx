// نقش الهويّة: ضوء نافذة أزرق مغبّش (من ستارة استوديو إبراهيم)
export default function WindowLight({ style }: { style: React.CSSProperties }) {
  return (
    <div className="v2-light" style={style} aria-hidden>
      <div><i /><i /><i /><i /><i /><i /></div>
    </div>
  );
}
