"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { toast } from "sonner";
import { PageHeader } from "@/components/ui/PageHeader";
import { useAuth } from "@/contexts/AuthContext";
import { getApiErrorMessage } from "@/utils/apiError";
import { EvolutionTemplateForm } from "./components/EvolutionTemplateForm";
import { EvolutionTemplateDetails } from "./components/EvolutionTemplateDetails";
import { EvolutionTemplateList } from "./components/EvolutionTemplateList";
import { useEvolutionTemplateMutations } from "./hooks/useEvolutionTemplates";
import { EvolutionTemplateFormData } from "./schemas/evolutionTemplate.schema";

type ViewMode = "list" | "create" | "view";

function EvolutionTemplatesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { createTemplate } = useEvolutionTemplateMutations();
  const mode = (searchParams.get("mode") as ViewMode) ?? "list";
  const id = searchParams.get("id") ? Number(searchParams.get("id")) : null;
  const canEdit = user?.role === "Administrador";

  const goTo = (nextMode: ViewMode, nextId?: number) => {
    const params = new URLSearchParams({ mode: nextMode });
    if (nextId) params.set("id", String(nextId));
    router.push(`/app/modelos-evolucao?${params.toString()}`);
  };

  const handleCreate = async (data: EvolutionTemplateFormData) => {
    try {
      const template = await createTemplate.mutateAsync({
        name: data.name,
        description: data.description || null,
        category: data.category || null,
        isDefault: data.isDefault,
      });
      toast.success("Modelo criado com sucesso.");
      goTo("view", template.id);
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Erro ao criar modelo."));
    }
  };

  return (
    <div className="p-8">
      <AnimatePresence mode="wait" initial={false}>
        {mode === "list" && (
          <motion.div key="list" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <EvolutionTemplateList onCreate={() => goTo("create")} onViewDetails={(templateId) => goTo("view", templateId)} />
          </motion.div>
        )}

        {mode === "create" && canEdit && (
          <motion.div key="create" className="max-w-2xl space-y-6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <PageHeader title="Novo modelo de evolução" onBack={() => goTo("list")} />
            <EvolutionTemplateForm loading={createTemplate.isPending} onSubmit={handleCreate} />
          </motion.div>
        )}

        {mode === "create" && !canEdit && (
          <motion.div key="forbidden" className="space-y-6" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <PageHeader title="Novo modelo de evolução" onBack={() => goTo("list")} />
            <p className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Seu perfil pode visualizar modelos ativos, mas não pode criar ou editar modelos.
            </p>
          </motion.div>
        )}

        {mode === "view" && id && (
          <motion.div key="view" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <EvolutionTemplateDetails id={id} onBack={() => goTo("list")} onSave={() => undefined} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense>
      <EvolutionTemplatesPage />
    </Suspense>
  );
}
