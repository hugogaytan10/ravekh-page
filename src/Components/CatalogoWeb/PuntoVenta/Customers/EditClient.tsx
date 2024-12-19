import React, { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { updateCustomer, getCustomerById, deleteCustomer } from "./Petitions";
import { Trash } from "../../../../assets/POS/Trash";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";

export const EditClient = () => {
  const { user, store } = useContext(AppContext);
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [permitirPagarDespues, setPermitirPagarDespues] = useState(false);
  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [sex, setSex] = useState("");
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchCustomer = async () => {
      try {
        const customer = await getCustomerById(id || "", user?.Token);
        if (customer) {
          setName(customer.Name);
          setPhoneNumber(customer.PhoneNumber || "");
          setAddress(customer.Address || "");
          setEmail(customer.Email || "");
          setNotes(customer.Notes || "");
          setSex(customer.Sex || "");
          setPermitirPagarDespues(customer.CanPayLater === 1);
        }
      } catch (error) {
        console.error("Error fetching customer:", error);
      }
    };
    fetchCustomer();
  }, [id, user?.Token]);

  const handleSave = () => {
    const updatedCustomer = {
      Id: id ? parseInt(id) : undefined,
      Business_Id: user?.Business_Id,
      Name: name,
      PhoneNumber: phoneNumber,
      Address: address,
      Email: email,
      Notes: notes,
      Sex: sex || "M",
      CanPayLater: permitirPagarDespues,
    };
    updateCustomer(updatedCustomer, user?.Token).then(() => navigate(-1));
  };

  const handleDelete = () => {
    deleteCustomer(id || "", user?.Token);
    setShowModal(false);
    navigate(-1);
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Header */}
      <header
        className="flex items-center justify-between p-4"
        style={{ backgroundColor: store?.Color || "#3B82F6" }}
      >
        <button onClick={() => navigate(-1)} className="text-white">
          <ChevronBack />
        </button>
        <h1 className="text-xl font-bold text-white">Editar Cliente</h1>
        <button onClick={() => setShowModal(true)} className="text-white">
          <Trash fill="#fff" />
        </button>
      </header>

      {/* Formulario */}
      <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium">Nombre del cliente</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white w-full p-3 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Teléfono Celular</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-white w-full p-3 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Teléfono"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Domicilio</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-white w-full p-3 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Dirección"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white w-full p-3 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Correo electrónico"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Sexo</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="bg-white w-full p-3 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Notas</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="bg-white w-full p-3 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales"
            />
          </div>
        </div>

        <div className="flex justify-end mt-6 space-x-4">
          <button
            onClick={handleSave}
            className=" w-full text-white py-2 px-6 rounded-lg hover:bg-green-600 transition duration-300"
            style={{ backgroundColor: store?.Color || "#3B82F6" }}
          >
            Guardar Cambios
          </button>
        
        </div>
      </div>

      {/* Modal de Confirmación */}
      {showModal && (
        <div className="fixed inset-0 flex items-end justify-center bg-black bg-opacity-50">
          <div className="w-full bg-white rounded-t-lg p-6">
            <p className="text-center text-lg font-medium text-gray-800">
              ¿Estás seguro de que deseas eliminar este cliente?
            </p>
            <div className="flex justify-center mt-4 space-x-4">
              <button
                onClick={() => setShowModal(false)}
                className="bg-gray-300 text-gray-700 py-2 px-6 rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                className="bg-red-600 text-white py-2 px-6 rounded-lg hover:bg-red-700 transition duration-300"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
