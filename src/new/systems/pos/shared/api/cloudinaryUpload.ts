import { POS_CLOUDINARY_UPLOAD_URL } from "../config/posExternalLinks";

const CLOUDINARY_UPLOAD_PRESET = "ravekh-fotos";
const CLOUDINARY_FOLDER = "diana-fotos";
const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.75;

const canCompressInBrowser = (): boolean => typeof window !== "undefined" && typeof document !== "undefined";

export const getBusinessLogoDimensionWarning = async (file: File): Promise<string> => {
  if (!canCompressInBrowser() || !file.type.startsWith("image/")) return "";

  const imageUrl = URL.createObjectURL(file);
  try {
    const { naturalWidth: width, naturalHeight: height } = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("No se pudieron leer las dimensiones de la imagen."));
      image.src = imageUrl;
    });

    return width === height && width >= 800
      ? ""
      : `La imagen mide ${width} × ${height} px. Recomendamos una imagen cuadrada de al menos 800 × 800 px. Puedes usarla de todos modos.`;
  } catch {
    return "";
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

const compressImage = async (file: File): Promise<File> => {
  if (!canCompressInBrowser() || !file.type.startsWith("image/")) {
    return file;
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("No se pudo cargar la imagen para comprimirla."));
      element.src = imageUrl;
    });

    const maxSide = Math.max(image.width, image.height);
    const ratio = maxSide > MAX_IMAGE_DIMENSION ? MAX_IMAGE_DIMENSION / maxSide : 1;
    const targetWidth = Math.max(1, Math.round(image.width * ratio));
    const targetHeight = Math.max(1, Math.round(image.height * ratio));

    const canvas = document.createElement("canvas");
    canvas.width = targetWidth;
    canvas.height = targetHeight;

    const context = canvas.getContext("2d");
    if (!context) {
      return file;
    }

    context.drawImage(image, 0, 0, targetWidth, targetHeight);

    const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, outputType, IMAGE_QUALITY));

    if (!blob || blob.size >= file.size) {
      return file;
    }

    return new File([blob], file.name, {
      type: outputType,
      lastModified: Date.now(),
    });
  } catch {
    return file;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
};

const uploadFile = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", CLOUDINARY_FOLDER);

  const response = await fetch(POS_CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => null) as { secure_url?: string } | null;

  if (!response.ok || !payload?.secure_url) {
    throw new Error("No se pudo subir la imagen. Intenta de nuevo.");
  }

  return payload.secure_url;
};

export const uploadImageToCloudinary = async (file: File): Promise<string> =>
  uploadFile(await compressImage(file));

export const uploadBusinessLogoToCloudinary = async (file: File): Promise<string> =>
  uploadFile(await compressImage(file));
