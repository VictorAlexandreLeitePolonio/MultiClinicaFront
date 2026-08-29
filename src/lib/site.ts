/**
 * Configuração central da marca/SEO. A URL de produção vem de
 * NEXT_PUBLIC_SITE_URL (defina no ambiente); o fallback é só um padrão sensato.
 */
const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

export const siteConfig = {
  name: "Cliniq",
  title: "Cliniq — A clínica, inteligente.",
  description:
    "Cliniq — a clínica, inteligente. Agenda, pacientes, prontuários, financeiro e portal do paciente num só sistema.",
  url: rawUrl && rawUrl.length > 0 ? rawUrl : "https://cliniq.com.br",
  locale: "pt_BR",
  keywords: [
    "software para clínicas",
    "sistema de gestão para clínicas",
    "prontuário eletrônico",
    "agenda médica online",
    "portal do paciente",
    "gestão clínica",
    "Cliniq",
  ],
} as const;
