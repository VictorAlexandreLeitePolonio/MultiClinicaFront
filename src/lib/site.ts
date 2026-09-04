/**
 * Configuração central da marca/SEO. A URL de produção vem de
 * NEXT_PUBLIC_SITE_URL (defina no ambiente); o fallback mantém a produção
 * apontando para o domínio oficial quando a variável não estiver presente.
 */
const rawUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/$/, "");

export const siteConfig = {
  name: "Cliniq Care",
  title: "Cliniq Care — A clínica, inteligente.",
  description:
    "Cliniq Care — a clínica, inteligente. Agenda, pacientes, prontuários, financeiro e portal do paciente num só sistema.",
  url: rawUrl && rawUrl.length > 0 ? rawUrl : "https://cliniqcare.com.br",
  locale: "pt_BR",
  keywords: [
    "software para clínicas",
    "sistema de gestão para clínicas",
    "prontuário eletrônico",
    "agenda médica online",
    "portal do paciente",
    "gestão clínica",
    "Cliniq Care",
  ],
} as const;
