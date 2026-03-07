import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../Context/AppContext";
import { insertCustomer } from "./Petitions";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";

export const AddClient = () => {
  const { user, store } = useContext(AppContext);
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [address, setAddress] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [sex, setSex] = useState("M");
  const [permitirPagarDespues, setPermitirPagarDespues] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!name.trim() || isSaving) return;

    setIsSaving(true);
    const customerPayload = {
      Business_Id: user?.Business_Id,
      Name: name.trim(),
      PhoneNumber: phoneNumber.trim(),
      Address: address.trim(),
      Email: email.trim(),
      Notes: notes.trim(),
      Sex: sex,
      CanPayLater: permitirPagarDespues,
    };

    const ok = await insertCustomer(customerPayload, user?.Token);
    setIsSaving(false);

    if (ok) {
      navigate("/clients");
    }
  };

  return (
    <div className="bg-white min-h-screen text-gray-900">
      <header
        className="flex items-center justify-between p-4"
        style={{ backgroundColor: store?.Color || "#3B82F6" }}
      >
        <button onClick={() => navigate("/clients")} className="text-white">
          <ChevronBack />
        </button>
        <h1 className="text-xl font-bold text-white">Agregar Cliente</h1>
        <div className="w-6" />
      </header>

      <div className="bg-white shadow-md rounded-lg p-6 max-w-4xl mx-auto mt-4 border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-700 font-medium">Nombre del cliente</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-white text-gray-900 w-full p-3 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Nombre completo"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Teléfono Celular</label>
            <input
              type="text"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="bg-white text-gray-900 w-full p-3 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Teléfono"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Domicilio</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-white text-gray-900 w-full p-3 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Dirección"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white text-gray-900 w-full p-3 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Correo electrónico"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium">Sexo</label>
            <select
              value={sex}
              onChange={(e) => setSex(e.target.value)}
              className="bg-white text-gray-900 w-full p-3 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
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
              className="bg-white text-gray-900 w-full p-3 mt-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              placeholder="Notas adicionales"
            />
          </div>
        </div>

        <div className="flex items-center justify-between mt-6">
          <label className="flex items-center gap-2 text-gray-700 font-medium">
            <input
              type="checkbox"
              checked={permitirPagarDespues}
              onChange={(e) => setPermitirPagarDespues(e.target.checked)}
            />
            Permitir pagar después
          </label>

          <button
            onClick={handleSave}
            disabled={!name.trim() || isSaving}
            className="text-white py-2 px-6 rounded-lg transition duration-300 disabled:opacity-50"
            style={{ backgroundColor: store?.Color || "#3B82F6" }}
          >
            {isSaving ? "Guardando..." : "Guardar Cliente"}
          </button>
        </div>
      </div>
    </div>
  );
};

