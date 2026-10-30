// Renders the pages that carry JSON-LD and checks the script blocks.
// Usage: node scripts/check-jsonld.mjs [baseUrl]
// Expects a running `next start` (default http://127.0.0.1:3000).

const BASE = (process.argv[2] ?? "http://127.0.0.1:3000").replace(/\/$/, "");
const STUDIO_ID = "https://www.nokta-studio.de/#studio";
const LANGUAGES = ["de", "en", "tr", "ja"];
const AREA = { "@type": "State", name: "Nordrhein-Westfalen" };

const STREET = [
  "Messerstraße",
  "Messerstrasse",
  "42657",
  "Solingen",
  "streetAddress",
  "postalCode",
  "addressLocality",
];

// Client and person names that must not appear in a work's JSON-LD.
// "Architekturbüro" is matched as a whole word so "Architekturbüros" in the
// studio description is not a hit. The check runs on the CreativeWork only.
const CLIENTS = [
  "BMWE",
  "Binome Architekten",
  "Privatkunde",
  "Private client",
  "Bireysel müşteri",
  "個人のお客様",
  "Stadtplanung NRW",
  "Kommission Wettbewerb & Künstliche Intelligenz",
  "Commission on Competition & Artificial Intelligence",
  "Rekabet ve Yapay Zekâ Komisyonu",
  "競争と人工知能に関する委員会",
  "Bundesministerium für Wirtschaft",
  "Federal Ministry for Economic Affairs",
  "Mert Büyüktüfekci",
  "kikommission.de",
];

const failures = [];

function fail(path, message) {
  failures.push(`${path}: ${message}`);
}

function decode(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function scriptsOf(html) {
  const blocks = [];
  const re = /<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g;
  for (const match of html.matchAll(re)) blocks.push(match[1]);
  return blocks;
}

function metaDescription(html) {
  const tag = html.match(/<meta\b[^>]*\bname="description"[^>]*>/i);
  if (!tag) return "";
  const content = tag[0].match(/\bcontent="([^"]*)"/);
  return content ? decode(content[1]) : "";
}

function parseBlocks(path, html) {
  const raw = scriptsOf(html);
  const nodes = [];
  raw.forEach((block, i) => {
    if (block.includes("<")) fail(path, `script ${i} contains a raw '<'`);
    let data;
    try {
      data = JSON.parse(block);
    } catch (error) {
      fail(path, `script ${i} is not JSON (${error.message})`);
      return;
    }
    const list = Array.isArray(data) ? data : [data];
    for (const node of list) nodes.push(node);
  });
  return { raw, nodes };
}

function types(nodes) {
  return nodes.map((node) => node["@type"]);
}

function findType(nodes, type) {
  return nodes.filter((node) => node["@type"] === type);
}

function sameArea(value) {
  return (
    value &&
    value["@type"] === AREA["@type"] &&
    value.name === AREA.name &&
    Object.keys(value).length === 2
  );
}

function assertArea(path, node) {
  const area = node.areaServed;
  if (!sameArea(area)) {
    fail(path, `${node["@type"]} areaServed is ${JSON.stringify(area)}`);
  }
  if (JSON.stringify(area ?? "").includes("Düsseldorf") || area?.["@type"] === "City") {
    fail(path, `${node["@type"]} areaServed still names a city`);
  }
}

function assertNoStreet(path, jsonText) {
  for (const needle of STREET) {
    if (jsonText.includes(needle)) fail(path, `JSON-LD contains ${needle}`);
  }
}

function assertStudio(path, node) {
  if (node["@id"] !== STUDIO_ID) fail(path, `studio @id is ${node["@id"]}`);
  if (node.name !== "nokta") fail(path, "studio name missing");
  if (node.url !== "https://www.nokta-studio.de") fail(path, "studio url missing");
  if (!node.description) fail(path, "studio description missing");
  if (node.logo !== "https://www.nokta-studio.de/nokta_logo.png") {
    fail(path, `logo is ${node.logo}`);
  }
  if (!node.image) fail(path, "studio image missing");
  if (node.email !== "hallo@nokta-studio.de") fail(path, `email is ${node.email}`);
  if (JSON.stringify(node.inLanguage) !== JSON.stringify(LANGUAGES)) {
    fail(path, `inLanguage is ${JSON.stringify(node.inLanguage)}`);
  }
  if (JSON.stringify(node.availableLanguage) !== JSON.stringify(LANGUAGES)) {
    fail(path, `availableLanguage is ${JSON.stringify(node.availableLanguage)}`);
  }
  const address = node.address;
  if (
    !address ||
    address["@type"] !== "PostalAddress" ||
    address.addressRegion !== "NRW" ||
    address.addressCountry !== "DE" ||
    Object.keys(address).length !== 3
  ) {
    fail(path, `address is ${JSON.stringify(address)}`);
  }
  if ("sameAs" in node) fail(path, "sameAs is set, but the site links no profile");
  assertArea(path, node);
}

