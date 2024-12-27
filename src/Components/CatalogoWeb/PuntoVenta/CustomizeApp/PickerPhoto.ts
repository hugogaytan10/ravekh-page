// PANTALLA DONDE SELECCIONA EL LOGO DE LA APLICACIÓN
export const PickerPhoto = async (): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Crear un input de tipo "file" para seleccionar imágenes
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    
    // Escuchar el cambio en el input cuando el usuario seleccione un archivo
    input.onchange = async () => {
      const file = input.files ? input.files[0] : null;
      if (file) {
        try {
          const fileReader = new FileReader();
          
          // Leer el archivo como una URL de datos
          fileReader.onload = () => {
            if (fileReader.result) {
              resolve(fileReader.result as string);
            } else {
              resolve("error");
            }
          };
          
          // Manejar errores al leer el archivo
          fileReader.onerror = () => resolve("error");
          
          fileReader.readAsDataURL(file);
        } catch (error) {
          resolve("error");
        }
      } else {
        resolve("error");
      }
    };
    
    // Abrir el diálogo de selección de archivos
    input.click();
  });
};
