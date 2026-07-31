"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./InquiryForm.module.css";

/* The inquiry form — three numbered steps, and the only real client state on
   the site: what the project is, who is writing, and the point we start from.

   Every string arrives as a prop; the form never reaches for a dictionary
   itself. The chip row is a real radio group (a fieldset of visually-hidden
   inputs behind their labels), so it is operable by keyboard and announced as
   a group — the chips are styling on top of a control, not a control made of
   divs. */

/* A chip: the stable id the route validates against, and the translated word
   the reader actually sees. The two are kept apart on purpose — the route
   cannot whitelist display text without rejecting every non-German visitor. */
export type Kind = { id: string; label: string };

type Copy = {
  step1: string;
  step2: string;
  step3: string;
  kinds: Kind[];
  name: string;
  email: string;
  message: string;
  submit: string;
  sending: string;
  sla: string;
  doneTitle: string;
  doneBody: string;
  again: string;
  error: string;
  errorFields: string;
  errorBusy: string;
  fallback: string;
};

type State = "idle" | "sending" | "sent";
/** Which answer the reader is owed. The three are NOT interchangeable: one is
    their typo, one is our rate limit, one is our delivery failing — and the
    last is the only one where writing to the studio directly is the advice. */
type Trouble = null | "fields" | "busy" | "send";

const EMPTY = { name: "", email: "", message: "" };

