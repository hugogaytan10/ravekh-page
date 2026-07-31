import { POS_CLOUDINARY_UPLOAD_URL } from "../config/posExternalLinks";

const CLOUDINARY_UPLOAD_PRESET = "ravekh-fotos";
const CLOUDINARY_FOLDER = "diana-fotos";
const MAX_IMAGE_DIMENSION = 1600;
const IMAGE_QUALITY = 0.75;
const SOCIAL_IMAGE_WIDTH = 1200;
const SOCIAL_IMAGE_HEIGHT = 630;
const SOCIAL_IMAGE_QUALITY = 0.85;

const canCompressInBrowser = (): boolean => typeof window !== "undefined" && typeof document !== "undefined";

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

export const getSocialImageRect = (width: number, height: number) => {
  const scale = Math.min(SOCIAL_IMAGE_WIDTH / width, SOCIAL_IMAGE_HEIGHT / height);
  const drawWidth = Math.round(width * scale);
  const drawHeight = Math.round(height * scale);

  return {
    x: Math.round((SOCIAL_IMAGE_WIDTH - drawWidth) / 2),
    y: Math.round((SOCIAL_IMAGE_HEIGHT - drawHeight) / 2),
    width: drawWidth,
    height: drawHeight,
  };
};

const createSocialImage = async (file: File): Promise<File> => {
  if (!canCompressInBrowser() || !file.type.startsWith("image/")) {
    throw new Error("No se pudo preparar la imagen para compartir.");
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error("No se pudo cargar la imagen para compartir."));
      element.src = imageUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = SOCIAL_IMAGE_WIDTH;
    canvas.height = SOCIAL_IMAGE_HEIGHT;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo preparar la imagen para compartir.");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    const rect = getSocialImageRect(image.naturalWidth, image.naturalHeight);
    context.drawImage(image, rect.x, rect.y, rect.width, rect.height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, "image/jpeg", SOCIAL_IMAGE_QUALITY),
    );
    if (!blob) throw new Error("No se pudo preparar la imagen para compartir.");

    return new File([blob], `${file.name.replace(/\.[^.]+$/, "")}-social.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
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

  const payload = await response.json().catch(() => null) as { secure_url?: string; error?: { message?: string } } | null;

  if (!response.ok || !payload?.secure_url) {
    throw new Error(payload?.error?.message ?? "No se pudo subir una imagen a Cloudinary.");
  }

  return payload.secure_url;
};

export const uploadImageToCloudinary = async (file: File): Promise<string> =>
  uploadFile(await compressImage(file));

export const uploadBusinessLogoToCloudinary = async (file: File): Promise<string> => {
  const socialImage = await createSocialImage(file);
  return uploadFile(socialImage);
};
