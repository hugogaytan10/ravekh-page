import React from "react";
import { Link } from "react-router-dom";
import { PRIVACY_POLICIES } from "./privacyPolicies";

export const PrivacyPoliciesIndexPage = () => {
  return (
    <main className="min-h-screen bg-fondo-oscuro text-white px-4 py-10 md:px-10">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="inline-flex mb-6 text-sm underline">
          ← Volver al inicio
        </Link>

        <h1 className="text-3xl md:text-4xl font-bold">Políticas de privacidad</h1>
        <p className="text-white/80 mt-2">
          Consulta la política correspondiente a cada producto de Ravekh.
        </p>

        <div className="grid gap-4 md:grid-cols-2 mt-8">
          {PRIVACY_POLICIES.map((policy) => (
            <article key={policy.slug} className="rounded-xl border border-white/15 bg-white/5 p-4">
              <h2 className="font-semibold text-xl">{policy.title.replace("Política de Privacidad — ", "")}</h2>
              <p className="text-white/80 mt-2">{policy.subtitle}</p>
              <Link to={`/politicas/${policy.slug}`} className="inline-block mt-4 underline font-medium">
                Ver política
              </Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
};
