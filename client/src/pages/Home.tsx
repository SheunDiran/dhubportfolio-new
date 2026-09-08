import { useEffect, useState } from "react";
import { ArrowRight, ArrowUpRight, Braces, Database, ExternalLink, Expand, Gauge, Layers, Linkedin, Quote, SkipForward, X } from "lucide-react";
import SheunShell, { SheunFooter } from "@/components/SheunShell";

const face = "/manus-storage/WhatsAppImage2026-09-08at12.24.38AM_1f28b8d6.jpeg";
const techVisual = "/manus-storage/sheun-tech-visual-b_8b466ce8_7efd897b.jpg";
const heroLines = [
  "I build digital experiences that feel clear, useful and human. Then I teach other people how to build their own.",
  "I turn thoughtful ideas into products people can actually use and return to.",
  "I write code, shape systems, and make complicated things feel lighter.",
  "I build for today while leaving a better starting point for the next person.",
];

const loaderStages = [
  "Preparing the portfolio",
  "Loading the portrait",
  "Setting the signal",
  "Ready to explore",
];

export default function Home() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [entry, setEntry] = useState(false);
  const [portraitOpen, setPortraitOpen] = useState(false);
  const [heroLine, setHeroLine] = useState(0);

  useEffect(() => {
    const seen = sessionStorage.getItem("sheun-portfolio-entered") === "true";
    if (seen) {
      setLoading(false);
      return;
    }

    let frame = 0;
    const startedAt = performance.now();
    const duration = 950;
    const tick = (now: number) => {
      const nextProgress = Math.min(100, Math.round(((now - startedAt) / duration) * 100));
      setProgress(nextProgress);
      if (nextProgress < 100) {
        frame = requestAnimationFrame(tick);
      } else {
        setLoading(false);
        setEntry(true);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!portraitOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => { if (event.key === "Escape") setPortraitOpen(false); };
    document.addEventListener("keydown", closeOnEscape);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", closeOnEscape); document.body.style.overflow = ""; };
  }, [portraitOpen]);

  useEffect(() => {
    const timer = window.setInterval(() => setHeroLine((current) => (current + 1) % heroLines.length), 4200);
    return () => window.clearInterval(timer);
  }, []);

  function enter() {
    sessionStorage.setItem("sheun-portfolio-entered", "true");
    setEntry(false);
  }

  function skipIntro() {
    sessionStorage.setItem("sheun-portfolio-entered", "true");
    setProgress(100);
    setLoading(false);
    setEntry(false);
  }

  const stageIndex = Math.min(loaderStages.length - 1, Math.floor(progress / 34));

  return (
    <SheunShell active="home">
      <>
        {loading && (
          <div className="intro-loader" role="status" aria-live="polite">
            <div className="intro-loader-top"><span>SHEUN / 2026</span><span>LAGOS, NG</span></div>
            <div className="intro-loader-core">
              <div className="intro-loader-mark" aria-hidden="true">S</div>
              <p>{loaderStages[stageIndex]}</p>
              <div className="intro-loader-progress" aria-hidden="true"><i style={{ width: `${progress}%` }} /></div>
              <strong>{String(progress).padStart(3, "0")} %</strong>
            </div>
            <div className="intro-loader-bottom">
              <span>Loading only what you need</span>
              <button type="button" onClick={skipIntro}>Skip intro <SkipForward size={13} /></button>
            </div>
          </div>
        )}

        {entry && (
          <div className="intro-entry" role="dialog" aria-modal="true" aria-labelledby="intro-entry-title">
            <div className="intro-entry-orbit" aria-hidden="true"><span /><span /><span /></div>
            <div className="intro-entry-card">
              <span className="intro-entry-kicker">BEFORE WE BEGIN</span>
              <h1 id="intro-entry-title">Want to know<br /><em>Sheun?</em></h1>
              <p>Beyond the code: the person, the teaching, the community and the thinking behind the work.</p>
              <div className="intro-entry-actions">
                <button className="intro-entry-primary" type="button" onClick={enter}>Enter portfolio <ArrowRight size={15} /></button>
                <button className="intro-entry-secondary" type="button" onClick={skipIntro}>Explore first <SkipForward size={14} /></button>
              </div>
              <span className="intro-entry-note">You can always start with the work.</span>
            </div>
          </div>
        )}

        <main className="sheun-home">
          <section className="sheun-hero">
            <div className="sheun-hero-media">
              <button className="sheun-portrait-button" type="button" onClick={() => setPortraitOpen(true)} aria-label="Open Sheun's portrait">
                <span className="sheun-portrait-ring" aria-hidden="true" />
                <img src={face} alt="Oluwaseun Oyediran" />
                <span className="sheun-portrait-expand"><Expand size={14} /> Tap to view</span>
              </button>
              <div className="sheun-hero-coordinate">SHEUN / 001<br />LAGOS, NIGERIA</div>
            </div>
            <div className="sheun-hero-copy">
              <small>SOFTWARE ENGINEER / EDUCATOR / FOUNDER</small>
              <h1>Welcome to<br />my <span>Portfolio.</span></h1>
              <p>I am <b>OYEDIRAN SHEUN</b></p>
              <p className="sheun-hero-detail" key={heroLine}>{heroLines[heroLine]}</p>
              <div><a href="/projects.html">Explore my work <ArrowRight size={15} /></a><a href="/about.html">Know Sheun <ExternalLink size={14} /></a><a className="sheun-hero-connect" href="/contact.html">Hire/connect with Sheun <ArrowUpRight size={15} /></a></div>
            </div>
            <div className="sheun-hero-studio-panel" aria-label="Sheun's integrated practice">
              <div className="sheun-studio-topline"><span>SHEUN / FULL-STACK PRACTICE</span><span>LIVE PRACTICE</span></div>
              <div className="sheun-orbit-stage">
                <div className="sheun-orbit-ring sheun-orbit-ring-one" /><div className="sheun-orbit-ring sheun-orbit-ring-two" /><div className="sheun-orbit-core"><span>BUILD</span><span>THE</span><em>WHOLE</em><span>THING.</span></div>
                <div className="sheun-orbit-node sheun-node-interface"><Layers size={17} /><span>INTERFACE</span></div><div className="sheun-orbit-node sheun-node-logic"><Braces size={17} /><span>LOGIC</span></div><div className="sheun-orbit-node sheun-node-data"><Database size={17} /><span>DATA</span></div><div className="sheun-orbit-node sheun-node-operations"><Gauge size={17} /><span>OPERATIONS</span></div>
              </div>
              <div className="sheun-studio-metrics"><div><strong>30+</strong><span>developers trained</span></div><div><strong>05</strong><span>products shipped</span></div><div><strong>04</strong><span>systems profiled</span></div><div><strong>01</strong><span>integrated practice</span></div></div>
              <div className="sheun-studio-marquee"><div className="sheun-marquee-track"><span>STRATEGY</span><i>•</i><span>SYSTEM DESIGN</span><i>•</i><span>BUILD</span><i>•</i><span>OPERATE</span><i>•</i><span>STRATEGY</span><i>•</i><span>SYSTEM DESIGN</span><i>•</i><span>BUILD</span><i>•</i><span>OPERATE</span><i>•</i></div></div>
            </div>
          </section>
          <section className="sheun-home-index" aria-label="Explore the portfolio">
            <a href="/about.html"><small>01</small><h2>About Sheun</h2><p>The person behind the products, lessons and community work.</p><span>Read the story <ArrowRight size={14} /></span></a>
            <a href="/skills.html"><small>02</small><h2>My Skills</h2><p>Python, Flask, JavaScript, React, MySQL and the tools in between.</p><span>See the toolkit <ArrowRight size={14} /></span></a>
            <a href="/projects.html"><small>03</small><h2>Working Experience</h2><p>Real platforms, experiments and thoughtful problem-solving.</p><span>View selected work <ArrowRight size={14} /></span></a>
            <a href="/training.html"><small>04</small><h2>Training &amp; Speaking</h2><p>How the work extends beyond a screen and into other people.</p><span>Explore the practice <ArrowRight size={14} /></span></a>
          </section>
          <section className="sheun-hook-section">
            <div className="sheun-hook-intro"><span className="sheun-home-kicker">A LITTLE CONTEXT</span><h2>Good work should<br /><em>leave a mark.</em></h2><p>Not just a polished interface. A useful answer, a clearer next step, a learner who finally gets it.</p></div>
            <div className="sheun-hook-list"><article><Quote size={19} /><p>“The best products respect the person using them.”</p><span>01 / Product thinking</span></article><article><Quote size={19} /><p>“Every line of code can become someone else's starting point.”</p><span>02 / Teaching instinct</span></article><article><Quote size={19} /><p>“Build the thing people can actually return to.”</p><span>03 / Community mindset</span></article></div>
          </section>
          <section className="sheun-home-cta"><div className="sheun-cta-copy"><span className="sheun-home-kicker">THE SHORT VERSION</span><h2>Curious about<br /><em>the longer one?</em></h2><p>The work is only one layer. The longer story lives somewhere between building, learning, and helping good ideas find their feet.</p><div className="sheun-cta-links"><a href="/contact.html">Let's talk about it <ArrowUpRight size={16} /></a><a href="/resume.html">View resume <ExternalLink size={14} /></a><a href="https://www.linkedin.com/feed/" target="_blank" rel="noreferrer"><Linkedin size={14} /> LinkedIn</a></div></div><div className="sheun-cta-art"><img src={techVisual} alt="Laptop and green code reflections in a dark workspace" /><span>BUILD / LEARN / SHARE</span></div></section>
        </main>
        <SheunFooter />
        {portraitOpen && <div className="portrait-lightbox" role="dialog" aria-modal="true" aria-label="Full portrait of Oluwaseun Oyediran" onMouseDown={(event) => event.target === event.currentTarget && setPortraitOpen(false)}><button type="button" onClick={() => setPortraitOpen(false)} aria-label="Close portrait"><X size={21} /></button><img src={face} alt="Full portrait of Oluwaseun Oyediran" /><span>ESC TO CLOSE / SHEUN 001</span></div>}
      </>
    </SheunShell>
  );
}
