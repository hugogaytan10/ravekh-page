import { useMemo, useState, type FC, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

type PosTable = {
  id: string;
  name: string;
  enabled: boolean;
};

const defaultTables: PosTable[] = [
  { id: "1", name: "Mesa 1", enabled: true },
  { id: "2", name: "Mesa 2", enabled: true },
  { id: "3", name: "Terraza", enabled: false },
];

const sectionStyle = { padding: 24, maxWidth: 760, margin: "0 auto" };

const Card: FC<{ title: string; description: string; children?: ReactNode }> = ({
  title,
  description,
  children,
}) => (
  <section style={sectionStyle}>
    <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{title}</h1>
    <p style={{ color: "#475569", marginBottom: 20 }}>{description}</p>
    {children}
    <div style={{ marginTop: 16 }}>
      <Link to="/more" style={{ color: "#2563eb", textDecoration: "underline" }}>
        Volver a ajustes
      </Link>
    </div>
  </section>
);

const useMockTables = () => {
  const [tables, setTables] = useState<PosTable[]>(defaultTables);

  const activeCount = useMemo(() => tables.filter((table) => table.enabled).length, [tables]);

  const addTable = (name: string) => {
    const normalizedName = name.trim();
    if (!normalizedName) return false;

    const newTable: PosTable = {
      id: `${Date.now()}`,
      name: normalizedName,
      enabled: true,
    };

    setTables((current) => [...current, newTable]);
    return true;
  };

  const updateTable = (tableId: string, nextName: string) => {
    const normalizedName = nextName.trim();
    if (!normalizedName) return false;

    setTables((current) =>
      current.map((table) => (table.id === tableId ? { ...table, name: normalizedName } : table)),
    );
    return true;
  };

  return {
    tables,
    activeCount,
    addTable,
    updateTable,
  };
};

export const PosTablesView: FC = () => {
  const { tables, activeCount } = useMockTables();

  return (
    <Card
      title="Pedidos con mesa"
      description="Nueva pantalla en feature POS. Mantiene el flujo legacy intacto y define base para integrar API/estado central en el siguiente paso."
    >
      <p style={{ marginBottom: 12 }}>Mesas activas: {activeCount}</p>
      <ul style={{ display: "grid", gap: 8, padding: 0, listStyle: "none" }}>
        {tables.map((table) => (
          <li
            key={table.id}
            style={{ border: "1px solid #e2e8f0", borderRadius: 8, padding: "10px 12px" }}
          >
            <strong>{table.name}</strong> · {table.enabled ? "Activa" : "Inactiva"}
          </li>
        ))}
      </ul>
      <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
        <Link to="/add-table" style={{ color: "#2563eb" }}>
          Agregar mesa
        </Link>
      </div>
    </Card>
  );
};

export const PosAddTableView: FC = () => {
  const navigate = useNavigate();
  const { addTable } = useMockTables();
  const [tableName, setTableName] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!addTable(tableName)) {
      setError("Escribe un nombre válido para la mesa.");
      return;
    }

    navigate("/tables");
  };

  return (
    <Card
      title="Agregar mesa"
      description="Formulario nuevo basado en la estructura de features. En el siguiente paso se conectará con servicio real."
    >
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <label htmlFor="table-name">Nombre de mesa</label>
        <input
          id="table-name"
          value={tableName}
          onChange={(event) => {
            setTableName(event.target.value);
            setError("");
          }}
          placeholder="Ej. Mesa 4"
          style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }}
        />
        {error ? <p style={{ color: "#dc2626", margin: 0 }}>{error}</p> : null}
        <button
          type="submit"
          style={{
            borderRadius: 999,
            border: 0,
            background: "#7c3aed",
            color: "white",
            fontWeight: 600,
            padding: "10px 16px",
            width: "fit-content",
          }}
        >
          Guardar
        </button>
      </form>
    </Card>
  );
};

export const PosEditTableView: FC = () => {
  const navigate = useNavigate();
  const { tableId } = useParams<{ tableId: string }>();
  const { tables, updateTable } = useMockTables();
  const table = tables.find((currentTable) => currentTable.id === tableId);
  const [tableName, setTableName] = useState(table?.name ?? "");
  const [error, setError] = useState("");

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!tableId || !updateTable(tableId, tableName)) {
      setError("No fue posible actualizar la mesa.");
      return;
    }

    navigate("/tables");
  };

  return (
    <Card
      title={`Editar mesa ${tableId ? `#${tableId}` : ""}`.trim()}
      description="Vista de edición lista para conectar con datos de backend sin romper componentes legacy."
    >
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10, maxWidth: 420 }}>
        <label htmlFor="edit-table-name">Nombre</label>
        <input
          id="edit-table-name"
          value={tableName}
          onChange={(event) => {
            setTableName(event.target.value);
            setError("");
          }}
          placeholder="Nombre de mesa"
          style={{ border: "1px solid #cbd5e1", borderRadius: 8, padding: "10px 12px" }}
        />
        {error ? <p style={{ color: "#dc2626", margin: 0 }}>{error}</p> : null}
        <button
          type="submit"
          style={{
            borderRadius: 999,
            border: 0,
            background: "#2563eb",
            color: "white",
            fontWeight: 600,
            padding: "10px 16px",
            width: "fit-content",
          }}
        >
          Actualizar
        </button>
      </form>
    </Card>
  );
};

export const PosExportReportsView: FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const onExport = async () => {
    setLoading(true);

    const rows = [
      ["Producto", "Cantidad", "Total"],
      ["Americano", "25", "1250"],
      ["Latte", "19", "1140"],
      ["Panini", "11", "990"],
    ];

    const csvContent = rows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = window.URL.createObjectURL(blob);

    const downloadLink = document.createElement("a");
    downloadLink.href = url;
    downloadLink.download = `reporte-pos-${Date.now()}.csv`;
    downloadLink.click();

    setMessage("Reporte CSV generado correctamente.");
    setLoading(false);
  };

  return (
    <Card
      title="Exportar reportes"
      description="Vista desacoplada del legacy que preserva la idea original de exportación, ahora con flujo web simple en CSV."
    >
      <button
        type="button"
        disabled={loading}
        onClick={onExport}
        style={{
          borderRadius: 999,
          border: "1px solid #ef4444",
          background: "white",
          color: "#dc2626",
          fontWeight: 600,
          padding: "10px 16px",
        }}
      >
        {loading ? "Generando..." : "Generar reporte"}
      </button>
      {message ? <p style={{ marginTop: 12, color: "#166534" }}>{message}</p> : null}
    </Card>
  );
};
