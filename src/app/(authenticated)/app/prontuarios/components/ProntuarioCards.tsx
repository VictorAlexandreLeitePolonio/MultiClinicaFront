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
          <button onClick={onBack} className="p-2 hover:bg-[#f0f4f2] rounded-sm">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-2xl font-bold text-[#1a2a4a]">Carregando...</h1>
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
        <div className="text-center py-12 bg-[#f8faf9] rounded-sm border-2 border-dashed border-[#e2ebe6]">
          <FileText size={48} className="mx-auto mb-4 text-[#4a6354]/40" />
          <p className="text-[#4a6354]">Nenhum prontuário encontrado para este paciente.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((record) => (
              <motion.div
                key={record.id}
                whileHover={{ y: -2, boxShadow: "4px 4px 0 0 #1a4a3a" }}
                onClick={() => onViewDetails(record.id)}
                className="p-5 bg-white border-2 border-[#e2ebe6] rounded-sm cursor-pointer transition-all hover:border-[#1a4a3a]"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-bold text-[#1a4a3a]">
                    #{record.id}
                  </span>
                  <span className="text-xs text-[#4a6354] flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(record.createdAt).toLocaleDateString("pt-BR")}
                  </span>
                </div>

                <h3 className="font-semibold text-[#1b2e4b] mb-2 line-clamp-1">
                  {record.titulo}
                </h3>

                {record.sessao && (
                  <p className="text-sm text-[#4a6354] mb-3">
                    Sessão: {record.sessao}
                  </p>
                )}

                <div className="flex items-center gap-2 text-xs text-[#4a6354]">
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
