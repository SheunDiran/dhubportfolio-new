import { useState } from "react";
import { ArrowLeft, X } from "lucide-react";

const designs = [
  ["Praise Tent Logo Design", "/manus-storage/praise-tent-2_d138656a.jpg", "A modern logo design that embodies growth, stability, and innovation for a mission-driven enterprise."],
  ["Praise Tent Campaign Flyer", "/manus-storage/relaunch_0c2f3aa9.jpg", "A promotional flyer that captures the essence of the 45-Day Relaunch Campaign with a strong call-to-action and visual appeal."],
  ["Graduation Ceremony", "/manus-storage/bgp_8b11fde0.jpeg", "A celebratory design for a graduation ceremony."],
  ["House Fellowship", "/manus-storage/fellowship_d7cfddf9.jpeg", "A branding package that creates a sense of community and belonging for a house fellowship."],
  ["Announcement", "/manus-storage/announcement_4c31428c.jpeg", "A design that grabs attention and effectively communicates the message."],
  ["Thanksgiving Poster Design", "/manus-storage/thanksgiving_ff3a5ee2.jpeg", "A poster design that captures the spirit of gratitude and community, perfect for a Thanksgiving event."],
] as const;

export default function Graphics() {
  const [selected, setSelected] = useState<(typeof designs)[number] | null>(null);
  return <div className="graphics-page"><header><a href="/" className="graphics-brand">SHEUN</a><a href="/" className="graphics-back"><ArrowLeft size={16} /> Back to Portfolio</a></header><main><h1>MY DESIGNS</h1><p className="graphics-subtitle">A collection of my graphic design work and visual explorations.</p><div className="graphics-grid">{designs.map((design) => <article className="graphics-item" key={design[0]}><img src={design[1]} alt={design[0]} /><div className="graphics-info"><h2>{design[0]}</h2><button onClick={() => setSelected(design)}>View Details</button></div></article>)}</div></main>{selected && <div className="graphics-modal" onClick={() => setSelected(null)}><div onClick={(event) => event.stopPropagation()}><button className="graphics-close" onClick={() => setSelected(null)}><X /></button><h2>{selected[0]}</h2><img src={selected[1]} alt={selected[0]} /><p>{selected[2]}</p></div></div>}</div>;
}
