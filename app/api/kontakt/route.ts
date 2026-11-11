import { after } from "next/server";
import nodemailer from "nodemailer";
import { MAX_BODY_BYTES, readInquiry, type Inquiry } from "@/lib/inquiry";

/* The inquiry form's delivery route.

   Mail goes out over SMTP through the studio's own mailbox,
   hallo@nokta-studio.de at INWX: the same server the studio sends and reads
   its mail with, so no further provider sees an inquiry. Host, port and user
   are not secret and are set here; only the password comes from the
   environment.

   Required env:
     KONTAKT_SMTP_PASS  the mailbox password of hallo@nokta-studio.de
   Optional:
     KONTAKT_SMTP_HOST  default smtp.webspace.bz
     KONTAKT_SMTP_PORT  default 465 (implicit TLS)
     KONTAKT_SMTP_USER  default hallo@nokta-studio.de
     KONTAKT_TO         recipient; defaults to the studio address

   With no password configured the route refuses honestly (503) rather than
   swallowing an inquiry: the form then shows its error panel, which names
   the studio's address so the reader can write directly.

   GDPR: nothing is stored and nothing is logged but the outcome. The message
   body, the sender's name, their address and any attached files exist only
   in memory for the length of the request and inside the mail itself.

   Header safety: the sender's name and address reach the From/Reply-To and
   Subject headers only as nodemailer address objects and an encoded subject,
   and lib/inquiry.ts has already turned every control character in them
   (line breaks included) into a space, so no header can be started from the
   form. */

const STUDIO = "hallo@nokta-studio.de";
const TO = process.env.KONTAKT_TO ?? STUDIO;
const SMTP_HOST = process.env.KONTAKT_SMTP_HOST ?? "smtp.webspace.bz";
const SMTP_PORT = Number(process.env.KONTAKT_SMTP_PORT ?? 465);
const SMTP_USER = process.env.KONTAKT_SMTP_USER ?? STUDIO;
const SMTP_PASS = process.env.KONTAKT_SMTP_PASS;

/* What the form may send (the kind whitelist, the field caps, the address
   pattern, the attachment limits) and the reading of a submitted form against
   it live in lib/inquiry.ts, shared with the form so both ends apply one set
   of rules, and kept free of anything Next so they can be tested alone. */

/* ── Rate limit ────────────────────────────────────────────────────────
   A speed bump, not a wall: five inquiries per address per hour. The map
   lives in the instance's memory, so a serverless deployment resets it on
   every cold start and several instances each keep their own count. That is
   accepted — it is the honeypot that stops the bulk of the noise, and this
   only stops one client hammering one warm instance. */
const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 5;
const hits = new Map<string, number[]>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  // Keep the map from growing without bound on a long-lived instance.
  if (hits.size > 5000) {
    for (const [key, times] of hits) {
      if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(key);
    }
  }
  return recent.length > LIMIT;
}

function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "unknown";
}

/** "1,2 MB" for the mail's list of attachments. */
function megabytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1).replace(".", ",")} MB`;
}

async function sendMail(body: Inquiry): Promise<boolean> {
  if (!SMTP_PASS) {
    console.error("kontakt: KONTAKT_SMTP_PASS not configured");
    return false;
  }

  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
    // A serverless function has a few seconds; a hung server must not eat them.
    connectionTimeout: 8000,
    greetingTimeout: 8000,
    socketTimeout: 10000,
  });

  try {
    await transport.sendMail({
      // Sent as the mailbox it authenticates as, which is the only sender the
      // server will accept, and named so the inbox shows where it came from.
      from: { name: "nokta Website", address: SMTP_USER },
      to: TO,
      // The sender's own address, so hitting reply in the mail client answers
      // the person rather than the form.
      replyTo: { name: body.name, address: body.email },
      subject: `Anfrage · ${body.kind} · ${body.name}`,
      text: [
        `Art: ${body.kind}`,
        `Name: ${body.name}`,
        `E-Mail: ${body.email}`,
        ...(body.attachments.length
          ? [
              `Anhänge: ${body.attachments
                .map((a) => `${a.filename} (${megabytes(a.content.byteLength)})`)
                .join(", ")}`,
            ]
          : []),
        "",
        body.message,
      ].join("\n"),
      // Checked in lib/inquiry.ts: extension, first bytes, total size; the
      // name is sanitised and the content type is ours, not the browser's.
      attachments: body.attachments.map((a) => ({
        filename: a.filename,
        content: Buffer.from(a.content),
        contentType: a.contentType,
      })),
    });
    return true;
  } catch (error) {
    // The error's code only: the server's reply can quote the message back,
    // and none of that belongs in a log.
    const code = (error as { code?: string; responseCode?: number }) ?? {};
    console.error(`kontakt: delivery failed (${code.code ?? "?"} ${code.responseCode ?? ""})`);
    return false;
  }
}

export async function POST(request: Request) {
  /* Refused before parsing when the request says it is too big. Vercel turns
     away anything over 4.5 MB on its own, but a self-hosted run would not, and
     the form never sends more than this. */
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BODY_BYTES) {
    return Response.json({ ok: false, reason: "files" }, { status: 413 });
  }

  let data: FormData;
  try {
    // multipart/form-data from the form (urlencoded parses here too).
    data = await request.formData();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const reading = await readInquiry(data);

  /* The honeypot answers with a plain 200 so the sender learns nothing from
     the difference. */
  if (reading.result === "honeypot") return Response.json({ ok: true });
  // "reason" tells the form which of its messages to show: a field or a file.
  if (reading.result !== "ok") {
    return Response.json({ ok: false, reason: reading.result }, { status: reading.status });
  }

  if (rateLimited(clientIp(request))) {
    return Response.json({ ok: false }, { status: 429 });
  }

  const delivered = await sendMail(reading.inquiry);
  if (!delivered) {
    return Response.json({ ok: false }, { status: 503 });
  }

  // The outcome, and only the outcome.
  after(() => console.info("kontakt: inquiry delivered"));

  return Response.json({ ok: true });
}
