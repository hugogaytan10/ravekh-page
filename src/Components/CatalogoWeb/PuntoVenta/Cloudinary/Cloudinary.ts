/*
export const uploadImage = async (uri: string | undefined) => {
    const cloudName = 'ravekh';
    const preset = 'ravekh-fotos';
  
    // Crear un objeto FormData
    const formData = new FormData();
    // Agregar el archivo directamente con su URI, tipo y nombre
    formData.append('file', {
      uri: uri,
      type: 'image/jpeg',  // Asegúrate de que el tipo MIME corresponde al tipo de archivo
      name: 'upload.jpg'
    });
    formData.append('upload_preset', preset);
  
    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
          // Eliminar el encabezado 'Content-Type', dejando que fetch establezca el correcto
          // con el límite adecuado para 'multipart/form-data'
        },
      );
  
      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      return '';
    }
  };
  */
  
  export const uploadImage = async (file: any) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "ravekh-fotos"); // Reemplaza 'tu_upload_preset' con tu propio upload preset
    formData.append("folder", "diana-fotos"); // Especifica el nombre de la carpeta donde quieres subir el archivo

    try {
      const response = await fetch(
        "https://api.cloudinary.com/v1_1/ravekh/image/upload",
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      if (data) {
        return data.secure_url;
      }
      // Aquí puedes seguir procesando la respuesta, por ejemplo, guardar la URL de la imagen
    } catch (error) {
      console.error("Error al subir la imagen:", error);
    }
  };
