import React, { useContext, useEffect, useState } from "react";
import { AppContext } from "../../Context/AppContext";
import { getCustomers } from "./Petitions";
import { useNavigate } from "react-router-dom";
import { Customer } from "../Model/Customer";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";

export const ClientSelect: React.FC = () => {
  const { setCustomer, user, store } = useContext(AppContext);
  const [clients, setClients] = useState<Customer[]>([]);
  const [filteredClients, setFilteredClients] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchClients() {
      try {
        setLoading(true);
        const fetchedClients = await getCustomers(
          user.Token,
          user.Business_Id.toString()
        );
        setClients(fetchedClients || []);
        setFilteredClients(fetchedClients || []);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    }

    if (user && user.Business_Id) {
      fetchClients();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const filtered = clients.filter((client) =>
      client.Name?.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchQuery, clients]);

  const selectClient = (client) => {
    setCustomer(client);
    navigate(-1);
  };

  const renderAddClientButton = () => {
    if (user?.Role === "AYUDANTE") return null;

    return (
      <div
        onClick={() => navigate("/add-client-sales")}
        className="flex items-center bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-100"
      >
        <div
          className={`flex items-center justify-center w-12 h-12 rounded-full bg-[${store.Color}] text-white text-xl font-bold`}
        >
          +
        </div>
        <div className="ml-4">
          <p className="text-lg font-semibold text-gray-800">
            Agregar nuevo cliente
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div
        className={`flex items-center  text-white py-4 px-6`}
        style={{ backgroundColor: store.Color }}
      >
        <button
          onClick={() => navigate(-1)}
          className="mr-4 text-xl font-bold"
        >
          <ChevronBack />
        </button>
        <h1 className="text-lg font-bold">Asignar Cliente</h1>
        <div/>
      </div>

      {/* Search Bar */}
      <div className="p-4 bg-white shadow">
        <div className="flex items-center border rounded p-2">
          <input
            type="text"
            placeholder="Buscar por nombre o información"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white outline-none text-gray-700"
          />
        </div>
      </div>

      {/* Client List */}
      <div className="p-4 space-y-4">
        {loading ? (
          <p className="text-center text-gray-600">Cargando clientes...</p>
        ) : filteredClients.length === 0 ? (
          <>
            <p className="text-center text-gray-600">
              No se encontraron clientes.
            </p>
            {renderAddClientButton()}
          </>
        ) : (
          <>
            {renderAddClientButton()}
            {filteredClients.map((client: Customer) => (
              <div
                key={client.Id}
                onClick={() => selectClient(client)}
                className="flex items-center bg-white p-4 rounded shadow cursor-pointer hover:bg-gray-100"
              >
                <div
                  className={`flex items-center justify-center w-12 h-12 rounded-full  text-white text-xl font-bold`}
                  style={{ backgroundColor: store.Color }}

                >
                  {client.Name?.slice(0, 2).toUpperCase() || "NN"}
                </div>
                <div className="ml-4">
                  <p className="text-lg font-semibold text-gray-800">
                    {client.Name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {client.PhoneNumber || "Sin teléfono"}
                  </p>
                  <p className="text-sm text-gray-600">
                    {client.CanPayLater
                      ? "Habilitado para pagar después"
                      : "No habilitado para pagar después"}
                  </p>
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
};
