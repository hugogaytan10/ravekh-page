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
  