function assertService(path, node, locale) {
  for (const key of ["name", "description", "serviceType", "url"]) {
    if (!node[key] || typeof node[key] !== "string") fail(path, `Service.${key} missing`);
  }
  if (node.url !== `https://www.nokta-studio.de${path}`) fail(path, `Service url is ${node.url}`);
  if (node.provider?.["@id"] !== STUDIO_ID) fail(path, "Service provider is not the studio");
  if (node.inLanguage !== locale) fail(path, `Service inLanguage is ${node.inLanguage}, expected ${locale}`);
  assertArea(path, node);
}

function assertFaq(path, node, html) {
  const items = node.mainEntity;
  if (!Array.isArray(items) || items.length === 0) {
    fail(path, "FAQPage has no questions");
    return;
  }
  for (const item of items) {
    const question = item?.name;
    const answer = item?.acceptedAnswer?.text;
    if (item?.["@type"] !== "Question" || !question) fail(path, "FAQ question invalid");
    if (item?.acceptedAnswer?.["@type"] !== "Answer" || !answer) fail(path, "FAQ answer invalid");
    if (question && !html.includes(question)) fail(path, `FAQ question not visible: ${question}`);
    if (answer && !html.includes(answer)) fail(path, `FAQ answer not visible: ${answer}`);
  }
}

function assertWork(path, node, html, locale) {
  for (const key of ["name", "description", "image", "url"]) {
    if (!node[key] || typeof node[key] !== "string") fail(path, `CreativeWork.${key} missing`);
  }
  if (!String(node.image).startsWith("https://www.nokta-studio.de/")) {
    fail(path, `CreativeWork image is ${node.image}`);
  }
  if (node.url !== `https://www.nokta-studio.de${path}`) fail(path, `CreativeWork url is ${node.url}`);
  if (node.creator?.["@id"] !== STUDIO_ID) fail(path, "CreativeWork creator is not the studio");
  if (node.inLanguage !== locale) {
    fail(path, `CreativeWork inLanguage is ${node.inLanguage}, expected ${locale}`);
  }
  if ("client" in node || "sponsor" in node || "funder" in node) {
    fail(path, "CreativeWork carries a client field");
  }
  const blob = JSON.stringify(node);
  for (const name of CLIENTS) {
    if (blob.includes(name)) fail(path, `CreativeWork contains client name ${name}`);
  }
  if (/\bArchitekturbüro\b/.test(blob)) fail(path, "CreativeWork contains client name Architekturbüro");
  if (node.name && !html.includes(node.name)) fail(path, "CreativeWork name is not visible");
  if (node.description && !html.includes(node.description.slice(0, 80))) {
    fail(path, "CreativeWork description is not visible");
  }
}

async function fetchHtml(path, locale) {
  const headers = locale ? { cookie: `nk_lang=${locale}` } : {};
  const response = await fetch(`${BASE}${path}`, { headers, redirect: "follow" });
  if (!response.ok) throw new Error(`${path} [${locale ?? "de"}] HTTP ${response.status}`);
  return response.text();
}

