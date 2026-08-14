export function LandingClients() {
  return (
    <section id="clientes" data-mascot-anchor="rotina" data-landing-reveal className="landing-signal-strip border-y border-teal-100 py-9">
      <div className="mx-auto flex max-w-[88rem] flex-col gap-6 px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-slate-950">
            Da recepção ao fechamento do mês.
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Uma visão conectada para cada momento da operação.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs font-semibold text-teal-800">
          {["Atender", "Acompanhar", "Organizar", "Crescer"].map((item) => (
            <span key={item} className="landing-signal-chip">
              {item}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
