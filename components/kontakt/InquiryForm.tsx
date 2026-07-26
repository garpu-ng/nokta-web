"use client";

import { useState } from "react";
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
  fallback: string;
};

type State = "idle" | "sending" | "sent" | "error";

const EMPTY = { name: "", email: "", message: "" };

export default function InquiryForm({ copy }: { copy: Copy }) {
  const [kind, setKind] = useState(copy.kinds[0].id);
  const [fields, setFields] = useState(EMPTY);
  const [state, setState] = useState<State>("idle");

  function reset() {
    setKind(copy.kinds[0].id);
    setFields(EMPTY);
    setState("idle");
  }

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // The honeypot is read off the DOM at send time, never from state: the
    // field is uncontrolled on purpose, so something filling every input it
    // can find fills this one too. A real browser sends it empty. (Sending a
    // literal "" here would blind the server's check to exactly the bots the
    // field exists to catch.)
    const website =
      (event.currentTarget.elements.namedItem("website") as HTMLInputElement | null)
        ?.value ?? "";
    setState("sending");
    try {
      const response = await fetch("/api/kontakt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, ...fields, website }),
      });
      setState(response.ok ? "sent" : "error");
    } catch {
      setState("error");
    }
  }

  /* The panel that replaces the form once it has been sent. aria-live so the
     change is announced — the form vanishing is otherwise silent to anyone
     not watching that part of the page. */
  if (state === "sent") {
    return (
      <div className={styles.panel} role="status" aria-live="polite">
        <span className={styles.disc} aria-hidden="true" />
        <h2 className={styles.panelTitle}>{copy.doneTitle}</h2>
        <p className={styles.panelBody}>{copy.doneBody}</p>
        <button type="button" className={styles.ghost} onClick={reset}>
          {copy.again}
        </button>
      </div>
    );
  }

  const sending = state === "sending";

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
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
                className={styles.chipInput}
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
          <span className={styles.hidden}>{copy.name}</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            placeholder={copy.name}
            value={fields.name}
            onChange={(e) => setFields({ ...fields, name: e.target.value })}
            className={styles.input}
          />
        </label>
        <label className={styles.underline}>
          <span className={styles.hidden}>{copy.email}</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            placeholder={copy.email}
            value={fields.email}
            onChange={(e) => setFields({ ...fields, email: e.target.value })}
            className={styles.input}
          />
        </label>
      </div>

      {/* ── 03 · the point we start from ──────────────────────────── */}
      <p className={styles.step}>{copy.step3}</p>
      <label>
        <span className={styles.hidden}>{copy.step3}</span>
        <textarea
          name="message"
          rows={5}
          required
          placeholder={copy.message}
          value={fields.message}
          onChange={(e) => setFields({ ...fields, message: e.target.value })}
          className={styles.textarea}
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

      {/* The error wears the success panel's language — an accent rule and a
          mono line — so a failure reads as part of the sheet rather than as a
          browser alert. It names the studio address, which is the answer. */}
      {state === "error" ? (
        <p className={styles.error} role="alert" aria-live="polite">
          {copy.error}
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
