import React from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { PRIVACY_POLICIES } from "./privacyPolicies";

import "../../landing-ravekh/pages/LandingPage.css";

export const PrivacyPolicyPage = () => {
  const { policySlug } = useParams<{ policySlug: string }>();
  const policy = PRIVACY_POLICIES.find((item) => item.slug === policySlug);

  if (!policy) {
    return <Navigate to="/politicas" replace />;
  }

  return (
    <main className="min-h-screen bg-fondo-oscuro text-white px-4 py-10 md:px-10">
      <div className="max-w-5xl mx-auto">
        <Link to="/" className="inline-flex mb-6 text-sm underline">
          ← Volver al inicio
        </Link>

        <div className="rounded-2xl border border-white/20 bg-white/5 p-5 md:p-8">
          <h1 className="text-3xl md:text-4xl font-bold">{policy.title}</h1>
          <p className="text-white/80 mt-2">{policy.subtitle}</p>

          <div className="grid gap-4 mt-8">
            {policy.sections.map((section) => (
              <section
                key={`${policy.slug}-${section.title}`}
                className="rounded-xl border border-white/15 bg-black/20 p-4"
              >
                <h2 className="font-semibold text-xl">{section.title}</h2>
                <p className="text-white/85 mt-2 leading-relaxed">{section.content}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
};
