"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import {
  ACCEPT,
  EMAIL,
  MAX_FILES,
  MAX_TOTAL_BYTES,
  allowedName,
  checkFiles,
  type FileProblem,
} from "@/lib/inquiry";
import styles from "./InquiryForm.module.css";

/* The inquiry form — three numbered steps, and the only real client state on
   the site: what the project is, who is writing, and the point we start from.

   Every string arrives as a prop; the form never reaches for a dictionary
   itself. The chip row is a real radio group (a fieldset of visually-hidden
   inputs behind their labels), so it is operable by keyboard and announced as
   a group — the chips are styling on top of a control, not a control made of
   divs.

   Attachments are optional and travel with the inquiry as multipart form
   data. The limits are lib/inquiry.ts's, the same ones the route enforces;
   checking them here only means the reader hears about a wrong file at once
   rather than after the upload. */

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
  /** the visible label over the message field */
  messageLabel: string;
  /** the example text inside it */
  message: string;
  files: {
    label: string;
    choose: string;
    hint: string;
    remove: string;
    total: string;
    refused: string;
    errorType: string;
    errorEmpty: string;
    errorCount: string;
    errorSize: string;
    errorServer: string;
  };
  privacy: string;
  privacyLink: string;
  privacyAfter: string;
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
/** A problem with the attachments, told on its own line beside the field.
    "server" is the route refusing a file the browser let through (its first
    bytes did not match its name, say). */
type FileTrouble = null | { problem: FileProblem | "server"; names: string[] };

const EMPTY = { name: "", email: "", message: "" };

