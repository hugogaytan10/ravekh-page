import { readFile } from "node:fs/promises";
import path from "node:path";

const DEFAULT_TITLE = "Catálogo digital | Ravekh";
const DEFAULT_DESCRIPTION = "Explora productos, revisa detalles y realiza pedidos desde el catálogo digital de Ravekh.";
const DEFAULT_IMAGE_PATH = "/ravekh.png";

const normalizeBase = (value = "") => {
  const trimmed = String(value).trim();
  if (!trimmed) return "";
  return trimmed.endsWith("/") ? trimmed : `${trimmed}/`;
};

const escapeHtml = (value = "") => String(value)
  .replace(/&/g, "&amp;")
  .replace(/</g, "&lt;")
  .replace(/>/g, "&gt;")
  .replace(/"/g, "&quot;")
  .replace(/'/g, "&#39;");

const isAbsoluteUrl = (value = "") => /^https?:\/\//i.test(value);

const toAbsoluteUrl = (value, origin) => {
  const trimmed = String(value ?? "").trim();
  if (!trimmed) return `${origin}${DEFAULT_IMAGE_PATH}`;
  if (isAbsoluteUrl(trimmed)) return trimmed;
  return new URL(trimmed.startsWith("/") ? trimmed : `/${trimmed}`, origin).toString();
};

const getOrigin = (event) => {
  try {
    return new URL(event.rawUrl).origin;
  } catch {
    const host = event.headers.host || "ravekh.com";
    const proto = event.headers["x-forwarded-proto"] || "https";
    return `${proto}://${host}`;
  }
};

const getCanonicalUrl = (event, origin) => {
  try {
    const url = new URL(event.rawUrl);
    return `${origin}${url.pathname}`;
  } catch {
    return origin;
  }
};

const readIndexHtml = async () => {
  const candidates = [
    path.join(process.cwd(), "dist", "index.html"),
    path.join(process.cwd(), "index.html"),
  ];

  for (const candidate of candidates) {
    try {
      return await readFile(candidate, "utf8");
    } catch {
      // Try the next known location used by local builds and Netlify deploys.
    }
  }

  throw new Error("No se encontró index.html para inyectar metadata del catálogo.");
};

const fetchBusiness = async (businessId) => {
  const baseUrl = normalizeBase(process.env.VITE_API_URL || process.env.API_URL || "");
  if (!baseUrl || !businessId) return null;

  const response = await fetch(`${baseUrl}business/${encodeURIComponent(businessId)}`, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) return null;
  return response.json();
};

const buildCatalogSeo = (business, canonicalUrl, origin) => {
  const name = String(business?.Name ?? business?.name ?? "").trim();
  const logo = String(business?.Logo ?? business?.logo ?? "").trim();
  const phone = String(business?.PhoneNumber ?? business?.phone ?? "").trim();
  const businessName = name || "Catálogo digital";
  const title = name ? `${businessName} | Catálogo digital` : DEFAULT_TITLE;
  const description = name
    ? (phone
      ? `Explora el catálogo digital de ${businessName} y realiza tu pedido. Teléfono: ${phone}.`
      : `Explora el catálogo digital de ${businessName} y realiza tu pedido en línea.`)
    : DEFAULT_DESCRIPTION;
  const image = toAbsoluteUrl(logo || DEFAULT_IMAGE_PATH, origin);

  return { title, description, image, canonicalUrl };
};

const injectSeo = (html, seo) => {
  const safeTitle = escapeHtml(seo.title || DEFAULT_TITLE);
  const safeDescription = escapeHtml(seo.description || DEFAULT_DESCRIPTION);
  const safeImage = escapeHtml(seo.image);
  const safeUrl = escapeHtml(seo.canonicalUrl);

  const cleaned = html
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta\s+(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>\s*/gi, "")
    .replace(/<link\s+rel=["']canonical["'][^>]*>\s*/gi, "");

  const tags = `
  <title>${safeTitle}</title>
  <meta name="description" content="${safeDescription}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <link rel="canonical" href="${safeUrl}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Ravekh">
  <meta property="og:url" content="${safeUrl}">
  <meta property="og:title" content="${safeTitle}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:image" content="${safeImage}">
  <meta property="og:image:secure_url" content="${safeImage}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${safeTitle}">
  <meta name="twitter:description" content="${safeDescription}">
  <meta name="twitter:image" content="${safeImage}">
`;

  return cleaned.replace(/<\/head>/i, `${tags}</head>`);
};

export const handler = async (event) => {
  const businessId = String(event.queryStringParameters?.id ?? "").trim();
  const origin = getOrigin(event);
  const canonicalUrl = getCanonicalUrl(event, origin);

  try {
    const [html, business] = await Promise.all([
      readIndexHtml(),
      fetchBusiness(businessId).catch(() => null),
    ]);
    const seo = buildCatalogSeo(business, canonicalUrl, origin);

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300, s-maxage=900, stale-while-revalidate=86400",
      },
      body: injectSeo(html, seo),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
      body: error instanceof Error ? error.message : "Error generando metadata del catálogo.",
    };
  }
};
