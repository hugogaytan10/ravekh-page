export const validateAccountSettings = (name: string, password: string): string => {
  if (!name.trim()) return "Ingresa el nombre del usuario.";
  if (password && (password.length < 6 || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password))) {
    return "La contraseña debe tener al menos 6 caracteres, un número y un carácter especial.";
  }
  return "";
};

export const canDeleteOwnAccount = (employeeId: number, confirmation: string): boolean =>
  Number.isInteger(employeeId) && employeeId > 0 && confirmation === "ELIMINAR";
