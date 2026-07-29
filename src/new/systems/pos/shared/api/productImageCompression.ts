export const PRODUCT_IMAGE_MAX_DIMENSION = 1400;
export const PRODUCT_IMAGE_QUALITY = 0.78;
export const PRODUCT_IMAGE_MAX_FILE_BYTES = 5 * 1024 * 1024;
export const PRODUCT_IMAGE_PREVIEW_MAX_DIMENSION = 360;
export const PRODUCT_IMAGE_PREVIEW_QUALITY = 0.72;

export const PRODUCT_IMAGE_ACCEPTED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

export type ProductImageCompressionResult = {
  file: File;
  originalBytes: number;
  compressedBytes: number;
  width: number;
  height: number;
  outputType: "image/jpeg" | "image/png";
};

export type ProductImagePreviewResult = {
  url: string;
  width: number;
  height: number;
};

type DrawableImage = {
  source: CanvasImageSource;
  width: number;
  height: number;
  dispose: () => void;
};

const loadHtmlImage = (file: File): Promise<DrawableImage> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        source: image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        dispose: () => {
          image.src = "";
        },
      });
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`No se pudo leer la imagen ${file.name}.`));
    };

    image.src = objectUrl;
  });

const loadDrawableImage = async (file: File): Promise<DrawableImage> => {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, {
        imageOrientation: "from-image",
      });

      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        dispose: () => bitmap.close(),
      };
    } catch {
      // Safari y algunos navegadores pueden rechazar imageOrientation.
      // Se usa el flujo compatible con HTMLImageElement como respaldo.
    }
  }

  return loadHtmlImage(file);
};

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  outputType: "image/jpeg" | "image/png",
  quality: number,
): Promise<Blob> =>
  new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("No se pudo convertir la imagen seleccionada."));
          return;
        }
        resolve(blob);
      },
      outputType,
      quality,
    );
  });

const renderImage = async (
  file: File,
  options: {
    maxDimension: number;
    quality: number;
    outputType: "image/jpeg" | "image/png";
  },
): Promise<{ blob: Blob; width: number; height: number }> => {
  const drawable = await loadDrawableImage(file);

  try {
    if (!drawable.width || !drawable.height) {
      throw new Error(`${file.name}: la imagen no tiene dimensiones válidas.`);
    }

    const longestSide = Math.max(drawable.width, drawable.height);
    const ratio = longestSide > options.maxDimension
      ? options.maxDimension / longestSide
      : 1;
    const width = Math.max(1, Math.round(drawable.width * ratio));
    const height = Math.max(1, Math.round(drawable.height * ratio));
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;

    const context = canvas.getContext("2d", { alpha: options.outputType === "image/png" });
    if (!context) {
      throw new Error("Tu navegador no pudo preparar la imagen seleccionada.");
    }

    if (options.outputType === "image/jpeg") {
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, width, height);
    }

    context.drawImage(drawable.source, 0, 0, width, height);
    const blob = await canvasToBlob(
      canvas,
      options.outputType,
      options.quality,
    );

    // Liberar la superficie del canvas reduce el uso de memoria al manejar
    // decenas de fotografías en dispositivos móviles.
    canvas.width = 1;
    canvas.height = 1;

    return { blob, width, height };
  } finally {
    drawable.dispose();
  }
};

const assertSupportedProductImage = (file: File): void => {
  if (!PRODUCT_IMAGE_ACCEPTED_TYPES.has(file.type)) {
    throw new Error(
      `${file.name}: solo se aceptan imágenes JPG, JPEG, PNG o WEBP.`,
    );
  }

  if (file.size > PRODUCT_IMAGE_MAX_FILE_BYTES) {
    throw new Error(`${file.name}: la imagen no puede pesar más de 5 MB.`);
  }
};

/**
 * Convierte la fotografía para subirla al catálogo.
 * La imagen ya preparada es la que se envía a Cloudinary; Cloudinary solo la
 * almacena y no necesita aplicar transformaciones de carga.
 */
export const compressProductImage = async (
  file: File,
  options: {
    maxDimension?: number;
    quality?: number;
  } = {},
): Promise<ProductImageCompressionResult> => {
  assertSupportedProductImage(file);

  const maxDimension = Math.max(
    1,
    options.maxDimension ?? PRODUCT_IMAGE_MAX_DIMENSION,
  );
  const quality = Math.min(
    1,
    Math.max(0.1, options.quality ?? PRODUCT_IMAGE_QUALITY),
  );
  const outputType: "image/jpeg" | "image/png" =
    file.type === "image/png" ? "image/png" : "image/jpeg";

  const rendered = await renderImage(file, {
    maxDimension,
    quality,
    outputType,
  });

  const extension = outputType === "image/png" ? ".png" : ".jpg";
  const baseName = file.name.replace(/\.[^.]+$/u, "") || "producto";
  const convertedFile = new File(
    [rendered.blob],
    `${baseName}${extension}`,
    {
      type: outputType,
      lastModified: file.lastModified,
    },
  );

  return {
    file: convertedFile,
    originalBytes: file.size,
    compressedBytes: convertedFile.size,
    width: rendered.width,
    height: rendered.height,
    outputType,
  };
};

/**
 * Genera una miniatura ligera para la lista de selección. Evita que el
 * navegador mantenga decodificadas 30 o más fotografías originales al mismo
 * tiempo, causa común de miniaturas en blanco en móviles.
 */
export const createProductImagePreview = async (
  file: File,
): Promise<ProductImagePreviewResult> => {
  assertSupportedProductImage(file);

  const rendered = await renderImage(file, {
    maxDimension: PRODUCT_IMAGE_PREVIEW_MAX_DIMENSION,
    quality: PRODUCT_IMAGE_PREVIEW_QUALITY,
    outputType: "image/jpeg",
  });

  return {
    url: URL.createObjectURL(rendered.blob),
    width: rendered.width,
    height: rendered.height,
  };
};
