const DEFAULT_SITE_NAME = "Ravekh";
const DEFAULT_TITLE = "Catálogo digital | Ravekh";
const DEFAULT_DESCRIPTION = "Explora productos, revisa detalles y realiza pedidos desde el catálogo digital de Ravekh.";
const DEFAULT_IMAGE_PATH = "/ravekh.png";

const escapeHtml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

const ensureTrailingSlash = (value) => {
  const normalized = String(value ?? "").trim();
  if (!normalized) return "";
  return normalized.endsWith("/") ? normalized : `${normalized}/`;
};

const getApiBaseUrl = () =>
  ensureTrailingSlash(
    process.env.VITE_API_URL ||
      process.env.API_URL ||
      process.env.FACTURA_ELECTRONICA_API_URL,
  );

const toAbsoluteUrl = (value, origin) => {
  const normalized = String(value ?? "").trim();
  return !normalized
    ? `${origin}${DEFAULT_IMAGE_PATH}`
    : /^https?:\/\//i.test(normalized)
      ? normalized
      : new URL(normalized.startsWith("/") ? normalized : `/${normalized}`, origin).toString();
};

const buildSocialImageUrl = (image, origin) => {
  const source = new URL(image, origin);
  if (source.origin !== origin && source.hostname !== "res.cloudinary.com") return image;

  const params = new URLSearchParams({
    url: source.origin === origin ? `${source.pathname}${source.search}` : source.toString(),
    w: "1200",
    h: "630",
    fit: "contain",
    fm: "jpg",
    q: "80",
  });
  return `${origin}/.netlify/images?${params}`;
};

const fetchBusiness = async (businessId) => {
  const apiBaseUrl = getApiBaseUrl();
  if (!apiBaseUrl || !businessId) return null;

  const response = await fetch(`${apiBaseUrl}business/${encodeURIComponent(businessId)}`, {
    headers: { accept: "application/json" },
  });

  if (!response.ok) return null;
  return response.json();
};

const buildMetadata = (requestUrl, business) => {
  const name = String(business?.Name ?? business?.name ?? "").trim();
  const logo = String(business?.Logo ?? business?.logo ?? "").trim();
  const title = name ? `${name} | Catálogo digital` : DEFAULT_TITLE;
  const description = name ? `Explora productos y realiza pedidos en el catálogo digital de ${name}.` : DEFAULT_DESCRIPTION;
  const image = buildSocialImageUrl(toAbsoluteUrl(logo, requestUrl.origin), requestUrl.origin);
  const url = `${requestUrl.origin}${requestUrl.pathname}`;

  return { title, description, image, url, siteName: name || DEFAULT_SITE_NAME };
};

const fetchImageMetadata = async (image) => {
  try {
    const response = await fetch(image, { method: "HEAD" });
    if (!response.ok) return {};
    const dimensions = response.headers.get("server-timing")?.match(/width=(\d+),height=(\d+)/);

    return {
      imageType: response.headers.get("content-type")?.split(";")[0],
      imageWidth: dimensions?.[1],
      imageHeight: dimensions?.[2],
    };
  } catch {
    return {};
  }
};

const renderMetaTags = ({ title, description, image, url, siteName, imageType, imageWidth, imageHeight }) => `
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${escapeHtml(url)}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="${escapeHtml(siteName)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(url)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="og:image:secure_url" content="${escapeHtml(image)}">
  ${imageType ? `<meta property="og:image:type" content="${escapeHtml(imageType)}">` : ""}
  ${imageWidth ? `<meta property="og:image:width" content="${escapeHtml(imageWidth)}">` : ""}
  ${imageHeight ? `<meta property="og:image:height" content="${escapeHtml(imageHeight)}">` : ""}
  <meta property="og:image:alt" content="${escapeHtml(siteName)}">
  <meta property="og:locale" content="es_MX">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(image)}">
`;

const stripExistingMetadata = (html) =>
  html
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(/<meta\s+(?:name|property)=["'](?:description|og:[^"']+|twitter:[^"']+)["'][^>]*>/gi, "")
    .replace(/<link\s+rel=["']canonical["'][^>]*>/gi, "");

export default async (request, context) => {
  const requestUrl = new URL(request.url);
  const businessId = context.params.id ?? "";

  const [pageResponse, business] = await Promise.all([
    fetch(new URL("/index.html", requestUrl)),
    fetchBusiness(businessId).catch((error) => {
      console.error("Unable to load catalog metadata", error);
      return null;
    }),
  ]);

  const html = await pageResponse.text();
  const metadata = buildMetadata(requestUrl, business);
  const imageMetadata = await fetchImageMetadata(metadata.image);
  const enrichedHtml = stripExistingMetadata(html).replace(
    /<head>/i,
    `<head>${renderMetaTags({ ...metadata, ...imageMetadata })}`,
  );
  return new Response(enrichedHtml, {
    status: pageResponse.status,
    statusText: pageResponse.statusText,
    headers: {
      "content-type": "text/html; charset=UTF-8",
      "cache-control": "public, max-age=0, must-revalidate",
      "netlify-cdn-cache-control":
        "public, durable, max-age=300, stale-while-revalidate=31536000",
    },
  });
};

export const config = {
  path: "/v2/catalogo/:id",
};
