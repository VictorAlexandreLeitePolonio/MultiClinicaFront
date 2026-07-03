import { Mail } from "lucide-react";

const CONTACT_EMAIL = "victorpolonio123@gmail.com";

export function LandingCTA() {
  return (
    <section id="contato" className="bg-background py-20">
      <div className="mx-auto max-w-3xl px-6">
        <div className="rounded-3xl border border-gray-200 bg-card p-10 text-center shadow-[0_24px_70px_-32px_rgba(15,23,42,0.42)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sidebar-active text-primary-dark">
            <Mail size={28} />
          </div>
          <h2 className="mt-6 text-2xl font-bold tracking-tight text-secondary sm:text-3xl">
            Acesso por indicação ou liberação
          </h2>
          <p className="mt-3 text-base leading-7 text-gray-600">
            O MultiClinica ainda não tem cadastro aberto. Se você quer testar o
            sistema pra sua clínica, me manda um e-mail que eu libero o acesso.
          </p>
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[0_20px_42px_-28px_rgba(20,184,166,0.95)] transition-colors hover:bg-primary-dark"
          >
            <Mail size={16} />
            {CONTACT_EMAIL}
          </a>
        </div>
      </div>
    </section>
  );
}
