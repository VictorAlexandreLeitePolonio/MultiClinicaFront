"use client";

import { motion } from "motion/react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useProntuarioById } from "../hooks/getId";
import { FileText, Image as ImageIcon,  UserCircle } from "lucide-react";

interface Props {
  id: number;
  onBack: () => void;
}

export default function ProntuarioDetails({ id, onBack }: Props) {
  const { record, loading, error } = useProntuarioById(id);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Detalhes do Prontuário" onBack={onBack} />
        <p className="text-[#4a6354]">Carregando...</p>
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="space-y-6">
        <PageHeader title="Detalhes do Prontuário" onBack={onBack} />
        <p className="text-red-500">{error || "Prontuário não encontrado."}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title={`Prontuário #${record.id}`} onBack={onBack} />

      {/* Identificação */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 bg-white border-2 border-[#e2ebe6] rounded-sm"
      >
        <h2 className="text-lg font-bold text-[#1a2a4a] mb-4 flex items-center gap-2">
          <UserCircle size={20} className="text-[#1a4a3a]" />
          Identificação
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-[#4a6354]">Paciente</span>
            <p className="font-medium text-[#1b2e4b]">{record.patientName}</p>
          </div>
          <div>
            <span className="text-sm text-[#4a6354]">Fisioterapeuta</span>
            <p className="font-medium text-[#1b2e4b]">{record.userName}</p>
          </div>
          <div>
            <span className="text-sm text-[#4a6354]">Título</span>
            <p className="font-medium text-[#1b2e4b]">{record.titulo}</p>
          </div>
          <div>
            <span className="text-sm text-[#4a6354]">Sessão</span>
            <p className="font-medium text-[#1b2e4b]">{record.sessao || "-"}</p>
          </div>
          <div>
            <span className="text-sm text-[#4a6354]">Data</span>
            <p className="font-medium text-[#1b2e4b]">
              {new Date(record.createdAt).toLocaleDateString("pt-BR")}
            </p>
          </div>
        </div>
      </motion.section>

      {/* Anamnese */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="p-5 bg-white border-2 border-[#e2ebe6] rounded-sm"
      >
        <h2 className="text-lg font-bold text-[#1a2a4a] mb-4">Anamnese</h2>
        <div className="space-y-4">
          <div>
            <span className="text-sm text-[#4a6354]">Queixa Principal</span>
            <p className="text-[#1b2e4b] whitespace-pre-wrap">{record.queixaPrincipal}</p>
          </div>
          <div>
            <span className="text-sm text-[#4a6354]">Patologia</span>
            <p className="text-[#1b2e4b] whitespace-pre-wrap">{record.patologia}</p>
          </div>
          {record.doencaAntiga && (
            <div>
              <span className="text-sm text-[#4a6354]">Doença Antiga</span>
              <p className="text-[#1b2e4b] whitespace-pre-wrap">{record.doencaAntiga}</p>
            </div>
          )}
          {record.doencaAtual && (
            <div>
              <span className="text-sm text-[#4a6354]">Doença Atual</span>
              <p className="text-[#1b2e4b] whitespace-pre-wrap">{record.doencaAtual}</p>
            </div>
          )}
          {record.habitos && (
            <div>
              <span className="text-sm text-[#4a6354]">Hábitos</span>
              <p className="text-[#1b2e4b] whitespace-pre-wrap">{record.habitos}</p>
            </div>
          )}
          {record.outrasDoencas && (
            <div>
              <span className="text-sm text-[#4a6354]">Outras Doenças</span>
              <p className="text-[#1b2e4b] whitespace-pre-wrap">{record.outrasDoencas}</p>
            </div>
          )}
        </div>
      </motion.section>

      {/* Exame Físico */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-5 bg-white border-2 border-[#e2ebe6] rounded-sm"
      >
        <h2 className="text-lg font-bold text-[#1a2a4a] mb-4">Exame Físico</h2>
        <div className="space-y-4">
          {record.examesFisicos && (
            <div>
              <span className="text-sm text-[#4a6354]">Exames Físicos</span>
              <p className="text-[#1b2e4b] whitespace-pre-wrap">{record.examesFisicos}</p>
            </div>
          )}
          {record.sinaisVitais && (
            <div>
              <span className="text-sm text-[#4a6354]">Sinais Vitais</span>
              <p className="text-[#1b2e4b] whitespace-pre-wrap">{record.sinaisVitais}</p>
            </div>
          )}
          {record.medicamentos && (
            <div>
              <span className="text-sm text-[#4a6354]">Medicamentos</span>
              <p className="text-[#1b2e4b] whitespace-pre-wrap">{record.medicamentos}</p>
            </div>
          )}
          {record.cirurgias && (
            <div>
              <span className="text-sm text-[#4a6354]">Cirurgias</span>
              <p className="text-[#1b2e4b] whitespace-pre-wrap">{record.cirurgias}</p>
            </div>
          )}
        </div>
      </motion.section>

      {/* Documentos */}
      {(record.contrato || record.examesImagem) && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 bg-white border-2 border-[#e2ebe6] rounded-sm"
        >
          <h2 className="text-lg font-bold text-[#1a2a4a] mb-4">Documentos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {record.contrato && (
              <a
                href={record.contrato}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border-2 border-[#e2ebe6] rounded-sm hover:border-[#1a4a3a] transition-colors"
              >
                <FileText className="w-10 h-10 text-[#1a4a3a]" />
                <div>
                  <p className="font-medium text-[#1b2e4b]">Contrato</p>
                  <p className="text-xs text-[#4a6354]">Clique para visualizar o PDF</p>
                </div>
              </a>
            )}
            {record.examesImagem && (
              <a
                href={record.examesImagem}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border-2 border-[#e2ebe6] rounded-sm hover:border-[#1a4a3a] transition-colors"
              >
                <ImageIcon className="w-10 h-10 text-[#1a4a3a]" />
                <div>
                  <p className="font-medium text-[#1b2e4b]">Exame de Imagem</p>
                  <p className="text-xs text-[#4a6354]">Clique para visualizar</p>
                </div>
              </a>
            )}
          </div>

          {record.examesImagem && (
            <div className="mt-4">
              <img
                src={record.examesImagem}
                alt="Exame de Imagem"
                className="max-w-full max-h-96 object-contain rounded-sm border border-[#e2ebe6]"
              />
            </div>
          )}
        </motion.section>
      )}

      {/* Orientações */}
      {record.orientacaoDomiciliar && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-5 bg-white border-2 border-[#e2ebe6] rounded-sm"
        >
          <h2 className="text-lg font-bold text-[#1a2a4a] mb-4">Orientações</h2>
          <div>
            <span className="text-sm text-[#4a6354]">Orientação Domiciliar</span>
            <p className="text-[#1b2e4b] whitespace-pre-wrap">{record.orientacaoDomiciliar}</p>
          </div>
        </motion.section>
      )}
    </div>
  );
}