/* Same shape the route validates with, kept deliberately loose: the only real
   proof an address works is a reply arriving at it. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function badFields(f: typeof EMPTY) {
  return {
    name: f.name.trim() === "",
    email: !EMAIL.test(f.email.trim()),
    message: f.message.trim() === "",
  };
}

export default function InquiryForm({ copy }: { copy: Copy }) {
  const [kind, setKind] = useState(copy.kinds[0].id);
  const [fields, setFields] = useState(EMPTY);
  const [state, setState] = useState<State>("idle");
  const [trouble, setTrouble] = useState<Trouble>(null);
  /** Only marked once they have actually tried to send — nothing is red while
      they are still filling the form in. */
  const [bad, setBad] = useState({ name: false, email: false, message: false });

  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);

  /* The success panel replaces the form, which unmounts the button the reader
     just pressed and drops focus to <body>. Move it to the panel's heading so
     the keyboard stays where the page went. */
  useEffect(() => {
    if (state === "sent") doneRef.current?.focus();
  }, [state]);

  function reset() {
    setKind(copy.kinds[0].id);
    setFields(EMPTY);
    setState("idle");
    setTrouble(null);
    setBad({ name: false, email: false, message: false });
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    /* Checked here rather than left to the browser: the form is noValidate, so
       `required` alone would never speak, and a 422 came back as "that didn't
       work" — the site sounding broken when the address simply had a typo. */
    const invalid = badFields(fields);
    if (invalid.name || invalid.email || invalid.message) {
      setBad(invalid);
      setTrouble("fields");
      const firstBad = (["name", "email", "message"] as const).find((k) => invalid[k]);
      const el = formRef.current?.elements.namedItem(firstBad ?? "name");
      if (el instanceof HTMLElement) el.focus();
      return;
    }
    setBad({ name: false, email: false, message: false });

    // The honeypot is read off the DOM at send time, never from state: the
    // field is uncontrolled on purpose, so something filling every input it
    // can find fills this one too. A real browser sends it empty. (Sending a
    // literal "" here would blind the server's check to exactly the bots the
    // field exists to catch.)
    const website =
      (event.currentTarget.elements.namedItem("website") as HTMLInputElement | null)
        ?.value ?? "";
    setState("sending");
    setTrouble(null);
    try {
      const response = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, ...fields, website }),
      });
      if (response.ok) {
        setState("sent");
        return;
      }
      setState("idle");
      // 429 is ours to explain, 422 means the server disagreed with a field,
      // anything else is delivery — and only that one names the address.
      setTrouble(response.status === 429 ? "busy" : response.status === 422 ? "fields" : "send");
    } catch {
      setState("idle");
      setTrouble("send");
    }
  }

  const troubleText =
    trouble === "fields" ? copy.errorFields : trouble === "busy" ? copy.errorBusy : copy.error;

  /* The panel that replaces the form once it has been sent. aria-live so the
     change is announced — the form vanishing is otherwise silent to anyone
     not watching that part of the page. */
  if (state === "sent") {
    return (
      <div className={styles.panel} role="status" aria-live="polite">
        <span className={styles.disc} aria-hidden="true" />
        {/* tabIndex -1 so the effect above can put focus here. It is not in the
            tab order; it is only ever focused programmatically. */}
        <h2 className={styles.panelTitle} tabIndex={-1} ref={doneRef}>
          {copy.doneTitle}
        </h2>
        <p className={styles.panelBody}>{copy.doneBody}</p>
        <button type="button" className={styles.ghost} onClick={reset}>
          {copy.again}
        </button>
      </div>
    );
  }

  const sending = state === "sending";

  return (
    <form className={styles.form} onSubmit={submit} noValidate ref={formRef}>
      {/* ── 01 · what it is about ─────────────────────────────────── */}
      <fieldset className={styles.fieldset}>
        <legend className={styles.step}>{copy.step1}</legend>
        <div className={styles.chips}>
          {copy.kinds.map(({ id, label }) => (
            <label key={id} className={styles.chip}>
              <input
                type="radio"
                name="kind"
                value={id}
                checked={kind === id}
                onChange={() => setKind(id)}
                className={`nk-sr-only ${styles.chipInput}`}
              />
              <span className={styles.chipLabel}>{label}</span>
              {/* The selected frame is drawn inset by a pixel over the chip's
                  own border rather than thickening it, so choosing a chip
                  never nudges the row. The frame is a second signal beside
                  the colour — red alone would not carry the state. */}
              {kind === id ? (
                <span className={styles.chipFrame} aria-hidden="true" />
              ) : null}
            </label>
          ))}
        </div>
      </fieldset>

      {/* ── 02 · who is writing ───────────────────────────────────── */}
      <p className={styles.step}>{copy.step2}</p>
      <div className={styles.pair}>
        <label className={styles.underline}>
          <span className="nk-sr-only">{copy.name}</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            placeholder={copy.name}
            value={fields.name}
            onChange={(e) => setFields({ ...fields, name: e.target.value })}
            className={styles.input}
            aria-invalid={bad.name || undefined}
            aria-describedby={trouble ? "nk-form-trouble" : undefined}
          />
        </label>
        <label className={styles.underline}>
          <span className="nk-sr-only">{copy.email}</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder={copy.email}
            value={fields.email}
            onChange={(e) => setFields({ ...fields, email: e.target.value })}
            className={styles.input}
            aria-invalid={bad.email || undefined}
            aria-describedby={trouble ? "nk-form-trouble" : undefined}
          />
        </label>
      </div>

      {/* ── 03 · the point we start from ──────────────────────────── */}
      <p className={styles.step}>{copy.step3}</p>
      <label>
        <span className="nk-sr-only">{copy.step3}</span>
        <textarea
          name="message"
          rows={5}
          required
          placeholder={copy.message}
          value={fields.message}
          onChange={(e) => setFields({ ...fields, message: e.target.value })}
          className={styles.textarea}
          aria-invalid={bad.message || undefined}
          aria-describedby={trouble ? "nk-form-trouble" : undefined}
        />
      </label>

      {/* Off-screen and out of the tab order, but a real field in the markup —
          see the route's honeypot note. */}
      <input
        type="text"
        name="website"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className={styles.honeypot}
      />

      <div className={styles.submitRow}>
        <button type="submit" className={styles.submit} disabled={sending}>
          {sending ? copy.sending : copy.submit}
          <span aria-hidden="true"> ↗</span>
        </button>
        <span className={styles.sla}>{copy.sla}</span>
      </div>

      {/* The trouble line wears the success panel's language — an accent rule
          and a mono line — so a failure reads as part of the sheet rather than
          as a browser alert. Only the delivery case names the studio address,
          because only there is writing directly the actual answer.

          role="alert" alone: it already implies an assertive live region, and
          pairing it with aria-live="polite" asked two different things of the
          screen reader at once. */}
      {trouble ? (
        <p className={styles.error} id="nk-form-trouble" role="alert">
          {troubleText}
        </p>
      ) : null}

      {/* Without JS the form cannot post, so it says so and offers the address
          instead of failing silently. */}
      <noscript>
        <p className={styles.error}>{copy.fallback}</p>
      </noscript>
    </form>
  );
}
