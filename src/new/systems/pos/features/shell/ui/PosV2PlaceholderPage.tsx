import { PosV2Shell } from "../../../shared/ui/PosV2Shell";

type PosV2PlaceholderPageProps = {
  title: string;
  description: string;
};

export const PosV2PlaceholderPage = ({ title, description }: PosV2PlaceholderPageProps) => {
  return (
    <PosV2Shell title={title} subtitle="Layout POS legacy replicado en estructura moderna">
      <section
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: "12px",
          padding: "1rem",
          boxShadow: "0 10px 25px -20px rgba(0,0,0,0.35)",
        }}
      >
        <h2 style={{ marginTop: 0 }}>{title}</h2>
        <p style={{ marginBottom: 0 }}>{description}</p>
      </section>
    </PosV2Shell>
  );
};
