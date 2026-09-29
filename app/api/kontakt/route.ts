import { after } from "next/server";
import nodemailer from "nodemailer";

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
   body, the sender's name and their address exist only for the length of the
   request and inside the mail itself. */

const STUDIO = "hallo@nokta-studio.de";
const TO = process.env.KONTAKT_TO ?? STUDIO;
const SMTP_HOST = process.env.KONTAKT_SMTP_HOST ?? "smtp.webspace.bz";
const SMTP_PORT = Number(process.env.KONTAKT_SMTP_PORT ?? 465);
const SMTP_USER = process.env.KONTAKT_SMTP_USER ?? STUDIO;
const SMTP_PASS = process.env.KONTAKT_SMTP_PASS;

/* The four things the form can be about, keyed by the stable id the form
   sends — NOT by the label the reader saw. The chips are translated, so
   whitelisting display text would accept German and reject the same click
   from an English, Turkish or Japanese visitor.

   The value here is what the mail says, so an inquiry always arrives in the
   studio's own vocabulary whatever language it was written in. */
const KINDS: Record<string, string> = {
  visualisierung: "Visualisierung",
  editorial: "Editorial",
  druck: "Druck",
  cad: "CAD-Plan",
};

/* Field caps. Long enough for a real briefing, short enough that the route is
   never asked to relay a payload. */
const MAX = { name: 120, email: 200, message: 4000 } as const;

/* Deliberately loose: one @, something either side, a dot in the domain. A
   stricter pattern rejects valid addresses, and the only real proof that an
   address works is a reply arriving at it. */
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function field(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function sendMail(body: {
  kind: string;
  name: string;
  email: string;
  message: string;
}): Promise<boolean> {
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
        "",
        body.message,
      ].join("\n"),
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
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }

  const data = payload as Record<string, unknown>;

  /* The honeypot. A field no human sees and no human fills; anything in it
     came from something reading the markup rather than the page. Answered
     with a plain 200 so the sender learns nothing from the difference. */
  if (field(data.website, 100) !== "") {
    return Response.json({ ok: true });
  }

  const kind = field(data.kind, 40);
  const name = field(data.name, MAX.name);
  const email = field(data.email, MAX.email);
  const message = field(data.message, MAX.message);

  const kindLabel = KINDS[kind];
  if (!name || !message || !EMAIL.test(email) || !kindLabel) {
    return Response.json({ ok: false }, { status: 422 });
  }

  if (rateLimited(clientIp(request))) {
    return Response.json({ ok: false }, { status: 429 });
  }

  const delivered = await sendMail({ kind: kindLabel, name, email, message });
  if (!delivered) {
    return Response.json({ ok: false }, { status: 503 });
  }

  // The outcome, and only the outcome.
  after(() => console.info("kontakt: inquiry delivered"));

  return Response.json({ ok: true });
}
