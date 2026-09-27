import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site";

const title = "Política de privacidade";
const description = "Entenda como os dados são utilizados no site público Cliniq Care e como entrar em contato sobre sua privacidade.";
export const metadata: Metadata = {
  title, description, alternates: { canonical: "/privacidade" },
  openGraph: { title, description, url: "/privacidade", type: "website", locale: siteConfig.locale, siteName: siteConfig.name, images: [{ url: "/opengraph-image", width: 1200, height: 630, alt: siteConfig.name }] },
  twitter: { card: "summary_large_image", title, description, images: ["/twitter-image"] },
};

export default function PrivacyPage() {
  return (
    <article className="legal-copy">
      <h1>Política de privacidade</h1>
      <p className="legal-copy__date">Atualizada em 26 de setembro de 2026</p>
      <p>Esta política explica o uso de dados no site público do Cliniq Care, incluindo a apresentação do sistema, a demonstração e os canais de contato. Para falar com a equipe responsável pelo site, escreva para <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>.</p>
      <h2>Site público e atendimento da clínica</h2>
      <p>A demonstração apresenta dados ilustrativos e não exige que você informe dados de pacientes. As áreas de acesso da clínica e do paciente têm finalidades próprias. Em regra, a clínica determina as finalidades do tratamento de dados de seus pacientes, e o Cliniq atua conforme o serviço contratado e as instruções aplicáveis. Solicitações sobre prontuários e atendimentos devem ser encaminhadas à clínica responsável.</p>
      <h2>Dados e finalidades</h2>
      <ul>
        <li><strong>Navegação:</strong> informações técnicas, como endereço IP, navegador, horário e recursos acessados, podem ser processadas pela infraestrutura para entregar o site, diagnosticar falhas e proteger o serviço.</li>
        <li><strong>Contato:</strong> ao enviar um e-mail, você fornece seu endereço, o conteúdo da mensagem e os demais dados que decidir incluir. Essas informações são utilizadas para responder e acompanhar a solicitação.</li>
        <li><strong>Preferências e acesso:</strong> o navegador pode guardar preferências de interface. Ao utilizar áreas autenticadas, cookies de sessão são utilizados para manter e proteger o acesso.</li>
      </ul>
      <p>Não envie prontuários, documentos de identidade ou informações de saúde pelo contato geral do site. Se uma solicitação exigir identificação, orientaremos o envio apenas das informações necessárias pelo canal adequado.</p>
      <h2>Bases legais</h2>
      <p>O tratamento depende da finalidade e do contexto: atendimento de pedidos e procedimentos preliminares a uma contratação, execução de contrato, cumprimento de obrigações legais e interesses legítimos, quando cabíveis e compatíveis com seus direitos. Quando uma atividade exigir consentimento, ele deverá ser solicitado de forma específica e poderá ser revogado. A simples navegação não representa consentimento para qualquer uso de dados.</p>
      <h2>Cookies e recursos externos</h2>
      <p>Você pode gerenciar cookies e armazenamento local nas configurações do navegador; a remoção pode encerrar sessões ou redefinir preferências. Mapas e links externos, quando utilizados, podem envolver serviços de terceiros e suas próprias políticas. Ao abrir o mapa de uma clínica, informações técnicas da conexão podem ser recebidas pelo fornecedor do mapa.</p>
      <h2>Compartilhamento e conservação</h2>
      <p>Dados podem ser processados por fornecedores necessários à hospedagem, comunicação e operação do serviço, conforme a finalidade, ou fornecidos quando houver obrigação legal válida. O eventual uso de fornecedores no exterior exige a observância das regras aplicáveis à transferência internacional.</p>
      <p>O tempo de conservação depende da finalidade do contato, da relação contratual, das obrigações legais e do exercício regular de direitos. Encerrada a necessidade, os dados devem ser eliminados ou anonimizados, ressalvadas as hipóteses legais de conservação.</p>
      <h2>Seus direitos</h2>
      <p>Nos termos da LGPD, você pode solicitar confirmação de tratamento, acesso, correção, informações sobre compartilhamento e, quando cabível, anonimização, bloqueio, eliminação ou portabilidade. Também pode revogar consentimento, questionar o tratamento e exercer os demais direitos previstos na lei.</p>
      <p>Envie sua solicitação para <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>, descrevendo o pedido. Poderemos solicitar informações proporcionais para confirmar sua identidade e proteger seus dados. Você também pode recorrer à <a href="https://www.gov.br/anpd/pt-br/assuntos/titular-de-dados">Autoridade Nacional de Proteção de Dados (ANPD)</a>.</p>
      <h2>Atualizações</h2>
      <p>Esta política pode ser atualizada para refletir mudanças no site e nas atividades de tratamento. A data no início da página identifica a versão. Mudanças que dependam de nova informação ou consentimento deverão ser tratadas pelos meios adequados.</p>
      <p>Consulte também os <Link href="/termos">Termos de uso</Link>.</p>
    </article>
  );
}
