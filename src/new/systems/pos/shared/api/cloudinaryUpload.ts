const CLOUDINARY_UPLOAD_URL = "https://api.cloudinary.com/v1_1/ravekh/image/upload";
const CLOUDINARY_UPLOAD_PRESET = "ravekh-fotos";
const CLOUDINARY_FOLDER = "diana-fotos";

export const uploadImageToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);
  formData.append("folder", CLOUDINARY_FOLDER);

  const response = await fetch(CLOUDINARY_UPLOAD_URL, {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => null) as { secure_url?: string; error?: { message?: string } } | null;

  if (!response.ok || !payload?.secure_url) {
    throw new Error(payload?.error?.message ?? "No se pudo subir una imagen a Cloudinary.");
  }

  return payload.secure_url;
};
