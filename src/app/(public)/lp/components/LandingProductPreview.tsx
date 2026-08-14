"use client";

import {
  ArrowUpRight,
  Check,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileClock,
  LockKeyhole,
  Search,
  Sparkles,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import {
  landingModules,
  type LandingModuleId,
} from "./landingModules";

interface LandingProductPreviewProps {
  activeModuleId: LandingModuleId;
  onModuleChange: (moduleId: LandingModuleId) => void;
  compact?: boolean;
}

function ModuleWorkspace({ moduleId }: { moduleId: LandingModuleId }) {
  if (moduleId === "agenda") {
    return (
      <div className="landing-workspace landing-workspace--calendar" aria-hidden="true">
        <div className="landing-workspace__toolbar">
          <strong>Hoje, 14 jun</strong>
          <span>3 profissionais</span>
        </div>
        <div className="landing-calendar">
          <span className="landing-calendar__time">09:00</span>
          <span className="landing-calendar__line" />
          <div className="landing-calendar__appointment landing-calendar__appointment--one">
            <strong>Marina Alves</strong>
            <span>Fisioterapia · confirmado</span>
          </div>
          <span className="landing-calendar__time">10:30</span>
          <span className="landing-calendar__line" />
          <div className="landing-calendar__appointment landing-calendar__appointment--two">
            <strong>João Martins</strong>
            <span>Avaliação · aguardando</span>
          </div>
          <span className="landing-calendar__time">12:00</span>
          <span className="landing-calendar__line" />
        </div>
      </div>
    );
  }

  if (moduleId === "pacientes") {
    return (
      <div className="landing-workspace" aria-hidden="true">
        <div className="landing-workspace__toolbar">
          <span className="landing-search"><Search size={12} /> Buscar paciente</span>
          <span className="landing-workspace__badge">248 ativos</span>
        </div>
        <div className="landing-patient-list">
          {[
            ["Marina Alves", "Próxima consulta hoje", "MA"],
            ["João Martins", "Evolução há 2 dias", "JM"],
            ["Ana Costa", "Plano ativo", "AC"],
          ].map(([name, status, initials]) => (
            <div key={name} className="landing-patient-row">
              <span className="landing-patient-row__avatar">{initials}</span>
              <span><strong>{name}</strong><small>{status}</small></span>
              <ArrowUpRight size={13} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (moduleId === "prontuarios") {
    return (
      <div className="landing-workspace" aria-hidden="true">
        <div className="landing-record-head">
          <span className="landing-patient-row__avatar landing-patient-row__avatar--large">MA</span>
          <span><strong>Marina Alves</strong><small>Última evolução · hoje, 09:42</small></span>
          <FileClock size={15} />
        </div>
        <div className="landing-record-tags"><span>Fisioterapia</span><span>Em acompanhamento</span></div>
        <div className="landing-record-section"><span>Registro clínico</span><i /><i /><i /></div>
        <div className="landing-record-section landing-record-section--short"><span>Próxima meta</span><i /><i /></div>
      </div>
    );
  }

  if (moduleId === "financeiro") {
    return (
      <div className="landing-workspace" aria-hidden="true">
        <div className="landing-workspace__toolbar"><strong>Visão do período</strong><span>Junho · 2026</span></div>
        <div className="landing-finance-cards"><span><small>Entradas</small><strong>R$ 24,8k</strong></span><span><small>Despesas</small><strong>R$ 6,4k</strong></span><span><small>Saldo</small><strong>R$ 18,4k</strong></span></div>
        <div className="landing-finance-graph"><i /><i /><i /><i /><i /><i /></div>
      </div>
    );
  }

  if (moduleId === "pagamentos") {
    return (
      <div className="landing-workspace" aria-hidden="true">
        <div className="landing-workspace__toolbar"><strong>Últimos pagamentos</strong><span className="landing-workspace__badge">94% conciliados</span></div>
        <div className="landing-payment-list">
          {["Plano Essencial · Marina Alves", "Particular · João Martins", "Plano Completo · Ana Costa"].map((payment, index) => (
            <div key={payment} className="landing-payment-row"><span><strong>{payment}</strong><small>{index === 0 ? "Hoje, 09:20" : "Ontem, 16:40"}</small></span><b>{index === 1 ? "Pendente" : "Recebido"}</b></div>
          ))}
        </div>
      </div>
    );
  }

  if (moduleId === "evolucao") {
    return (
      <div className="landing-workspace" aria-hidden="true">
        <div className="landing-workspace__toolbar"><strong>Progresso do tratamento</strong><span>Marina Alves</span></div>
        <div className="landing-timeline"><span /><div><strong>Avaliação inicial</strong><small>Concluída · 03 jun</small></div><CheckCircle2 size={14} /></div>
        <div className="landing-timeline"><span /><div><strong>Primeiro acompanhamento</strong><small>Concluído · 10 jun</small></div><CheckCircle2 size={14} /></div>
        <div className="landing-timeline landing-timeline--current"><span /><div><strong>Meta de mobilidade</strong><small>Em andamento · 72%</small></div><Clock3 size={14} /></div>
      </div>
    );
  }

  if (moduleId === "estoque") {
    return (
      <div className="landing-workspace" aria-hidden="true">
        <div className="landing-workspace__toolbar"><strong>Itens monitorados</strong><span className="landing-workspace__badge">2 alertas</span></div>
        <div className="landing-stock-list">
          {["Luvas descartáveis", "Bandagem elástica", "Álcool 70%"].map((item, index) => (
            <div key={item} className="landing-stock-row"><span><strong>{item}</strong><small>{index === 1 ? "Estoque baixo" : "Disponível"}</small></span><i className={`landing-stock-bar landing-stock-bar--${index + 1}`} /></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="landing-workspace" aria-hidden="true">
      <div className="landing-workspace__toolbar"><strong>Perfis de acesso</strong><span>4 perfis ativos</span></div>
      <div className="landing-role-list">
        <div><span className="landing-role-icon"><UserRound size={13} /></span><span><strong>Profissional</strong><small>Agenda e prontuários</small></span><LockKeyhole size={13} /></div>
        <div><span className="landing-role-icon"><CheckCircle2 size={13} /></span><span><strong>Gestor</strong><small>Visão completa da clínica</small></span><LockKeyhole size={13} /></div>
        <div><span className="landing-role-icon landing-role-icon--alert"><TriangleAlert size={13} /></span><span><strong>Recepção</strong><small>Agenda e pagamentos</small></span><LockKeyhole size={13} /></div>
      </div>
    </div>
  );
}

export function LandingProductPreview({
  activeModuleId,
  onModuleChange,
  compact = false,
}: LandingProductPreviewProps) {
  const activeModule = landingModules.find((module) => module.id === activeModuleId) ?? landingModules[0];
  const ActiveIcon = activeModule.icon;

  return (
    <div className={`landing-preview ${compact ? "landing-preview--compact" : ""}`}>
      <div className="landing-preview__topbar">
        <div className="flex items-center gap-3">
          <div className="landing-preview__brand-mark">M</div>
          <div>
            <p className="text-xs font-bold tracking-tight text-slate-900">MultiClinica</p>
            <p className="text-[10px] font-medium text-teal-700">Visão rápida do sistema</p>
          </div>
        </div>
        <span className="landing-preview__status">
          <span /> Demo interativa
        </span>
      </div>

      <div className="landing-preview__body">
        <aside className="landing-preview__sidebar" aria-label="Módulos da demonstração">
          <p className="landing-preview__sidebar-label">Módulos</p>
          <div className="landing-preview__module-list">
            {landingModules.map((module) => {
              const Icon = module.icon;
              const isActive = module.id === activeModule.id;

              return (
                <button
                  key={module.id}
                  type="button"
                  className="landing-preview__module-button"
                  data-active={isActive}
                  aria-pressed={isActive}
                  onClick={() => onModuleChange(module.id)}
                >
                  <Icon size={14} strokeWidth={2.2} />
                  <span>{module.label}</span>
                </button>
              );
            })}
          </div>
        </aside>

        <div key={activeModule.id} className="landing-preview__content landing-preview__content--swap">
          <div className="flex items-start justify-between gap-5">
            <div>
              <p className="landing-preview__eyebrow">{activeModule.label}</p>
              <h3 className="landing-preview__title">{activeModule.title}</h3>
              <p className="landing-preview__description">{activeModule.description}</p>
            </div>
            <div className="landing-preview__active-icon">
              <ActiveIcon size={18} />
            </div>
          </div>

          <div className="landing-preview__metric-row">
            <div>
              <strong>{activeModule.metric}</strong>
              <span>{activeModule.metricLabel}</span>
            </div>
            <div className="landing-preview__trend">
              <Sparkles size={13} />
              visão resumida
            </div>
          </div>

          <ModuleWorkspace moduleId={activeModule.id} />

          <div className="landing-preview__highlights">
            {activeModule.highlights.map((highlight) => (
              <div key={highlight} className="landing-preview__highlight">
                <Check size={14} />
                <span>{highlight}</span>
                <ChevronRight size={13} className="ml-auto text-slate-300" />
              </div>
            ))}
          </div>

          {!compact && (
            <p className="landing-preview__footnote">
              Clique nos módulos para ver como a clínica se conecta em uma única operação.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
