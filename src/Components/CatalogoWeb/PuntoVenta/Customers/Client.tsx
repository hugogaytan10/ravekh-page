import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../../Context/AppContext";
import { getCustomers } from "./Petitions";
import { useNavigate } from "react-router-dom";
import { Customer } from "../Model/Customer";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";
import PeriodSelector from "../Reports/PeriodSelector";

export const Client = () => {
  const { user, store, setShowNavBarBottom } = useContext(AppContext);
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState("today");

  useEffect(() => {
    const loadClients = async () => {
      setLoading(true);
      try {
        const data = await getCustomers(
          user.Token,
          user.Business_Id.toString()
        );
        setClients(data || []);
      } catch (error) {
        console.error("Error loading clients:", error);
        setClients([]);
      } finally {
        setLoading(false);
      }
    };

    if (user?.Business_Id) {
      loadClients();
    }
  }, [user]);

  const filteredClients = clients.filter((client: Customer) =>
    client.Name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderClient = (client) => (
    <button
      key={client.Id}
      className="flex items-center p-4 bg-white shadow rounded-lg hover:bg-gray-100"
      onClick={() => navigate(`/orders-by-customer/${client.Id}/${selectedPeriod}`)}
    >
      <div
        className="flex justify-center items-center w-12 h-12 rounded-full"
        style={{ backgroundColor: store?.Color || "#E0E0E0" }}
      >
        <span className="text-white text-lg font-bold">
          {client.Name
            ? `${client.Name[0]}${client.Name.split(" ")[1]?.[0] || ""}`
            : "NN"}
        </span>
      </div>
      <div className="ml-4 text-left">
        <p className="text-lg font-semibold text-gray-800">{client.Name}</p>
        <p className="text-sm text-gray-600">
          {client.PhoneNumber || "Sin teléfono"}
        </p>
        <p className="text-sm text-gray-600">
          {client.CanPayLater
            ? "Habilitado para pagar después"
            : "No habilitado para pagar después"}
        </p>
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <header
        className="flex items-center justify-between px-2 bg-blue-600 text-white border-none z-50"
        style={{ backgroundColor: store?.Color || "#3B82F6" }}
      >
        <button
          className="p-2 rounded-full hover:bg-blue-700"
          onClick={() => {
            setShowNavBarBottom(true);
            navigate("/more");
          }}
        >
          <ChevronBack />
        </button>
        <h1 className="text-xl font-bold">Clientes</h1>
        <button
          className="bg-white text-blue-600 font-semibold py-2 px-4 rounded-full shadow hover:bg-gray-100"
          onClick={() => navigate("/add-client")}
        >
          Agregar Cliente
        </button>
      </header>

      <PeriodSelector
        selectedPeriod={selectedPeriod}
        onPeriodChange={setSelectedPeriod}
      />

      <div className="p-4">
        <div className="flex items-center mb-4 bg-white shadow rounded-lg p-3">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-6 h-6 text-gray-400 mr-3"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar por nombre o información"
            className="bg-white flex-1 outline-none text-gray-700"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {loading ? (
          <p className="text-center text-gray-600">Cargando clientes...</p>
        ) : clients.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600">No tienes clientes registrados</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredClients.map(renderClient)}
          </div>
        )}
      </div>
    </div>
  );
};
