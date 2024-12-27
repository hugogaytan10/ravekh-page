import { URL } from "../Const/Const";

// Función para obtener los detalles de un empleado
export const fetchEmployeeDetails = async (employeeId) => {
  try {
    const url = `${URL}employee/${employeeId}`;
    console.log('URL para la solicitud:', url); // Verifica que la URL sea correcta

    const response = await fetch(url);
    console.log('Estado de la respuesta:', response.status); // Verifica el estado HTTP

    if (!response.ok) {
      throw new Error(`Error al obtener los detalles del empleado: ${response.status} ${response.statusText}`);
    }

    const employee = await response.json();
    console.log('Detalles del empleado recibidos:', employee); // Muestra los datos recibidos
    return employee;
  } catch (error) {
    console.error('Error al cargar los detalles del empleado:', error);
    return null;
  }
};


// Función para actualizar los datos de un empleado
export const updateEmployee = async (employeeId, updatedEmployee) => {
  try {
    const response = await fetch(`${URL}employee/${employeeId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedEmployee),
    });
    return response.ok;
  } catch (error) {
    console.error('Error en la solicitud de actualización:', error);
    return false;
  }
};

// Función para eliminar un empleado
export const deleteEmployee = async (employeeId) => {
  try {
    const response = await fetch(`${URL}employee/${employeeId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.ok;
  } catch (error) {
    console.error('Error al eliminar el empleado:', error);
    return false;
  }
};

export const fetchEmployees = async (businessId) => {
  try {
    const response = await fetch(`${URL}/business/${businessId}`);
    if (!response.ok) {
      throw new Error('Error al obtener los empleados');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error al cargar empleados:', error);
    return [];
  }
};