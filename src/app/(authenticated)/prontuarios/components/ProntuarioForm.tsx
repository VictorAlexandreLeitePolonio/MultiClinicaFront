"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PageHeader } from "@/components/ui/PageHeader";
import { FormSection } from "@/components/ui/FormSection";
import { FormField } from "@/components/ui/FormField";
import { Button } from "@/components/ui/Button";
import { ProntuarioSchema, ProntuarioFormData } from "../schemas/prontuario.schema";
import { useInsertProntuario } from "../hooks/insert";
import { toast } from "sonner";
import { useUploadContrato } from "../hooks/uploadContrato";
import { useUploadExame } from "../hooks/uploadExame";
import { Patient, PagedResult } from "@/types";
import api from "@/lib/api";
import { FileText, Image, X } from "lucide-react";

interface Props {
  preselectedPatientId?: number | null;
  onBack: () => void;
  onSave: () => void;
}

// Máximo 10MB para PDFs e imagens
const MAX_FILE_SIZE_MB = 10;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

export default function ProntuarioForm({ preselectedPatientId, onBack, onSave }: Props) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(false);
  const [contratoFile, setContratoFile] = useState<File | null>(null);
  const [exameFile, setExameFile] = useState<File | null>(null);
  const [examePreview, setExamePreview] = useState<string | null>(null);

  const { insertProntuario, isPending: inserting } = useInsertProntuario();
  const { uploadContrato, loading: uploadingContrato } = useUploadContrato();
  const { uploadExame, loading: uploadingExame } = useUploadExame();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProntuarioFormData>({
    resolver: zodResolver(ProntuarioSchema),
    defaultValues: {
      patientId: preselectedPatientId || 0,
    },
  });

  // Revoga a Object URL anterior sempre que examePreview muda (evita memory leak)
  useEffect(() => {
    return () => {
      if (examePreview) URL.revokeObjectURL(examePreview);
    };
  }, [examePreview]);

  useEffect(() => {
    const fetchPatients = async () => {
      setLoadingPatients(true);
      try {
        const response = await api.get<PagedResult<Patient> | Patient[]>("/api/patients");
        if (Array.isArray(response.data)) {
          setPatients(response.data);
        } else {
          setPatients(response.data.data);
        }
      } catch {
        // erro silencioso
      } finally {
        setLoadingPatients(false);
      }
    };
    fetchPatients();
  }, []);

  const handleContratoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = "";
      return;
    }
    
    if (file.type === "application/pdf") {
      setContratoFile(file);
    } else {
      toast.error("Por favor, selecione um arquivo PDF.");
      e.target.value = "";
    }
  };

  const handleExameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > MAX_FILE_SIZE_BYTES) {
      toast.error(`Arquivo muito grande. Máximo permitido: ${MAX_FILE_SIZE_MB}MB.`);
      e.target.value = "";
      return;
    }
    
    if (file.type === "image/jpeg" || file.type === "image/png") {
      setExameFile(file);
      setExamePreview(URL.createObjectURL(file));
    } else {
      toast.error("Por favor, selecione uma imagem JPG ou PNG.");
      e.target.value = "";
    }
  };

  const removeContrato = () => setContratoFile(null);
  const removeExame = () => {
    setExameFile(null);
    if (examePreview) {
      URL.revokeObjectURL(examePreview);
      setExamePreview(null);
    }
  };

  const onSubmit = async (data: ProntuarioFormData) => {
    try {
      // 1. Cria o prontuário
      const record = await insertProntuario(data);
      if (!record) return;

      // 2. Upload do contrato se selecionado
      if (contratoFile) {
        try {
          await uploadContrato(record.id, contratoFile);
          toast.success("Contrato enviado com sucesso!");
        } catch {
          toast.error("Prontuário criado, mas houve erro ao enviar o contrato.");
        }
      }

      // 3. Upload do exame se selecionado
      if (exameFile) {
        try {
          await uploadExame(record.id, exameFile);
          toast.success("Exame enviado com sucesso!");
        } catch {
          toast.error("Prontuário criado, mas houve erro ao enviar o exame.");
        }
      }

      toast.success("Prontuário criado com sucesso!");
      onSave();
    } catch {
      // erro já tratado no hook
    }
  };

  const isLoading = inserting || uploadingContrato || uploadingExame;

  return (
    <div className="space-y-6 max-w-3xl">
      <PageHeader title="Novo Prontuário" onBack={onBack} />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <FormSection title="Informações Gerais">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold tracking-wide uppercase text-[#1a2a4a]">
              Paciente *
            </label>
            <select
              {...register("patientId", { valueAsNumber: true })}
              disabled={loadingPatients || !!preselectedPatientId}
              className="w-full h-10 px-3 rounded-sm border-2 border-[#e2ebe6] bg-white text-[#1b2e4b] focus:border-[#1a4a3a] focus:outline-none disabled:opacity-50"
            >
              <option value={0}>Selecione um paciente</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
            {errors.patientId && (
              <span className="text-xs text-red-600 font-medium">{errors.patientId.message}</span>
            )}
          </div>

          <FormField label="Título *" error={errors.titulo?.message} {...register("titulo")} />
        </FormSection>

        <FormSection title="Anamnese">
          <FormField label="Patologia *" error={errors.patologia?.message} {...register("patologia")} />
          <FormField label="Queixa Principal *" error={errors.queixaPrincipal?.message} {...register("queixaPrincipal")} />
          <FormField label="Doença Antiga" {...register("doencaAntiga")} />
          <FormField label="Doença Atual" {...register("doencaAtual")} />
          <FormField label="Hábitos" {...register("habitos")} />
        </FormSection>

        <FormSection title="Exames">
          <FormField label="Exames Físicos" {...register("examesFisicos")} />
          <FormField label="Sinais Vitais" {...register("sinaisVitais")} />
        </FormSection>

        <FormSection title="Histórico">
          <FormField label="Medicamentos" {...register("medicamentos")} />
          <FormField label="Cirurgias" {...register("cirurgias")} />
          <FormField label="Outras Doenças" {...register("outrasDoencas")} />
        </FormSection>

        <FormSection title="Sessão e Orientações">
          <FormField label="Sessão" {...register("sessao")} />
          <FormField label="Orientação Domiciliar" {...register("orientacaoDomiciliar")} />
        </FormSection>

        <FormSection title="Arquivos">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Contrato PDF */}
            <div>
              <label className="block text-sm font-medium text-[#1b2e4b] mb-2">
                Contrato (PDF)
              </label>
              {!contratoFile ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#e2ebe6] rounded-sm bg-[#f8faf9] cursor-pointer hover:border-[#1a4a3a] transition-colors">
                  <FileText className="w-8 h-8 text-[#4a6354] mb-2" />
                  <p className="text-sm text-[#4a6354]">Clique para selecionar PDF</p>
                  <input type="file" accept=".pdf" className="hidden" onChange={handleContratoChange} />
                </label>
              ) : (
                <div className="flex items-center justify-between p-4 border-2 border-[#e2ebe6] rounded-sm bg-[#f8faf9]">
                  <div className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-[#1a4a3a]" />
                    <span className="text-sm text-[#1b2e4b] truncate max-w-50">{contratoFile.name}</span>
                  </div>
                  <button type="button" onClick={removeContrato} className="p-1 hover:bg-red-100 rounded-sm">
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>

            {/* Exame de Imagem */}
            <div>
              <label className="block text-sm font-medium text-[#1b2e4b] mb-2">
                Exame de Imagem (JPG/PNG)
              </label>
              {!exameFile ? (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-[#e2ebe6] rounded-sm bg-[#f8faf9] cursor-pointer hover:border-[#1a4a3a] transition-colors">
                  <Image className="w-8 h-8 text-[#4a6354] mb-2" />
                  <p className="text-sm text-[#4a6354]">Clique para selecionar imagem</p>
                  <input type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleExameChange} />
                </label>
              ) : (
                <div className="relative">
                  <img src={examePreview || ""} alt="Preview" className="w-full h-32 object-cover rounded-sm border-2 border-[#e2ebe6]" />
                  <button type="button" onClick={removeExame} className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-sm hover:bg-red-100">
                    <X className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </FormSection>

        <Button type="submit" loading={isLoading}>
          Salvar Prontuário
        </Button>
      </form>
    </div>
  );
}
