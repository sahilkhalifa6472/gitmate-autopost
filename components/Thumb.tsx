import type { Item } from "@/lib/types";
import CoverVideo from "./CoverVideo";

// 9:16 preview of a reel: the video's own cover frame (the browser seeks to #t=cover).
// After posting the blob may be deleted, then a plain placeholder is shown.
export default function Thumb({ item, href }: { item: Item; href?: string }) {
  const has = item.video_url && !item.blob_deleted;
  const sec = Math.max(0.1, (item.cover_offset_ms || 0) / 1000);
  const inner = (
    <>
      {has ? <CoverVideo src={item.video_url} sec={sec} /> : <div className="ph0"><span className="bead">&gt;_</span></div>}
      <span className="play"><svg viewBox="0 0 10 10"><path d="M2 1l7 4-7 4z" fill="#fff" /></svg></span>
      {item.duration_sec ? <span className="dur">{Math.round(item.duration_sec)}s</span> : null}
    </>
  );
  const link = href || (has ? item.video_url : item.permalink);
  return link ? <a className="thumb" href={link} target="_blank" rel="noreferrer">{inner}</a> : <div className="thumb">{inner}</div>;
}
