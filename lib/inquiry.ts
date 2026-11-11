/* The inquiry form's rules, in one place for both ends of the wire.

   The form (components/kontakt/InquiryForm.tsx) checks a choice of files
   against these limits before anything is sent, so the reader hears about a
   wrong format at once; the route (app/api/kontakt/route.ts) checks the same
   limits again with readInquiry() below, because nothing the browser says can
   be trusted. Everything here is pure (no Node APIs, no Next APIs), so it can
   be exercised on its own and bundled into the client.

   The limits, and why they are these:
   - 4 MB of attachments in total. Vercel refuses a function request body over
     4.5 MB; 4 MiB of files plus the text fields (a 4000-character message is
     at most ~12 KB of UTF-8) and the multipart framing stays clear of it.
     Larger plan sets follow by e-mail once the studio has answered, which is
     what the form says beside the field.
   - 5 files. Enough for a plan, a sketch and a few photos.
   - PDF, DWG, DXF, JPG, PNG: what plans and sketches arrive as.

   The visible copy names these numbers (kontakt.form.files.* in messages/).
   Change a limit here and change that copy with it, in all four locales. */

export const MAX_FILES = 5;
export const MAX_TOTAL_BYTES = 4 * 1024 * 1024;
/** The whole request, files and fields, as the route will accept it before
    parsing. Just under Vercel's own 4.5 MB ceiling. */
export const MAX_BODY_BYTES = 4_500_000;

/** Extension → the content type the mail declares. The browser's own
    File.type is never used: it is a guess for DWG/DXF and a claim anyway. */
const TYPES: Record<string, string> = {
  pdf: "application/pdf",
  dwg: "image/vnd.dwg",
  dxf: "image/vnd.dxf",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
};

/** For the file input's accept attribute. A hint to the picker, not a check. */
export const ACCEPT = Object.keys(TYPES)
  .map((ext) => `.${ext}`)
  .join(",");

/* The four things the form can be about, keyed by the stable id the form
   sends, NOT by the label the reader saw. The chips are translated, so
   whitelisting display text would accept German and reject the same click
   from an English, Turkish or Japanese visitor.

   The value here is what the mail says, so an inquiry always arrives in the
   studio's own vocabulary whatever language it was written in. */
export const KINDS: Record<string, string> = {
  visualisierung: "Visualisierung",
  editorial: "Editorial",
  druck: "Druck",
  cad: "CAD-Plan",
};

/* Field caps. Long enough for a real briefing, short enough that the route is
   never asked to relay a payload. */
export const MAX = { name: 120, email: 200, message: 4000 } as const;

/* Deliberately loose: one @, something either side, a dot in the domain. A
   stricter pattern rejects valid addresses, and the only real proof that an
   address works is a reply arriving at it. */
export const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function extensionOf(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot < 0 ? "" : name.slice(dot + 1).toLowerCase();
}

export function allowedName(name: string): boolean {
  return Object.hasOwn(TYPES, extensionOf(name));
}

/** What is wrong with a choice of files, or null. Checked in this order, so
    the reader is told the thing they can fix first. */
export type FileProblem = "type" | "empty" | "count" | "size";

export function checkFiles(files: { name: string; size: number }[]): FileProblem | null {
  if (files.some((f) => !allowedName(f.name))) return "type";
  if (files.some((f) => f.size <= 0)) return "empty";
  if (files.length > MAX_FILES) return "count";
  if (files.reduce((sum, f) => sum + f.size, 0) > MAX_TOTAL_BYTES) return "size";
  return null;
}

/* ── Server side ───────────────────────────────────────────────────── */

function startsWith(head: Uint8Array, bytes: number[]): boolean {
  return bytes.every((b, i) => head[i] === b);
}

/** A cheap look at the first bytes, so a renamed executable does not travel
    as "plan.pdf". PDF may carry a little junk before its header, which
    readers tolerate, so the marker is searched in the first kilobyte. DXF is
    usually plain text, so it only has to contain no NUL byte unless it is the
    binary variant, which says so. */
