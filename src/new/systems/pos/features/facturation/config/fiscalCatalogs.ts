export const REGIMEN_FISCAL_OPTIONS = [
  { code: "601", label: "601 - General de Ley Personas Morales" },
  { code: "603", label: "603 - Personas Morales con Fines no Lucrativos" },
  { code: "605", label: "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios" },
  { code: "606", label: "606 - Arrendamiento" },
  { code: "612", label: "612 - Personas Físicas con Actividades Empresariales y Profesionales" },
  { code: "616", label: "616 - Sin obligaciones fiscales" },
  { code: "621", label: "621 - Incorporación Fiscal" },
  { code: "625", label: "625 - Régimen de las Actividades Empresariales con ingresos a través de plataformas tecnológicas" },
  { code: "626", label: "626 - Régimen Simplificado de Confianza" },
] as const;

export const USO_CFDI_OPTIONS = [
  { code: "S01", label: "S01 - Sin efectos fiscales" },
  { code: "G03", label: "G03 - Gastos en general" },
  { code: "D01", label: "D01 - Honorarios médicos, dentales y gastos hospitalarios" },
] as const;

export const REGIMEN_TO_USO_CFDI: Record<string, string[]> = {
  "601": ["G03", "S01"],
  "603": ["G03", "S01"],
  "605": ["D01", "G03", "S01"],
  "606": ["G03", "S01"],
  "612": ["G03", "S01"],
  "616": ["S01"],
  "621": ["G03", "S01"],
  "625": ["G03", "S01"],
  "626": ["G03", "S01"],
};
