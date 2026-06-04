import type { ManagedProduct } from "../../products/model/ManagedProduct";

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const MARGIN = 42;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;
const IMAGE_SIZE = 92;
const GAP = 12;

type PdfImage = {
  alias: string;
  data: string;
  width: number;
  height: number;
};

type ProductPdfItem = {
  product: ManagedProduct;
  images: PdfImage[];
};

type PdfPage = {
  commands: string[];
  imageAliases: Set<string>;
};

const normalizeText = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const escapePdfText = (value: string): string =>
  normalizeText(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");

const formatCurrency = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) return "Sin precio";
  return `$${value.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
};

const formatStock = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) return "Stock no definido";
  return `Stock: ${value}`;
};

const uniqueImageUrls = (product: ManagedProduct): string[] => {
  const seen = new Set<string>();
  const urls = [product.image, ...product.images]
    .filter((url): url is string => Boolean(url?.trim()))
    .map((url) => url.trim());

  return urls.filter((url) => {
    if (seen.has(url)) return false;
    seen.add(url);
    return true;
  });
};

const toAbsoluteImageUrl = (url: string, apiBaseUrl: string): string => {
  if (/^https?:\/\//i.test(url) || url.startsWith("data:")) return url;
  return new URL(url.startsWith("/") ? url.slice(1) : url, apiBaseUrl).toString();
};

const loadImageAsJpeg = async (url: string): Promise<{ data: string; width: number; height: number } | null> =>
  new Promise((resolve) => {
    const image = new Image();
    const timeout = window.setTimeout(() => resolve(null), 8000);

    image.crossOrigin = "anonymous";
    image.onload = () => {
      window.clearTimeout(timeout);
      try {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;
        const context = canvas.getContext("2d");

        if (!context || canvas.width === 0 || canvas.height === 0) {
          resolve(null);
          return;
        }

        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);
        resolve({
          data: canvas.toDataURL("image/jpeg", 0.82).split(",")[1] ?? "",
          width: canvas.width,
          height: canvas.height,
        });
      } catch {
        resolve(null);
      }
    };
    image.onerror = () => {
      window.clearTimeout(timeout);
      resolve(null);
    };
    image.src = url;
  });

const wrapText = (text: string, maxChars: number): string[] => {
  const words = normalizeText(text).split(" ").filter(Boolean);
  const lines: string[] = [];
  let current = "";

  words.forEach((word) => {
    const next = current ? `${current} ${word}` : word;
    if (next.length > maxChars && current) {
      lines.push(current);
      current = word;
    } else {
      current = next;
    }
  });

  if (current) lines.push(current);
  return lines.length > 0 ? lines : [""];
};

const textCommand = (text: string, x: number, y: number, size = 10, font = "F1"): string =>
  `BT /${font} ${size} Tf ${x.toFixed(2)} ${y.toFixed(2)} Td (${escapePdfText(text)}) Tj ET`;

const rectCommand = (x: number, y: number, width: number, height: number): string =>
  `0.90 0.92 0.95 RG ${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re S`;

const imageCommand = (image: PdfImage, x: number, y: number, boxWidth: number, boxHeight: number): string => {
  const scale = Math.min(boxWidth / image.width, boxHeight / image.height);
  const width = image.width * scale;
  const height = image.height * scale;
  const centeredX = x + (boxWidth - width) / 2;
  const centeredY = y + (boxHeight - height) / 2;
  return `q ${width.toFixed(2)} 0 0 ${height.toFixed(2)} ${centeredX.toFixed(2)} ${centeredY.toFixed(2)} cm /${image.alias} Do Q`;
};

const buildPdfItems = async (products: ManagedProduct[], apiBaseUrl: string): Promise<{ items: ProductPdfItem[]; images: PdfImage[] }> => {
  const images: PdfImage[] = [];
  let imageIndex = 1;

  const items = await Promise.all(
    products.map(async (product) => {
      const productImages: PdfImage[] = [];
      for (const url of uniqueImageUrls(product)) {
        const absoluteUrl = toAbsoluteImageUrl(url, apiBaseUrl);
        const loaded = await loadImageAsJpeg(absoluteUrl);
        if (!loaded?.data) continue;
        const pdfImage = { alias: `Im${imageIndex}`, ...loaded };
        imageIndex += 1;
        images.push(pdfImage);
        productImages.push(pdfImage);
      }

      return { product, images: productImages };
    }),
  );

  return { items, images };
};

const buildPages = (items: ProductPdfItem[]): PdfPage[] => {
  const pages: PdfPage[] = [{ commands: [], imageAliases: new Set<string>() }];
  let page = pages[0];
  let y = PAGE_HEIGHT - MARGIN;

  page.commands.push(textCommand("Catalogo de productos", MARGIN, y, 18, "F2"));
  y -= 24;
  page.commands.push(textCommand(`Generado: ${new Date().toLocaleString("es-MX")}`, MARGIN, y, 9));
  y -= 28;

  const newPage = () => {
    page = { commands: [], imageAliases: new Set<string>() };
    pages.push(page);
    y = PAGE_HEIGHT - MARGIN;
  };

  items.forEach(({ product, images }) => {
    const descriptionLines = wrapText(product.description || "Sin descripcion", 68).slice(0, 3);
    const imageRows = Math.max(1, Math.ceil(Math.max(images.length, 1) / 4));
    const imageBlockHeight = images.length > 0 ? imageRows * IMAGE_SIZE + (imageRows - 1) * GAP + 12 : 0;
    const cardHeight = 104 + imageBlockHeight + descriptionLines.length * 12;

    if (y - cardHeight < MARGIN) {
      newPage();
    }

    page.commands.push(rectCommand(MARGIN, y - cardHeight, CONTENT_WIDTH, cardHeight));
    page.commands.push(textCommand(product.name || "Producto sin nombre", MARGIN + 12, y - 20, 13, "F2"));
    page.commands.push(textCommand(`Categoria: ${product.categoryName ?? "Sin categoria"}`, MARGIN + 12, y - 38, 9));
    page.commands.push(textCommand(`Precio: ${formatCurrency(product.price)} | ${formatStock(product.stock)}`, MARGIN + 12, y - 52, 9));
    page.commands.push(textCommand(`Codigo: ${product.barcode ?? "Sin codigo"}`, MARGIN + 12, y - 66, 9));

    let textY = y - 84;
    descriptionLines.forEach((line) => {
      page.commands.push(textCommand(line, MARGIN + 12, textY, 9));
      textY -= 12;
    });

    if (images.length > 0) {
      const startY = textY - IMAGE_SIZE - 6;
      images.forEach((image, index) => {
        const column = index % 4;
        const row = Math.floor(index / 4);
        const x = MARGIN + 12 + column * (IMAGE_SIZE + GAP);
        const imageY = startY - row * (IMAGE_SIZE + GAP);
        page.imageAliases.add(image.alias);
        page.commands.push(rectCommand(x, imageY, IMAGE_SIZE, IMAGE_SIZE));
        page.commands.push(imageCommand(image, x, imageY, IMAGE_SIZE, IMAGE_SIZE));
      });
    } else {
      page.commands.push(textCommand("Sin imagen disponible", MARGIN + 12, textY - 8, 9));
    }

    y -= cardHeight + 14;
  });

  return pages;
};

const base64ToBinaryString = (base64: string): string => {
  const binary = window.atob(base64);
  let output = "";
  for (let index = 0; index < binary.length; index += 1) {
    output += String.fromCharCode(binary.charCodeAt(index));
  }
  return output;
};

const createPdfBlob = (pages: PdfPage[], images: PdfImage[]): Blob => {
  const objects: string[] = [];
  const addObject = (body: string): number => {
    objects.push(body);
    return objects.length;
  };

  const catalogId = addObject("");
  const pagesId = addObject("");
  const fontRegularId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
  const fontBoldId = addObject("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>");

  const imageObjectIds = new Map<string, number>();
  images.forEach((image) => {
    const data = base64ToBinaryString(image.data);
    const id = addObject(`<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${data.length} >>\nstream\n${data}\nendstream`);
    imageObjectIds.set(image.alias, id);
  });

  const pageIds: number[] = [];
  pages.forEach((page) => {
    const content = page.commands.join("\n");
    const contentId = addObject(`<< /Length ${content.length} >>\nstream\n${content}\nendstream`);
    const xObjects = Array.from(page.imageAliases)
      .map((alias) => `/${alias} ${imageObjectIds.get(alias) ?? 0} 0 R`)
      .join(" ");
    const resources = `<< /Font << /F1 ${fontRegularId} 0 R /F2 ${fontBoldId} 0 R >>${xObjects ? ` /XObject << ${xObjects} >>` : ""} >>`;
    const pageId = addObject(`<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources ${resources} /Contents ${contentId} 0 R >>`);
    pageIds.push(pageId);
  });

  objects[catalogId - 1] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets = [0];
  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  const bytes = new Uint8Array(pdf.length);
  for (let index = 0; index < pdf.length; index += 1) {
    bytes[index] = pdf.charCodeAt(index) & 0xff;
  }

  return new Blob([bytes], { type: "application/pdf" });
};

export const downloadProductsCatalogPdf = async (products: ManagedProduct[], apiBaseUrl: string): Promise<void> => {
  const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name, "es", { sensitivity: "base" }));
  const { items, images } = await buildPdfItems(sortedProducts, apiBaseUrl);
  const pages = buildPages(items);
  const blob = createPdfBlob(pages, images);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `productos-${new Date().toISOString().slice(0, 10)}.pdf`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
