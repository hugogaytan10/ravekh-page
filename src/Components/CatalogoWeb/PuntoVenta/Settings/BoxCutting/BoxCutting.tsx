import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../../Context/AppContext";
import { Employee } from "../../Model/Employees";
import { useNavigate } from "react-router-dom";
import { getEmployeesByBusiness } from "./Petitions";
import { ChevronBack } from "../../../../../assets/POS/ChevronBack";
import { ChevronGo } from "../../../../../assets/POS/ChevronGo";
export const BoxCutting: React.FC = () => {
  const context = useContext(AppContext);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const navigate = useNavigate();

  const onSelect = (employee: Employee) => {
    navigate("/cutting-by-employee/" + employee.Id);
  };

  useEffect(() => {
    // Fetch employees
    const fetchEmployees = async () => {
      try {
        const data = await getEmployeesByBusiness(
          context.user.Token,
          context.store?.Id?.toString() || ""
        );
        setEmployees(data);
      } catch (error) {
        console.error("Error fetching employees:", error);
      }
    };
    fetchEmployees();
  }, [context.user.Token, context.store.Id]);

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header
        className="flex items-center gap-4 px-4 h-20 text-white"
        style={{ backgroundColor: context.store.Color || "#3B82F6" }}
      >
        <button
          onClick={() => {
            context.setShowNavBarBottom(true);
            navigate(-1)}}
          className="p-2 bg-transparent rounded-full hover:bg-blue-100"
        >
          {/* Reemplazar con el componente SVG ChevronBack */}
          <ChevronBack />
        </button>
        <h1 className="text-lg font-bold">Lista de Empleados</h1>
      </header>

      {/* Employee List */}
      <div className="flex-grow">
        {employees.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {employees.map((employee) => (
              <li
                key={employee.Id}
                className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-100"
                onClick={() => onSelect(employee)}
              >
                <span className="text-gray-800 font-medium">{employee.Name}</span>
                {/* Reemplazar con el componente SVG ChevronGo */}
                <ChevronGo height={24} width={24} />
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-500 py-8">No hay empleados disponibles</p>
        )}
      </div>
    </div>
  );
};


