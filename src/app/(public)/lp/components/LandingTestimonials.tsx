import { ScrollStack, TestimonialItem } from "./ScrollStack";

const mockTestimonials: TestimonialItem[] = [
  {
    id: "1",
    name: "Marina Alcântara",
    role: "Fisioterapeuta, Clínica Vitalis",
    quote:
      "Centralizamos agenda, prontuário e financeiro no MultiClinica. Deixamos de usar três sistemas diferentes.",
  },
  {
    id: "2",
    name: "Rafael Torres",
    role: "Administrador, Espaço Bem-Estar",
    quote:
      "O controle de pagamentos por plano facilitou muito o fechamento mensal. Antes era tudo em planilha.",
  },
  {
    id: "3",
    name: "Juliana Prado",
    role: "Psicóloga, Instituto Novo Olhar",
    quote:
      "O perfil do paciente com histórico completo — consultas, evoluções e pagamentos — economiza um tempo enorme.",
  },
  {
    id: "4",
    name: "Eduardo Nascimento",
    role: "Fundador, Clínica Raiz",
    quote:
      "Migramos de um sistema genérico pra um feito pra clínica de verdade. A diferença no dia a dia é grande.",
  },
  {
    id: "5",
    name: "Camila Duarte",
    role: "Gerente, Grupo Saúde Plena",
    quote:
      "Suporte próximo e evolução constante. Sentimos que o sistema cresce junto com a nossa operação.",
  },
];

export function LandingTestimonials() {
  return (
    <section id="depoimentos" className="bg-card">
      <div className="mx-auto max-w-7xl px-6 pt-20">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary-dark">Depoimentos</p>
          <h2 className="mt-2 text-3xl font-bold tracking-tight text-secondary sm:text-4xl">
            Quem já usa, recomenda
          </h2>
        </div>
      </div>
      <ScrollStack items={mockTestimonials} />
    </section>
  );
}
