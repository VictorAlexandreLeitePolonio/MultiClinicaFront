import { ArrowRight, Mail } from "lucide-react";
import { siteConfig } from "@/lib/site";

export function LandingCTA() {
  return (
    <section id="contato" data-mascot-anchor="contato" data-landing-reveal className="landing-cta py-24 sm:py-32">
      <div className="mx-auto max-w-[88rem] px-6 lg:px-8">
        <div className="landing-cta__panel landing-contact">
          <div>
            <h2 className="text-4xl font-bold leading-tight tracking-[-0.04em] text-white sm:text-5xl">Vamos conhecer<br />a rotina da sua clínica?</h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-teal-50 sm:text-lg">Conte o que sua equipe precisa organizar. O primeiro passo é uma conversa para entender se o Cliniq faz sentido para você.</p>
            <a href={`mailto:${siteConfig.contactEmail}?subject=${encodeURIComponent("Quero conhecer o Cliniq")}&body=${encodeURIComponent("Olá! Quero conhecer o Cliniq.\n\nNome da clínica:\nMinha função:\nO que precisamos organizar:\nComo conheci o Cliniq:\n")}`} className="landing-button landing-button--light mt-8">
              <Mail size={17} /> Conversar sobre minha clínica <ArrowRight size={16} />
            </a>
            <p className="mt-4 text-xs leading-6 text-teal-50">Abre seu aplicativo de e-mail. Você revisa a mensagem antes de enviar.</p>
          </div>
          <div className="landing-contact__next">
            <h3>O que acontece depois?</h3>
            <ol>
              <li><span>1</span><div><strong>Você apresenta sua clínica</strong><p>Compartilhe sua rotina e o que gostaria de melhorar.</p></div></li>
              <li><span>2</span><div><strong>Conversamos sobre o acesso</strong><p>O acesso é liberado por indicação e depende da avaliação da equipe.</p></div></li>
              <li><span>3</span><div><strong>Combinamos os próximos passos</strong><p>Se houver disponibilidade, alinhamos a apresentação e as condições de uso.</p></div></li>
            </ol>
            <a href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a>
          </div>
        </div>
      </div>
    </section>
  );
}
