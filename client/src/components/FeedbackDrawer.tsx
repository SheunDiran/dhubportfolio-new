import { FormEvent, useEffect, useState } from "react";
import { ArrowUpRight, Check, MessageSquare, X } from "lucide-react";
import { Link } from "wouter";

const OWNER_EMAIL = "oluwaseunoyediran641@gmail.com";

export default function FeedbackDrawer() {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState("Something feels off");
  const [message, setMessage] = useState("");
  const [contact, setContact] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  function startFeedback() {
    setSent(false);
    setOpen(true);
  }

  function submitFeedback(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const subject = encodeURIComponent(`Portfolio feedback: ${category}`);
    const body = encodeURIComponent(
      `${message.trim()}\n\n${contact.trim() ? `Reply to: ${contact.trim()}` : "No reply details included."}`,
    );
    window.location.href = `mailto:${OWNER_EMAIL}?subject=${subject}&body=${body}`;
    setSent(true);
  }

  return (
    <>
      <button className="feedback-trigger" type="button" onClick={startFeedback} aria-haspopup="dialog">
        <MessageSquare size={15} />
        <span>Share feedback</span>
      </button>

      {open && (
        <div className="feedback-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setOpen(false)}>
          <section className="feedback-panel" role="dialog" aria-modal="true" aria-labelledby="feedback-title">
            <button className="feedback-close" type="button" onClick={() => setOpen(false)} aria-label="Close feedback panel">
              <X size={19} />
            </button>
            <div className="feedback-panel-heading">
              <span className="feedback-kicker">SITE CHECK / 2026</span>
              <span className="feedback-status"><i /> Open to notes</span>
            </div>
            {sent ? (
              <div className="feedback-success">
                <div className="feedback-success-icon"><Check size={22} /></div>
                <span className="feedback-kicker">DRAFT READY</span>
                <h2>Thanks for the<br /><em>honest note.</em></h2>
                <p>Your email app should have opened with the feedback filled in. If it did not, send the note directly to {OWNER_EMAIL}.</p>
                <button className="feedback-secondary-button" type="button" onClick={() => { setSent(false); setMessage(""); setContact(""); }}>
                  Add another note <ArrowUpRight size={15} />
                </button>
              </div>
            ) : (
              <>
                <span className="feedback-kicker">A BETTER SITE STARTS WITH BETTER NOTES</span>
                <h2 id="feedback-title">What should<br /><em>change?</em></h2>
                <p className="feedback-intro">Found a broken interaction, unclear copy or something that simply does not feel right? Leave a specific note and it will open as a ready-to-send email.</p>
                <form className="feedback-form" onSubmit={submitFeedback}>
                  <label>Note type
                    <select value={category} onChange={(event) => setCategory(event.target.value)}>
                      <option>Something feels off</option>
                      <option>Broken interaction</option>
                      <option>Copy or information</option>
                      <option>Accessibility issue</option>
                      <option>New idea</option>
                    </select>
                  </label>
                  <label>What did you notice?
                    <textarea required minLength={8} rows={5} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Tell Sheun what happened, and where it happened…" />
                  </label>
                  <label>How can Sheun follow up? <span>optional</span>
                    <input type="text" value={contact} onChange={(event) => setContact(event.target.value)} placeholder="Email, WhatsApp or leave blank" />
                  </label>
                  <button className="feedback-submit" type="submit">Open email draft <ArrowUpRight size={15} /></button>
                </form>
                <div className="feedback-panel-footer">
                  <span>Your note stays in your email app.</span>
                  <Link href="/admin" onClick={() => setOpen(false)}>Owner? Edit the archive <ArrowUpRight size={13} /></Link>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </>
  );
}
