import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { URL } from "../../Const/Const";
import PlusIcon  from "../../../../assets/POS/PlusIcon";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";
import { Employee } from "../Model/Employees";

export const Employees: React.FC = () => {
  const { user, store } = useContext(AppContext);
  const navigate = useNavigate();
    const context = useContext(AppContext);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${URL}employee/business/${user.Business_Id}`);
        const data = await response.json();

        // Excluir al usuario actual de la lista
        const filteredData = data.filter((employee: any) => employee.Id !== user.Id);

        setEmployees(filteredData);
        setFilteredEmployees(filteredData);
      } catch (error) {
        console.error("Error al cargar empleados:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user?.Business_Id) {
      fetchEmployees();
    }
  }, [user.Business_Id]);

  useEffect(() => {
    const filtered = employees.filter(
      (employee) =>
        employee.Name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        employee.Email?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredEmployees(filtered);
  }, [searchQuery, employees]);

  const renderEmployee = (employee: Employee) => (
    <button
      key={employee.Id}
      className="flex items-center p-4 bg-white shadow rounded-lg mb-4 hover:bg-gray-100 transition"
      onClick={() => navigate(`/edit-employee/${employee.Id}`)}
    >
      <div
        className="flex justify-center items-center w-12 h-12 rounded-full"
        style={{ backgroundColor: store?.Color || "#E0E0E0" }}
      >
        <span className="text-white text-lg font-bold">
          {employee.Name
            ? `${employee.Name[0]}${employee.Name.split(" ")[1]?.[0] || ""}`
            : "NN"}
        </span>
      </div>
      <div className="ml-4 text-left">
        <p className="text-lg font-semibold text-gray-800">
          {employee.Name || "Sin nombre"}
        </p>
        <p className="text-sm text-gray-600">{employee.Email}</p>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header
        className="flex items-center justify-between p-2"
        style={{ backgroundColor: store?.Color || "#3B82F6" }}
      >
        <button onClick={() => {
            context.setShowNavBarBottom(true); // hacer visible la barra de navegación inferior 
            navigate(-1)}} className="text-white">
          <ChevronBack />
        </button>
        <h1 className="text-xl font-bold text-white text-center">Empleados</h1>
        <button
          onClick={() => navigate("/new-employee")}
          className="flex items-center text-white font-semibold py-2 px-4 rounded-lg  hover:bg-gray-100 transition"
        >
          <PlusIcon stroke="4" color="#fff" />
          Crear Nuevo
        </button>
      </header>

      {/* Barra de búsqueda */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Buscar empleados"
          className= "bg-white w-full p-3 border rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Lista de empleados */}
      <div className="p-4">
        {loading ? (
          <p className="text-center text-gray-600">Cargando empleados...</p>
        ) : filteredEmployees.length === 0 ? (
          <p className="text-center text-gray-600">No hay empleados registrados.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredEmployees.map(renderEmployee)}
          </div>
        )}
      </div>
    </div>
  );
};