/** "1,2 MB" or "340 KB", in the reader's own number format. */
function size(bytes: number, locale: string): string {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024)).toLocaleString(locale)} KB`;
  }
  const mb = bytes / (1024 * 1024);
  return `${mb.toLocaleString(locale, { maximumFractionDigits: 1 })} MB`;
}

/** The same file picked twice is one file. */
const sameFile = (a: File, b: File) =>
  a.name === b.name && a.size === b.size && a.lastModified === b.lastModified;

function badFields(f: typeof EMPTY) {
  return {
    name: f.name.trim() === "",
    email: !EMAIL.test(f.email.trim()),
    message: f.message.trim() === "",
  };
}

export default function InquiryForm({
  copy,
  initialKind,
  locale,
}: {
  copy: Copy;
  /** the chip to start on (from ?kind= on /kontakt); defaults to the first */
  initialKind?: string;
  /** for the file sizes' number format */
  locale: string;
}) {
  const [kind, setKind] = useState(initialKind ?? copy.kinds[0].id);
  const [fields, setFields] = useState(EMPTY);
  const [state, setState] = useState<State>("idle");
  const [trouble, setTrouble] = useState<Trouble>(null);
  /** Only marked once they have actually tried to send — nothing is red while
      they are still filling the form in. */
  const [bad, setBad] = useState({ name: false, email: false, message: false });
  const [files, setFiles] = useState<File[]>([]);
  const [fileTrouble, setFileTrouble] = useState<FileTrouble>(null);

  const formRef = useRef<HTMLFormElement>(null);
  const doneRef = useRef<HTMLHeadingElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const id = useId();

  /* The success panel replaces the form, which unmounts the button the reader
     just pressed and drops focus to <body>. Move it to the panel's heading so
     the keyboard stays where the page went. */
  useEffect(() => {
    if (state === "sent") doneRef.current?.focus();
  }, [state]);

  function reset() {
    setKind(initialKind ?? copy.kinds[0].id);
    setFields(EMPTY);
    setState("idle");
    setTrouble(null);
    setBad({ name: false, email: false, message: false });
    setFiles([]);
    setFileTrouble(null);
  }

  /* A new choice is added to the list, not swapped for it, so plans picked
     from two folders both arrive. Files that would break a limit are left
     out and named; the rest are kept. */
  function addFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    // Emptied at once: the list below is the state, and an emptied input lets
    // the same file be picked again after it was removed.
    event.target.value = "";
    if (picked.length === 0) return;

    const next = [...files];
    let problem: FileProblem | null = null;
    const refused: string[] = [];
    for (const file of picked) {
      if (next.some((f) => sameFile(f, file))) continue;
      const fault = !allowedName(file.name) ? "type" : checkFiles([...next, file]);
      if (fault) {
        // The first kind of fault is the one the line explains.
        problem ??= fault;
        refused.push(file.name);
      } else {
        next.push(file);
      }
    }
    setFiles(next);
    setFileTrouble(problem ? { problem, names: refused } : null);
  }

  function removeFile(index: number) {
    setFiles(files.filter((_, i) => i !== index));
    setFileTrouble(null);
    /* The button just pressed is about to go. Focus moves to the row that
       takes its place, or back to the picker when the list is empty. */
    requestAnimationFrame(() => {
      const buttons = listRef.current?.querySelectorAll("button");
      const target = buttons?.[Math.min(index, buttons.length - 1)] ?? fileRef.current;
      target?.focus();
    });
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

    // Sent as multipart form data so the files can travel with it. No
    // Content-Type header: the browser sets it, boundary included.
    const body = new FormData();
    body.append("kind", kind);
    body.append("name", fields.name);
    body.append("email", fields.email);
    body.append("message", fields.message);
    body.append("website", website);
    for (const file of files) body.append("files", file);

    setState("sending");
    setTrouble(null);
    setFileTrouble(null);
    try {
      const response = await fetch("/api/kontakt", { method: "POST", body });
      if (response.ok) {
        setState("sent");
        return;
      }
      setState("idle");
      /* A file the route refused is told beside the file field, and focus
         goes there. 413 is size, whether the route or Vercel in front of it
         said so (Vercel's own answer is not JSON, hence the catch). */
      const reason = await response
        .json()
        .then((j: { reason?: string }) => j.reason)
        .catch(() => undefined);
      if (response.status === 413 || reason === "files") {
        setFileTrouble({ problem: response.status === 413 ? "size" : "server", names: [] });
        fileRef.current?.focus();
        return;
      }
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

  // "Nicht angehängt: plan.exe · Möglich sind …": the files left out, then
  // why. The middle dot is the site's own separator and needs no grammar.
  const fileTroubleText = fileTrouble
    ? (fileTrouble.names.length
        ? `${copy.files.refused} ${fileTrouble.names.join(", ")} · `
        : "") +
      {
        type: copy.files.errorType,
        empty: copy.files.errorEmpty,
        count: copy.files.errorCount,
        size: copy.files.errorSize,
        server: copy.files.errorServer,
      }[fileTrouble.problem]
    : "";
  const total = files.reduce((sum, f) => sum + f.size, 0);
  const fileHintId = `${id}-files-hint`;
  const fileTroubleId = `${id}-files-trouble`;

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
          {/* The site's chip (.nk-chip, app/styles/base.css) — the identical
              object the wall's material filter is made of, because it is the
              identical offer: pick one of a short, closed set. The chosen one
              is filled creme and nothing moves; the radio inside is the real
              control and is hidden from sight only. */}
          {copy.kinds.map(({ id, label }) => (
            /* No "chosen" class or attribute: the radio inside is checked,
               and .nk-chip reads that with :has() — one state, stated once.
               See app/styles/base.css. */
            <label key={id} className="nk-chip">
              <input
                type="radio"
                name="kind"
                value={id}
                checked={kind === id}
                onChange={() => setKind(id)}
                className="nk-sr-only"
              />
              {label}
            </label>
          ))}
        </div>
      </fieldset>

      {/* ── 02 · who is writing ───────────────────────────────────── */}
      <p className={styles.step}>{copy.step2}</p>
      <div className={styles.pair}>
        <label className={styles.underline}>
          <span className={styles.label}>{copy.name}</span>
          <input
            type="text"
            name="name"
            required
            autoComplete="name"
            value={fields.name}
            onChange={(e) => setFields({ ...fields, name: e.target.value })}
            className={styles.input}
            aria-invalid={bad.name || undefined}
            aria-describedby={trouble ? "nk-form-trouble" : undefined}
          />
        </label>
        <label className={styles.underline}>
          <span className={styles.label}>{copy.email}</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
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
      <label className={styles.underline}>
        <span className={styles.label}>{copy.messageLabel}</span>
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

      {/* ── Attachments ────────────────────────────────────────────
          A real file input, hidden from sight only (like the chips' radios):
          it keeps its place in the tab order and its keyboard behaviour, and
          its label is drawn as the button, which shows the focus ring when
          the input has it. No drop zone: the picker is the whole interface. */}
      <div className={styles.files}>
        <span className={styles.label} id={`${id}-files-label`}>
          {copy.files.label}
        </span>
        <label className={styles.pick}>
          <input
            ref={fileRef}
            type="file"
            name="files"
            multiple
            accept={ACCEPT}
            onChange={addFiles}
            className="nk-sr-only"
            aria-labelledby={`${id}-files-label ${id}-files-choose`}
            aria-describedby={fileTrouble ? `${fileTroubleId} ${fileHintId}` : fileHintId}
            aria-invalid={fileTrouble ? true : undefined}
          />
          <span id={`${id}-files-choose`}>{copy.files.choose}</span>
        </label>
        <p className={styles.hint} id={fileHintId}>
          {copy.files.hint}
        </p>

        {files.length > 0 ? (
          <>
            <ul className={styles.fileList} ref={listRef}>
              {files.map((file, i) => (
                <li key={`${file.name}-${file.size}-${file.lastModified}`} className={styles.fileRow}>
                  <span className={styles.fileName}>{file.name}</span>
                  <span className={styles.fileSize}>{size(file.size, locale)}</span>
                  <button type="button" className={styles.remove} onClick={() => removeFile(i)}>
                    {copy.files.remove}
                    <span className="nk-sr-only">: {file.name}</span>
                  </button>
                </li>
              ))}
            </ul>
            <p className={styles.fileTotal}>
              {copy.files.total} {size(total, locale)} / {size(MAX_TOTAL_BYTES, locale)} ·{" "}
              {files.length} / {MAX_FILES}
            </p>
          </>
        ) : null}

        {fileTrouble ? (
          <p className={`${styles.error} ${styles.fileError}`} id={fileTroubleId} role="alert">
            {fileTroubleText}
          </p>
        ) : null}
      </div>

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
        </button>
        <span className={styles.sla}>{copy.sla}</span>
      </div>
      <p className={styles.privacy}>
        {copy.privacy}{" "}
        <Link href="/datenschutz" className={styles.privacyLink}>
          {copy.privacyLink}
        </Link>
        {copy.privacyAfter}
      </p>

      {/* The trouble line wears the success panel's language — an accent rule
          and a line of small caps — so a failure reads as part of the sheet rather than
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
