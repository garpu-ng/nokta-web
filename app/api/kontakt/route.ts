import { after } from "next/server";

/* The inquiry form's delivery route.

   The site carries no dependencies beyond Next and React, and this route does
   not add any: mail goes out over plain fetch to a transactional HTTP API
   (Resend), configured entirely by environment variables. Swapping providers
   is a change to sendMail() below and nothing else.

   Required env:
     KONTAKT_API_KEY   the provider's API key
     KONTAKT_FROM      a verified sender on the sending domain,
                       e.g. "nokta Website <formular@nokta-studio.de>"
   Optional:
     KONTAKT_TO        recipient; defaults to the studio address below

   With no key configured the route refuses honestly (503) rather than
   swallowing an inquiry — the form then shows its error panel, which names
   the studio's address so the reader can write directly.

   GDPR: nothing is stored and nothing is logged but the outcome. The message
   body, the sender's name and their address exist only for the length of the
   request and inside the mail itself. */

const TO = process.env.KONTAKT_TO ?? "hallo@nokta-studio.de";
const FROM = process.env.KONTAKT_FROM;
const API_KEY = process.env.KONTAKT_API_KEY;

/** The four things the form can be about; anything else is not from our form. */
const KINDS = new Set(["Visualisierung", "Editorial", "Druck", "CAD-Plan"]);

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
  if (!API_KEY || !FROM) {
    console.error("kontakt: KONTAKT_API_KEY / KONTAKT_FROM not configured");
    return false;
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [TO],
      // The sender's own address, so hitting reply in the mail client answers
      // the person rather than the form.
      reply_to: body.email,
      subject: `Anfrage · ${body.kind} · ${body.name}`,
      text: [
        `Art: ${body.kind}`,
        `Name: ${body.name}`,
        `E-Mail: ${body.email}`,
        "",
        body.message,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    // Status only — the provider's body can quote the payload back at us, and
    // none of that belongs in a log.
    console.error(`kontakt: delivery failed (${response.status})`);
    return false;
  }
  return true;
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

  if (!name || !message || !EMAIL.test(email) || !KINDS.has(kind)) {
    return Response.json({ ok: false }, { status: 422 });
  }

  if (rateLimited(clientIp(request))) {
    return Response.json({ ok: false }, { status: 429 });
  }

  const delivered = await sendMail({ kind, name, email, message });
  if (!delivered) {
    return Response.json({ ok: false }, { status: 503 });
  }

  // The outcome, and only the outcome.
  after(() => console.info("kontakt: inquiry delivered"));

  return Response.json({ ok: true });
}
