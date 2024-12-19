import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { URL } from "../../Const/Const";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";

export const NewEmployee: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [role, setRole] = useState("AYUDANTE");
  const [loading, setLoading] = useState(false);
  const [selectedTab, setSelectedTab] = useState("info");
  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const [errors, setErrors] = useState({
    name: "",
    email: "",
    password: "",
    pin: "",
  });

  const roles = [
    {
      title: "Gerente",
      value: "GERENTE",
      description:
        "Puede gestionar ventas, inventario y clientes, pero no tiene acceso a funciones administrativas avanzadas como la gestión de permisos o la eliminación de otros empleados.",
    },
    {
      title: "Ayudante",
      value: "AYUDANTE",
      description:
        "Solo puede realizar ventas y ver el inventario, pero no puede modificar ni acceder a otras funciones más avanzadas. No tiene permisos para modificar la información del cliente ni de finanzas.",
    },
  ];

  const handleAddEmployee = async () => {
    let newErrors = { name: "", email: "", password: "", pin: "" };
    let hasErrors = false;

    if (!name) {
      newErrors.name = "El nombre es obligatorio";
      hasErrors = true;
    }
    if (!email) {
      newErrors.email = "El email es obligatorio";
      hasErrors = true;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Formato de email inválido";
      hasErrors = true;
    }
    if (!password) {
      newErrors.password = "La contraseña es obligatoria";
      hasErrors = true;
    } else if (password.length < 6) {
      newErrors.password = "La contraseña debe tener al menos 6 caracteres";
      hasErrors = true;
    }
    if (!pin) {
      newErrors.pin = "El PIN es obligatorio";
      hasErrors = true;
    } else if (pin.length !== 4) {
      newErrors.pin = "El PIN debe tener 4 dígitos";
      hasErrors = true;
    }

    if (hasErrors) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);

    const employeeData = {
      Role: role,
      Business_Id: context.user.Business_Id,
      Name: name,
      Email: email,
      Password: password,
      Pin: pin,
    };

    try {
      const response = await fetch(`${URL}/employee`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(employeeData),
      });

      const result = await response.json();

      if (response.ok) {
        setModalMessage("Empleado agregado exitosamente.");
        setModalVisible(true);
        navigate(-1);
      } else {
        setModalMessage("Error al agregar el empleado.");
        setModalVisible(true);
        console.error(result);
      }
    } catch (error) {
      setModalMessage("Error en la conexión. Por favor, inténtalo de nuevo.");
      setModalVisible(true);
      console.error("Error al agregar empleado:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header
        className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white"
        style={{ backgroundColor: context.store.Color || "#3B82F6" }}
      >
        <button
          onClick={() => navigate(-1)}
          className=" text-blue-600 font-semibold p-1  rounded-full shadow hover:bg-gray-100"
        >
          <ChevronBack />
        </button>
        <h1 className="text-xl font-bold">Nuevo Empleado</h1>
        <div/>
      </header>

      <div className="flex justify-center mt-4">
        <button
          onClick={() => setSelectedTab("info")}
          className={`py-2 px-4 font-semibold text-sm rounded-lg shadow-md mx-2 ${
            selectedTab === "info"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Información
        </button>
        <button
          onClick={() => setSelectedTab("roles")}
          className={`py-2 px-4 font-semibold text-sm rounded-lg shadow-md mx-2 ${
            selectedTab === "roles"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Roles
        </button>
      </div>

      {selectedTab === "info" && (
        <div className="bg-white shadow-md rounded-lg p-6 mx-4 mt-4">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Nombre</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo"
              className="bg-white h-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="bg-white h-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="bg-white h-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">PIN</label>
            <input
              type="number"
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              placeholder="PIN de 4 dígitos"
              className="bg-white h-10 mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
            {errors.pin && <p className="text-red-500 text-sm mt-1">{errors.pin}</p>}
          </div>

          <button
            onClick={handleAddEmployee}
            className={`w-full py-2 px-4 mt-4 text-white rounded-lg shadow ${
              loading ? "bg-gray-400" : "bg-green-600 hover:bg-green-700"
            }`}
            style={{ backgroundColor: context.store.Color || "#3B82F6" }}
            disabled={loading}
          >
            {loading ? "Guardando..." : "Agregar Empleado"}
          </button>
        </div>
      )}

      {selectedTab === "roles" && (
        <div className="bg-white shadow-md rounded-lg p-6 mx-4 mt-4">
          <h2 className="text-lg font-bold mb-4">Selecciona un rol</h2>
          {roles.map((roleOption) => (
            <div
              key={roleOption.value}
              className={`p-4 mb-4 border rounded-lg shadow-md cursor-pointer ${
                role === roleOption.value
                  ? "border-blue-600 bg-blue-100"
                  : "border-gray-300 bg-white"
              }`}
              onClick={() => setRole(roleOption.value)}
            >
              <h3 className="text-lg font-bold text-blue-600">{roleOption.title}</h3>
              <p className="text-sm text-gray-700">{roleOption.description}</p>
            </div>
          ))}
        </div>
      )}

      {modalVisible && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 md:w-1/3">
            <p className="text-center mb-4">{modalMessage}</p>
            <button
              onClick={() => setModalVisible(false)}
              className="w-full py-2 px-4 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

