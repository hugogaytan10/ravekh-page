const DEFAULT_SITE_NAME = "Ravekh";
const DEFAULT_TITLE = "Catálogo digital | Ravekh";
const DEFAULT_DESCRIPTION = "Explora productos, revisa detalles y realiza pedidos desde el catálogo digital de Ravekh.";
const DEFAULT_IMAGE_PATH = "/ravekh.png";
const SOCIAL_IMAGE_WIDTH = "1200";
const SOCIAL_IMAGE_HEIGHT = "630";
const CLOUDINARY_FACEBOOK_TRANSFORM = "c_pad,b_white,g_center,w_1200,h_630,f_jpg,q_auto";

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

const getEnv = (name) => {
  if (globalThis.Deno?.env?.get) return globalThis.Deno.env.get(name) ?? "";
  return "";
};

const getApiBaseUrl = () =>
  ensureTrailingSlash(getEnv("VITE_API_URL") || getEnv("API_URL") || getEnv("FACTURA_ELECTRONICA_API_URL"));

const getBusinessId = (url) => {
  const match = url.pathname.match(/^\/v2\/catalogo\/([^/?#]+)/i);
  return match ? decodeURIComponent(match[1]) : "";
};

const addCloudinaryFacebookTransform = (imageUrl) => {
  const parsedUrl = new URL(imageUrl);
  if (!parsedUrl.hostname.includes("cloudinary.com") || !parsedUrl.pathname.includes("/upload/")) return imageUrl;

  parsedUrl.pathname = parsedUrl.pathname.replace("/upload/", `/upload/${CLOUDINARY_FACEBOOK_TRANSFORM}/`);
  return parsedUrl.toString();
};

const toAbsoluteUrl = (value, origin) => {
  const normalized = String(value ?? "").trim();
  const absoluteUrl = !normalized
    ? `${origin}${DEFAULT_IMAGE_PATH}`
    : /^https?:\/\//i.test(normalized)
      ? normalized
      : new URL(normalized.startsWith("/") ? normalized : `/${normalized}`, origin).toString();

  return addCloudinaryFacebookTransform(absoluteUrl);
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
  const image = toAbsoluteUrl(logo, requestUrl.origin);
  const url = `${requestUrl.origin}${requestUrl.pathname}`;
  const siteName = name || DEFAULT_SITE_NAME;

  return { title, description, image, url, siteName };
};

const renderMetaTags = ({ title, description, image, url, siteName }) => `
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
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:width" content="${SOCIAL_IMAGE_WIDTH}">
  <meta property="og:image:height" content="${SOCIAL_IMAGE_HEIGHT}">
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
  const response = await context.next();
  const contentType = response.headers.get("content-type") ?? "";

  if (!contentType.includes("text/html")) return response;

  let business = null;
  try {
    business = await fetchBusiness(getBusinessId(requestUrl));
  } catch (error) {
    console.error("Unable to load catalog metadata", error);
  }

  const html = await response.text();
  const metadata = buildMetadata(requestUrl, business);
  const enrichedHtml = stripExistingMetadata(html).replace(/<head>/i, `<head>${renderMetaTags(metadata)}`);

  const headers = new Headers(response.headers);
  headers.delete("content-length");
  headers.set("cache-control", "public, max-age=0, must-revalidate");

  return new Response(enrichedHtml, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
};
