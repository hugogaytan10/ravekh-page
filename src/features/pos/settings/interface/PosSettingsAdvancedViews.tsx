import type { FC } from "react";
import { Link, useParams } from "react-router-dom";

type PlaceholderProps = {
  title: string;
  description: string;
};

const PlaceholderCard: FC<PlaceholderProps> = ({ title, description }) => (
  <section style={{ padding: 24, maxWidth: 680, margin: "0 auto" }}>
    <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>{title}</h1>
    <p style={{ color: "#475569", marginBottom: 16 }}>{description}</p>
    <Link to="/more" style={{ color: "#2563eb", textDecoration: "underline" }}>
      Volver a ajustes
    </Link>
  </section>
);

export const PosTablesView: FC = () => (
  <PlaceholderCard
    title="Pedidos con mesa"
    description="Nueva base de configuración de mesas para POS. Se migrará la lógica operativa en el siguiente paso."
  />
);

export const PosAddTableView: FC = () => (
  <PlaceholderCard
    title="Agregar mesa"
    description="Formulario tipado para alta de mesas dentro de la nueva arquitectura por features."
  />
);

export const PosEditTableView: FC = () => {
  const { tableId } = useParams<{ tableId: string }>();

  return (
    <PlaceholderCard
      title={`Editar mesa ${tableId ? `#${tableId}` : ""}`.trim()}
      description="Pantalla de edición preparada para conectar servicio y estado centralizado del POS."
    />
  );
};

export const PosExportReportsView: FC = () => (
  <PlaceholderCard
    title="Exportar reportes"
    description="Vista inicial para exportación de reportes desacoplada del código legacy de React Native."
  />
);