export function looksLike(ext: string, head: Uint8Array): boolean {
  switch (ext) {
    case "pdf": {
      const text = String.fromCharCode(...head.subarray(0, 1024));
      return text.includes("%PDF-");
    }
    case "jpg":
    case "jpeg":
      return startsWith(head, [0xff, 0xd8, 0xff]);
    case "png":
      return startsWith(head, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    case "dwg":
      // "AC1015", "AC1032" … every DWG version string starts "AC" + a digit.
      return head[0] === 0x41 && head[1] === 0x43 && head[2] >= 0x30 && head[2] <= 0x39;
    case "dxf": {
      const text = String.fromCharCode(...head.subarray(0, 512));
      return text.startsWith("AutoCAD Binary DXF") || !text.includes("\u0000");
    }
    default:
      return false;
  }
}

/** A file name fit for a MIME header and any mail client's save dialog: the
    base name only (no path), letters, digits and a few marks, at most 80
    characters, and the extension that was actually checked. */
export function safeFileName(name: string, index: number): string {
  const ext = extensionOf(name);
  const last = name.split(/[\\/]/).pop() ?? "";
  const base = last
    .slice(0, last.length - (ext ? ext.length + 1 : 0))
    .normalize("NFC")
    .replace(/[^\p{L}\p{N} ._()-]+/gu, "_")
    .replace(/[\s_]{2,}/g, "_")
    .replace(/^[\s._-]+|[\s._-]+$/g, "")
    .slice(0, 80);
  return `${base || `anhang-${index + 1}`}.${ext}`;
}

/** A value that will sit in a mail header (the sender's name, their address,
    the subject): every control character, line break included, becomes a
    space, so nothing typed into the form can start a header of its own.
    Nodemailer encodes these too; this does not rely on it. */
export function singleLine(value: string): string {
  return value.replace(/[\u0000-\u001f\u007f-\u009f\u2028\u2029]+/g, " ").trim();
}

function field(value: FormDataEntryValue | null, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export type Attachment = { filename: string; content: Uint8Array; contentType: string };

export type Inquiry = {
  kind: string;
  name: string;
  email: string;
  message: string;
  attachments: Attachment[];
};

export type Reading =
  | { result: "honeypot" }
  | { result: "fields"; status: 422 }
  | { result: "files"; status: 413 | 422 }
  | { result: "ok"; inquiry: Inquiry };

/** Everything the route needs to decide about a submitted form, short of
    sending it. Fields first (so a typo is reported as a typo), then files. */
export async function readInquiry(data: FormData): Promise<Reading> {
  /* The honeypot. A field no human sees and no human fills; anything in it
     came from something reading the markup rather than the page. */
  if (field(data.get("website"), 100) !== "") return { result: "honeypot" };

  const kind = KINDS[field(data.get("kind"), 40)];
  const name = singleLine(field(data.get("name"), MAX.name));
  const email = singleLine(field(data.get("email"), MAX.email));
  const message = field(data.get("message"), MAX.message);
  if (!kind || !name || !message || !EMAIL.test(email)) {
    return { result: "fields", status: 422 };
  }

  const entries = data.getAll("files");
  // A string where a file should be is not a file.
  if (entries.some((e) => typeof e === "string")) return { result: "files", status: 422 };
  const files = entries as File[];

  const problem = checkFiles(files);
  if (problem === "size") return { result: "files", status: 413 };
  if (problem) return { result: "files", status: 422 };

  const attachments: Attachment[] = [];
  for (const [i, file] of files.entries()) {
    const ext = extensionOf(file.name);
    const content = new Uint8Array(await file.arrayBuffer());
    // The size the browser declared is checked above; this is the size that
    // actually arrived, which is the one that counts.
    if (content.byteLength !== file.size || !looksLike(ext, content)) {
      return { result: "files", status: 422 };
    }
    attachments.push({ filename: safeFileName(file.name, i), content, contentType: TYPES[ext] });
  }

  return { result: "ok", inquiry: { kind, name, email, message, attachments } };
}
