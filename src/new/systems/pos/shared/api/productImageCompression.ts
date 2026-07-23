export const PRODUCT_IMAGE_MAX_DIMENSION = 1400;
export const PRODUCT_IMAGE_QUALITY = 0.78;
export const PRODUCT_IMAGE_MAX_FILE_BYTES = 5 * 1024 * 1024;

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

const loadImage = (file: File): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error(`No se pudo leer la imagen ${file.name}.`));
    };

    image.src = objectUrl;
  });

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

/**
 * Mantiene la misma política del flujo normal de productos:
 * - redimensiona con canvas respetando proporción;
 * - conserva PNG como PNG;
 * - JPEG/JPG/WEBP se convierten a JPEG;
 * - devuelve un File listo para enviarse a Cloudinary.
 */
export const compressProductImage = async (
  file: File,
  options: {
    maxDimension?: number;
    quality?: number;
  } = {},
): Promise<ProductImageCompressionResult> => {
  if (!PRODUCT_IMAGE_ACCEPTED_TYPES.has(file.type)) {
    throw new Error(
      `${file.name}: solo se aceptan imágenes JPG, JPEG, PNG o WEBP.`,
    );
  }

  if (file.size > PRODUCT_IMAGE_MAX_FILE_BYTES) {
    throw new Error(`${file.name}: la imagen no puede pesar más de 5 MB.`);
  }

  const maxDimension = Math.max(
    1,
    options.maxDimension ?? PRODUCT_IMAGE_MAX_DIMENSION,
  );
  const quality = Math.min(
    1,
    Math.max(0.1, options.quality ?? PRODUCT_IMAGE_QUALITY),
  );
  const image = await loadImage(file);
  const longestSide = Math.max(image.naturalWidth, image.naturalHeight);
  const ratio = longestSide > maxDimension ? maxDimension / longestSide : 1;
  const width = Math.max(1, Math.round(image.naturalWidth * ratio));
  const height = Math.max(1, Math.round(image.naturalHeight * ratio));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Tu navegador no pudo preparar la imagen seleccionada.");
  }

  // JPEG no soporta transparencia. Se usa blanco como fondo para evitar negro.
  const outputType: "image/jpeg" | "image/png" =
    file.type === "image/png" ? "image/png" : "image/jpeg";

  if (outputType === "image/jpeg") {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }

  context.drawImage(image, 0, 0, width, height);
  const blob = await canvasToBlob(canvas, outputType, quality);

  const convertedFile = new File([blob], file.name, {
    type: outputType,
    lastModified: file.lastModified,
  });

  return {
    file: convertedFile,
    originalBytes: file.size,
    compressedBytes: convertedFile.size,
    width,
    height,
    outputType,
  };
};
