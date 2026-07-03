"use client";

import NextImage from "next/image";
import { motion } from "motion/react";
import { PageHeader } from "@/components/ui/PageHeader";
import { useProntuarioById } from "../hooks/getId";
import { FileText, Image as ImageIcon, UserCircle } from "lucide-react";
import { getAttachmentDownloadUrl } from "@/services/attachments/attachments.service";
import { ClinicalAttachment } from "@/types";
import { toast } from "sonner";

interface Props {
  id: number;
  onBack: () => void;
}

export default function ProntuarioDetails({ id, onBack }: Props) {
  const { record, loading, error } = useProntuarioById(id);

  const openAttachment = async (attachment: ClinicalAttachment) => {
    try {
      const url = await getAttachmentDownloadUrl(attachment.id);
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      toast.error("Erro ao gerar link temporário do anexo.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Detalhes do Prontuário" onBack={onBack} />
        <p className="text-gray-600 dark:text-slate-300">Carregando...</p>
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

  const attachments = record.attachments ?? [];

  return (
    <div className="space-y-6">
      <PageHeader title={`Prontuário #${record.id}`} onBack={onBack} />

      {/* Identificação */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl"
      >
        <h2 className="text-lg font-bold text-secondary dark:text-white mb-4 flex items-center gap-2">
          <UserCircle size={20} className="text-primary-dark" />
          Identificação
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm text-gray-600 dark:text-slate-300">Paciente</span>
            <p className="font-medium text-secondary dark:text-white">{record.patientName}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-slate-300">Profissional</span>
            <p className="font-medium text-secondary dark:text-white">{record.userName}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-slate-300">Título</span>
            <p className="font-medium text-secondary dark:text-white">{record.titulo}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-slate-300">Sessão</span>
            <p className="font-medium text-secondary dark:text-white">{record.sessao || "-"}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-slate-300">Data</span>
            <p className="font-medium text-secondary dark:text-white">
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
        className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl"
      >
        <h2 className="text-lg font-bold text-secondary dark:text-white mb-4">Anamnese</h2>
        <div className="space-y-4">
          <div>
            <span className="text-sm text-gray-600 dark:text-slate-300">Queixa Principal</span>
            <p className="text-secondary dark:text-white whitespace-pre-wrap">{record.queixaPrincipal}</p>
          </div>
          <div>
            <span className="text-sm text-gray-600 dark:text-slate-300">Patologia</span>
            <p className="text-secondary dark:text-white whitespace-pre-wrap">{record.patologia}</p>
          </div>
          {record.doencaAntiga && (
            <div>
              <span className="text-sm text-gray-600 dark:text-slate-300">Doença Antiga</span>
              <p className="text-secondary dark:text-white whitespace-pre-wrap">{record.doencaAntiga}</p>
            </div>
          )}
          {record.doencaAtual && (
            <div>
              <span className="text-sm text-gray-600 dark:text-slate-300">Doença Atual</span>
              <p className="text-secondary dark:text-white whitespace-pre-wrap">{record.doencaAtual}</p>
            </div>
          )}
          {record.habitos && (
            <div>
              <span className="text-sm text-gray-600 dark:text-slate-300">Hábitos</span>
              <p className="text-secondary dark:text-white whitespace-pre-wrap">{record.habitos}</p>
            </div>
          )}
          {record.outrasDoencas && (
            <div>
              <span className="text-sm text-gray-600 dark:text-slate-300">Outras Doenças</span>
              <p className="text-secondary dark:text-white whitespace-pre-wrap">{record.outrasDoencas}</p>
            </div>
          )}
        </div>
      </motion.section>

      {/* Exame Físico */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl"
      >
        <h2 className="text-lg font-bold text-secondary dark:text-white mb-4">Exame Físico</h2>
        <div className="space-y-4">
          {record.examesFisicos && (
            <div>
              <span className="text-sm text-gray-600 dark:text-slate-300">Exames Físicos</span>
              <p className="text-secondary dark:text-white whitespace-pre-wrap">{record.examesFisicos}</p>
            </div>
          )}
          {record.sinaisVitais && (
            <div>
              <span className="text-sm text-gray-600 dark:text-slate-300">Sinais Vitais</span>
              <p className="text-secondary dark:text-white whitespace-pre-wrap">{record.sinaisVitais}</p>
            </div>
          )}
          {record.medicamentos && (
            <div>
              <span className="text-sm text-gray-600 dark:text-slate-300">Medicamentos</span>
              <p className="text-secondary dark:text-white whitespace-pre-wrap">{record.medicamentos}</p>
            </div>
          )}
          {record.cirurgias && (
            <div>
              <span className="text-sm text-gray-600 dark:text-slate-300">Cirurgias</span>
              <p className="text-secondary dark:text-white whitespace-pre-wrap">{record.cirurgias}</p>
            </div>
          )}
        </div>
      </motion.section>

      {/* Documentos */}
      {(attachments.length > 0 || record.contrato || record.examesImagem) && (
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl"
        >
          <h2 className="text-lg font-bold text-secondary dark:text-white mb-4">Documentos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {attachments.map((attachment) => {
              const isExam = attachment.type === "Exam";
              const Icon = isExam ? ImageIcon : FileText;

              return (
                <button
                  key={attachment.id}
                  type="button"
                  onClick={() => void openAttachment(attachment)}
                  className="flex items-center gap-3 p-4 text-left border border-gray-200 dark:border-slate-700 rounded-xl hover:border-primary-dark transition-colors"
                >
                  <Icon className="w-10 h-10 text-primary-dark" />
                  <div className="min-w-0">
                    <p className="font-medium text-secondary dark:text-white truncate">
                      {attachment.originalFileName || (isExam ? "Exame de Imagem" : "Contrato")}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-slate-300">Clique para abrir link temporário</p>
                  </div>
                </button>
              );
            })}
            {record.contrato && (
              <a
                href={record.contrato}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-primary-dark transition-colors"
              >
                <FileText className="w-10 h-10 text-primary-dark" />
                <div>
                  <p className="font-medium text-secondary dark:text-white">Contrato</p>
                  <p className="text-xs text-gray-600 dark:text-slate-300">Clique para visualizar o PDF</p>
                </div>
              </a>
            )}
            {record.examesImagem && (
              <a
                href={record.examesImagem}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 border border-gray-200 dark:border-slate-700 rounded-xl hover:border-primary-dark transition-colors"
              >
                <ImageIcon className="w-10 h-10 text-primary-dark" />
                <div>
                  <p className="font-medium text-secondary dark:text-white">Exame de Imagem</p>
                  <p className="text-xs text-gray-600 dark:text-slate-300">Clique para visualizar</p>
                </div>
              </a>
            )}
          </div>

          {record.examesImagem && (
            <div className="mt-4">
              <NextImage
                src={record.examesImagem}
                alt="Exame de Imagem"
                width={640}
                height={384}
                unoptimized
                className="max-w-full max-h-96 object-contain rounded-xl border border-gray-200 dark:border-slate-700"
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
          className="p-5 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded-xl"
        >
          <h2 className="text-lg font-bold text-secondary dark:text-white mb-4">Orientações</h2>
          <div>
            <span className="text-sm text-gray-600 dark:text-slate-300">Orientação Domiciliar</span>
            <p className="text-secondary dark:text-white whitespace-pre-wrap">{record.orientacaoDomiciliar}</p>
          </div>
        </motion.section>
      )}
    </div>
  );
}