async function checkPage(path, locale, expect) {
  const label = `${path} [${locale}]`;
  let html;
  try {
    html = await fetchHtml(path, locale);
  } catch (error) {
    fail(label, error.message);
    return;
  }
  const { raw, nodes } = parseBlocks(label, html);
  const jsonText = raw.join("\n");
  assertNoStreet(label, jsonText);
  for (const needle of STREET) {
    if (html.includes(needle)) fail(label, `HTML contains ${needle}`);
  }

  const studios = findType(nodes, "ProfessionalService");
  if (studios.length !== 1) fail(label, `expected 1 ProfessionalService, found ${studios.length}`);
  if (studios[0]) assertStudio(label, studios[0]);

  const services = findType(nodes, "Service");
  const faqs = findType(nodes, "FAQPage");
  const works = findType(nodes, "CreativeWork");

  if (expect.service) {
    if (services.length !== 1) fail(label, `expected 1 Service, found ${services.length}`);
    if (services[0]) {
      assertService(path, services[0], expect.locale);
      const description = metaDescription(html);
      if (services[0].description !== description) {
        fail(label, "Service description differs from the meta description");
      }
      if (services[0].name && !html.includes(services[0].name)) {
        fail(label, "Service name is not visible");
      }
    }
  } else if (services.length) {
    fail(label, "unexpected Service");
  }

  if (expect.faq) {
    if (faqs.length !== 1) fail(label, `expected 1 FAQPage, found ${faqs.length}`);
    if (faqs[0]) assertFaq(label, faqs[0], html);
  } else if (faqs.length) {
    fail(label, "unexpected FAQPage");
  }

  if (expect.work) {
    if (works.length !== 1) fail(label, `expected 1 CreativeWork, found ${works.length}`);
    if (works[0]) assertWork(path, works[0], html, expect.locale);
  } else if (works.length) {
    fail(label, "unexpected CreativeWork");
  }

  if (expect.scripts !== undefined && raw.length !== expect.scripts) {
    fail(label, `expected ${expect.scripts} ld+json scripts, found ${raw.length} (${types(nodes).join(", ")})`);
  }

  if (expect.descriptionIncludes && studios[0] && !studios[0].description.includes(expect.descriptionIncludes)) {
    fail(label, `studio description does not include ${expect.descriptionIncludes}`);
  }
}

async function workPaths() {
  const xml = await fetchHtml("/sitemap.xml");
  const paths = [...xml.matchAll(/<loc>[^<]*(\/arbeiten\/[^<]+)<\/loc>/g)].map((m) => m[1]);
  if (paths.length < 5) throw new Error(`sitemap listed ${paths.length} works`);
  return paths;
}

const home = { service: false, faq: false, work: false, scripts: 1, locale: "de" };
const service = { service: true, faq: false, work: false, scripts: 2 };
const viz = { service: true, faq: true, work: false, scripts: 3 };

await checkPage("/", "de", { ...home, descriptionIncludes: "Designstudio aus NRW" });
await checkPage("/", "en", {
  ...home,
  locale: "en",
  descriptionIncludes: "Design studio from NRW",
});
await checkPage("/", "tr", { ...home, locale: "tr", descriptionIncludes: "tasarım stüdyosu" });
await checkPage("/", "ja", { ...home, locale: "ja", descriptionIncludes: "デザインスタジオ" });

await checkPage("/3d-visualisierung", "de", { ...viz, locale: "de" });
await checkPage("/3d-visualisierung", "en", { ...viz, locale: "en" });
await checkPage("/3d-visualisierung", "ja", { ...viz, locale: "ja" });
await checkPage("/architekturbueros", "de", { ...service, locale: "de" });
await checkPage("/architekturbueros", "en", { ...service, locale: "de" });
await checkPage("/bautraeger", "de", { ...service, locale: "de" });
await checkPage("/bautraeger", "en", { ...service, locale: "de" });
await checkPage("/fuer-institutionen", "de", { ...service, locale: "de" });
await checkPage("/fuer-institutionen", "tr", { ...service, locale: "tr" });

const works = await workPaths();
for (const path of works) {
  await checkPage(path, "de", { service: false, faq: false, work: true, scripts: 2, locale: "de" });
}
await checkPage("/arbeiten/teahouse", "en", {
  service: false,
  faq: false,
  work: true,
  scripts: 2,
  locale: "en",
});
await checkPage("/arbeiten/abschlussbericht-ki-kommission", "en", {
  service: false,
  faq: false,
  work: true,
  scripts: 2,
  locale: "en",
});
await checkPage("/arbeiten/abschlussbericht-ki-kommission", "de", {
  service: false,
  faq: false,
  work: true,
  scripts: 2,
  locale: "de",
});

if (failures.length) {
  console.error(`JSON-LD check failed (${failures.length})`);
  for (const line of failures) console.error(`- ${line}`);
  process.exit(1);
}

console.log(`JSON-LD check passed (${works.length} works, 5 service pages, home in 4 languages)`);
