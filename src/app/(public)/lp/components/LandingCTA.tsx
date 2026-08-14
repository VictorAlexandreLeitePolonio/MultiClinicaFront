import { ArrowRight, Mail, Sparkles } from "lucide-react";
import { LandingSmoothLink } from "./LandingSmoothLink";

const CONTACT_EMAIL = "victorpolonio123@gmail.com";

export function LandingCTA() {
  return (
    <section id="contato" data-mascot-anchor="contato" data-landing-reveal className="landing-cta py-24 sm:py-32">
      <div className="mx-auto max-w-[88rem] px-6 lg:px-8">
        <div className="landing-cta__panel">
          <div className="landing-cta__pattern" aria-hidden="true" />
          <div className="relative z-10 max-w-2xl">
            <div className="landing-cta__label">
              <Sparkles size={14} />
              Próximo passo
            </div>
            <h2 className="mt-6 text-4xl font-bold leading-tight tracking-[-0.045em] text-white sm:text-5xl">
              Sua rotina pode ser mais clara a partir daqui.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-7 text-teal-50/80 sm:text-lg">
              Explore a visão geral ou entre em contato para conhecer o MultiClinica
              por dentro. O acesso real continua sendo liberado por indicação.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <LandingSmoothLink href="#modulos" className="landing-button landing-button--light">
                Explorar a demo
                <ArrowRight size={17} />
              </LandingSmoothLink>
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="landing-button landing-button--outline-light"
              >
                <Mail size={16} />
                Solicitar acesso
              </a>
            </div>
            <p className="mt-5 text-xs text-teal-50/60">{CONTACT_EMAIL}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
