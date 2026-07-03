import { LogoLoop } from "./LogoLoop";

const mockClients = [
  { name: "Clínica Vitalis" },
  { name: "Espaço Bem-Estar" },
  { name: "Instituto Novo Olhar" },
  { name: "Clínica Raiz" },
  { name: "Grupo Saúde Plena" },
  { name: "Centro Movimento" },
];

export function LandingClients() {
  return (
    <section id="clientes" className="border-y border-gray-200 bg-card py-14">
      <div className="mx-auto max-w-7xl px-6">
        <p className="text-center text-sm font-semibold uppercase tracking-wide text-gray-600">
          Clínicas e profissionais que já confiam no MultiClinica
        </p>
        <div className="mt-8">
          <LogoLoop items={mockClients} />
        </div>
      </div>
    </section>
  );
}
