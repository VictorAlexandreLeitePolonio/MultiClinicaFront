import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

const title = "Termos de uso";
const description = "Condições de uso do site público Cliniq Care, de suas demonstrações e dos links de acesso à plataforma.";
export const metadata: Metadata = {
  title, description, alternates: { canonical: "/termos" },
  openGraph: { title, description, url: "/termos", type: "website", locale: siteConfig.locale, siteName: siteConfig.name, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }] },
  twitter: { card: "summary_large_image", title, description, images: ["/twitter-image"] },
};

export default function TermsPage() {
  return (
    <article className="legal-copy">
      <h1>Termos de uso</h1>
      <p className="legal-copy__date">Atualizados em 26 de setembro de 2026</p>
      <p>Estes termos descrevem as condições de utilização do site público do Cliniq Care. Dúvidas podem ser encaminhadas à equipe pelo e-mail <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.</p>
      <h2>Finalidade do site</h2>
      <p>O site apresenta uma plataforma de gestão de clínicas e oferece demonstrações visuais de funcionalidades. Nomes, atendimentos, valores e indicadores da demonstração são ilustrativos: não representam pacientes reais, resultados garantidos ou uma proposta comercial.</p>
      <p>O uso contratado da plataforma, seus preços, limites, disponibilidade e responsabilidades específicas dependem das condições acordadas com a clínica. Estes termos do site não substituem esse contrato.</p>
      <h2>Acesso e uso responsável</h2>
      <p>Você pode navegar e conhecer o produto. Ao acessar áreas restritas, utilize apenas credenciais e permissões que lhe tenham sido atribuídas. Não é permitido tentar acessar dados de terceiros, contornar controles de segurança, interferir na disponibilidade do serviço ou utilizar o site para atividades ilícitas.</p>
      <p>Mantenha suas credenciais sob seu controle e comunique suspeitas de uso indevido. O acesso a informações da clínica ou de pacientes depende da autorização e das regras da área correspondente.</p>
      <h2>Informações clínicas e serviços de saúde</h2>
      <p>O Cliniq é uma ferramenta de organização e gestão. O conteúdo do site, a demonstração e o mascote não fornecem diagnóstico ou orientação médica e não substituem a avaliação de um profissional de saúde. As clínicas e seus profissionais são responsáveis pelos atendimentos e pelas decisões clínicas de sua competência.</p>
      <p>Os canais do site não são destinados a emergências. Em uma urgência, procure o serviço de saúde adequado.</p>
      <h2>Conteúdo e propriedade intelectual</h2>
      <p>A marca, os elementos visuais, o mascote e o software são protegidos pela legislação aplicável. A navegação permite conhecer e utilizar o site para sua finalidade, sem transferir a titularidade desses elementos. Reprodução comercial ou distribuição não autorizada deve respeitar os direitos dos titulares e as exceções previstas em lei.</p>
      <h2>Disponibilidade e links externos</h2>
      <p>O site pode passar por manutenção, correções e atualizações. Funcionalidades exibidas podem variar conforme a versão e a contratação. Se encontrar informação incorreta ou falha, entre em contato para que possamos avaliar e corrigir.</p>
      <p>Links externos e informações publicadas por clínicas podem ter regras próprias. Consulte as condições do serviço de destino antes de fornecer dados ou contratar um atendimento.</p>
      <h2>Privacidade</h2>
      <p>A <Link href="/privacidade">Política de privacidade</Link> explica as finalidades do tratamento no site público, os canais para solicitações e a distinção em relação aos dados tratados pelas clínicas.</p>
      <h2>Responsabilidades e legislação</h2>
      <p>As responsabilidades de cada parte serão avaliadas conforme sua atuação e a legislação aplicável. Estes termos não afastam direitos obrigatórios, garantias legais ou a proteção do consumidor quando aplicável.</p>
      <p>Aplica-se a legislação brasileira, preservadas as regras legais de competência e os direitos do usuário. Para buscar uma solução sobre o site, utilize primeiro nosso canal de contato, sem prejuízo do acesso às autoridades competentes.</p>
      <h2>Alterações destes termos</h2>
      <p>Atualizações serão identificadas pela data desta página. Alterações não modificam retroativamente direitos adquiridos nem substituem as condições de contratos existentes. Quando necessária, a concordância com novas condições será solicitada de forma adequada.</p>
    </article>
  );
}
