import { useEffect, useMemo, useState } from "react";
import { FaFacebook, FaInstagram, FaTiktok } from "react-icons/fa";
import { getPosApiBaseUrl } from "../../../pos/shared/config/posEnv";
import "./CatalogSocialFooter.css";

type SocialNetworksResponse = {
  Facebook?: string;
  facebook?: string;
  Instagram?: string;
  instagram?: string;
  TikTok?: string;
  tikTok?: string;
  Tiktok?: string;
  tiktok?: string;
};

type SocialLink = {
  key: "facebook" | "instagram" | "tiktok";
  label: string;
  value: string;
  href: string;
  icon: JSX.Element;
};

type CatalogSocialFooterProps = {
  businessId?: string | number | null;
};

const normalizeBase = (baseUrl: string) => baseUrl.replace(/\/$/, "");

const normalizeSocialUrl = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^(https?:|mailto:|tel:)/i.test(trimmed)) return trimmed;
  return `https://${trimmed.replace(/^@/, "")}`;
};

const getSocialNetworks = (payload: SocialNetworksResponse | SocialNetworksResponse[] | null): SocialNetworksResponse | null => {
  if (Array.isArray(payload)) return payload[0] ?? null;
  return payload;
};

export const CatalogSocialFooter = ({ businessId }: CatalogSocialFooterProps) => {
  const [socialNetworks, setSocialNetworks] = useState<SocialNetworksResponse | null>(null);

  useEffect(() => {
    const normalizedBusinessId = String(businessId ?? "").trim();
    if (!normalizedBusinessId) {
      setSocialNetworks(null);
      return;
    }

    let cancelled = false;
    const loadSocialNetworks = async () => {
      try {
        const response = await fetch(`${normalizeBase(getPosApiBaseUrl())}/socialnetworks/business/${normalizedBusinessId}`);
        if (!response.ok) throw new Error("No social networks found.");
        const payload = await response.json() as SocialNetworksResponse | SocialNetworksResponse[] | null;
        if (!cancelled) setSocialNetworks(getSocialNetworks(payload));
      } catch {
        if (!cancelled) setSocialNetworks(null);
      }
    };

    void loadSocialNetworks();

    return () => {
      cancelled = true;
    };
  }, [businessId]);

  const links = useMemo<SocialLink[]>(() => {
    const facebook = String(socialNetworks?.Facebook ?? socialNetworks?.facebook ?? "").trim();
    const instagram = String(socialNetworks?.Instagram ?? socialNetworks?.instagram ?? "").trim();
    const tikTok = String(socialNetworks?.TikTok ?? socialNetworks?.tikTok ?? socialNetworks?.Tiktok ?? socialNetworks?.tiktok ?? "").trim();

    return [
      { key: "tiktok", label: "TikTok", value: tikTok, href: normalizeSocialUrl(tikTok), icon: <FaTiktok aria-hidden="true" /> },
      { key: "facebook", label: "Facebook", value: facebook, href: normalizeSocialUrl(facebook), icon: <FaFacebook aria-hidden="true" /> },
      { key: "instagram", label: "Instagram", value: instagram, href: normalizeSocialUrl(instagram), icon: <FaInstagram aria-hidden="true" /> },
    ].filter((link) => link.value && link.href);
  }, [socialNetworks]);

  if (links.length === 0) return null;

  return (
    <footer className="catalog-v2-social-footer" aria-label="Redes sociales del negocio">
      <span>Síguenos</span>
      <nav aria-label="Enlaces a redes sociales">
        {links.map((link) => (
          <a
            key={link.key}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Abrir ${link.label} en una nueva pestaña`}
            title={link.label}
          >
            {link.icon}
          </a>
        ))}
      </nav>
    </footer>
  );
};
