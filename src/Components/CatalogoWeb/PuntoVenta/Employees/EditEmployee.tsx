import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { fetchEmployeeDetails, updateEmployee, deleteEmployee } from "./Petitions";

export const EditEmployee: React.FC = () => {
  const { employeeId } = useParams<{ employeeId: string }>();
  const navigate = useNavigate();
  const { store } = useContext(AppContext);

  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [pin, setPin] = useState<string>("");
  const [selectedTab, setSelectedTab] = useState<string>("info");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [modalMessage, setModalMessage] = useState<string>("");
  const [onConfirm, setOnConfirm] = useState<(() => void) | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const employee = await fetchEmployeeDetails(employeeId || "");
      if (employee) {
        setName(employee.Name);
        setEmail(employee.Email);
        setPassword("");
        setPin("");
        setSelectedRole(employee.Role);
      }
    };
    fetchData();
  }, [employeeId]);

  const handleSave = async () => {
    if (!selectedRole) {
      setModalMessage("Debes seleccionar un rol antes de guardar.");
      setModalVisible(true);
      return;
    }

    const updatedEmployee = {
      Name: name,
      Email: email,
      Password: password,
      Pin: pin,
      Role: selectedRole,
    };

    const success = await updateEmployee(employeeId || "", updatedEmployee);
    setModalMessage(
      success ? "Empleado actualizado correctamente." : "No se pudo actualizar el empleado."
    );
    setModalVisible(true);
    if (success) navigate("/employees");
  };

  const handleDelete = async () => {
    const success = await deleteEmployee(employeeId || "");
    setModalMessage(
      success ? "Empleado eliminado correctamente." : "No se pudo eliminar el empleado."
    );
    setModalVisible(true);
    if (success) navigate("/employees");
  };

  const confirmDelete = () => {
    setModalMessage("¿Está seguro que desea eliminar este empleado? Esta acción no se puede deshacer.");
    setOnConfirm(() => handleDelete);
    setModalVisible(true);
  };

  const roles = [
    {
      title: "Gerente",
      value: "GERENTE",
      description:
        "Puede gestionar ventas, inventario y clientes, pero no tiene acceso a funciones administrativas avanzadas.",
    },
    {
      title: "Ayudante",
      value: "AYUDANTE",
      description:
        "Solo puede realizar ventas y ver el inventario, pero no puede modificar ni acceder a funciones avanzadas.",
    },
  ];

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header
        className="flex items-center justify-between px-4 py-3 bg-blue-600 text-white"
        style={{ backgroundColor: store?.Color || "#3B82F6" }}
      >
        <button
          onClick={() => navigate("/employees")}
          className="text-white hover:bg-blue-700 rounded-full p-2"
        >
          &#8592; Volver
        </button>
        <h1 className="text-lg font-bold">Editar Empleado</h1>
      </header>

      {/* Tabs */}
      <div className="flex justify-around bg-white py-4">
        {[
          { label: "Info", key: "info" },
          { label: "Roles", key: "roles" },
          { label: "Eliminar", key: "delete" },
        ].map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 text-sm font-medium rounded-md ${
              selectedTab === tab.key
                ? "bg-blue-600 text-white"
                : "text-gray-700 hover:bg-gray-100"
            }`}
            onClick={() => setSelectedTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4">
        {/* Info Tab */}
        {selectedTab === "info" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">PIN</label>
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <button
              onClick={handleSave}
              className="w-full bg-green-500 text-white py-2 rounded-md mt-4 hover:bg-green-600"
            >
              Guardar Cambios
            </button>
          </div>
        )}

        {/* Roles Tab */}
        {selectedTab === "roles" && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-700">Selecciona un Rol</h2>
            {roles.map((role) => (
              <button
                key={role.value}
                onClick={() => setSelectedRole(role.value)}
                className={`w-full text-left p-4 border rounded-md ${
                  selectedRole === role.value
                    ? "border-blue-600 bg-blue-100"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
              >
                <h3 className="text-blue-600 font-semibold">{role.title}</h3>
                <p className="text-gray-600 text-sm">{role.description}</p>
              </button>
            ))}
          </div>
        )}

        {/* Delete Tab */}
        {selectedTab === "delete" && (
          <div className="text-center space-y-4">
            <p className="text-red-600 font-semibold">
              Advertencia: Esta acción no se puede deshacer.
            </p>
            <button
              onClick={confirmDelete}
              className="bg-red-500 text-white py-2 px-4 rounded-md hover:bg-red-600"
            >
              Eliminar Empleado
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-md shadow-lg w-80">
            <p className="text-center text-lg mb-4">{modalMessage}</p>
            {onConfirm ? (
              <div className="flex justify-around">
                <button
                  onClick={() => setModalVisible(false)}
                  className="bg-gray-300 text-black py-2 px-4 rounded hover:bg-gray-400"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    setModalVisible(false);
                    if (onConfirm) onConfirm();
                  }}
                  className="bg-red-500 text-white py-2 px-4 rounded hover:bg-red-600"
                >
                  Confirmar
                </button>
              </div>
            ) : (
              <button
                onClick={() => setModalVisible(false)}
                className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 w-full"
              >
                Aceptar
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};