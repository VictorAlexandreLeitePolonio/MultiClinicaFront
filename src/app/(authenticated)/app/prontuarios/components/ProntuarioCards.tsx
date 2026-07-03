"use client";

import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
import { useProntuariosPaginated } from "../hooks/pagined";
import { getPatientById } from "@/services/patients/patients.service";
import { ArrowLeft, FileText, Calendar, User } from "lucide-react";

interface Props {
  patientId: number;
  onBack: () => void;
  onViewDetails: (id: number) => void;
  onCreate: () => void;
}

export default function ProntuarioCards({ patientId, onBack, onViewDetails, onCreate }: Props) {
  const { data, page, setPage, pageSize, setPageSize, totalPages, loading } = useProntuariosPaginated({ patientId });
  const [patientName, setPatientName] = useState<string>("");

  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await getPatientById(patientId);
        setPatientName(response.name || "Paciente");
      } catch {
        setPatientName("Paciente");
      }
    };
    fetchPatient();
  }, [patientId]);

  if (loading && data.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-50 dark:bg-slate-900 rounded-xl">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-secondary dark:text-white">Carregando...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Prontuários de ${patientName}`}
        onBack={onBack}
        actions={
          <Button onClick={onCreate}>+ Novo Prontuário</Button>
        }
      />

      {data.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-slate-900 rounded-xl border border-dashed border-gray-200 dark:border-slate-700">
          <FileText size={48} className="mx-auto mb-4 text-gray-600/40 dark:text-slate-300/40" />
          <p className="text-gray-600 dark:text-slate-300">Nenhum prontuário encontrado para este paciente.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((record) => (
              <motion.div
                key={record.id}
                whileHover={{ y: -2, boxShadow: "0 18px 50px -44px rgba(15,23,42,0.42)" }}
                onClick={() => onViewDetails(record.id)}
                className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl cursor-pointer transition-all hover:border-primary-dark"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-primary-dark">
                    #{record.id}
                  </span>
                  <span className="text-xs text-gray-600 dark:text-slate-300 flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(record.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <h3 className="font-semibold text-secondary dark:text-white mb-2 line-clamp-1">
                  {record.titulo}
                </h3>

                {record.sessao && (
                  <p className="text-sm text-gray-600 dark:text-slate-300 mb-3">
                    Sessão: {record.sessao}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-slate-300">
                  <User size={12} />
                  <span className="truncate">{record.userName}</span>
                </div>
              </motion.div>
            ))}
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={setPageSize}
          />
        </>
      )}
    </div>
  );
}
