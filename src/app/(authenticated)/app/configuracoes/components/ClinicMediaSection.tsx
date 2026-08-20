"use client";

import { useRef } from "react";
import Image from "next/image";
import { ImagePlus, Trash2, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/Button";
import { getApiErrorMessage } from "@/utils/apiError";
import { ClinicMedia, ClinicMediaType } from "@/types";
import {
  useClinicMedia,
  useDeleteClinicMedia,
  useReorderClinicMedia,
  useUploadClinicMedia,
} from "../hooks/useClinicMedia";

interface Props {
  canEdit: boolean;
}

const MAX_SIZE = 5 * 1024 * 1024;
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

function validateFile(file: File): string | null {
  if (!ALLOWED.includes(file.type)) return "Tipo inválido. Aceitos: JPEG, PNG, WEBP.";
  if (file.size > MAX_SIZE) return "Arquivo muito grande. Máximo: 5MB.";
  return null;
}

export function ClinicMediaSection({ canEdit }: Props) {
  const mediaQuery = useClinicMedia();
  const upload = useUploadClinicMedia();
  const remove = useDeleteClinicMedia();
  const reorder = useReorderClinicMedia();
  const coverInput = useRef<HTMLInputElement>(null);
  const galleryInput = useRef<HTMLInputElement>(null);

  const media = mediaQuery.data ?? [];
  const cover = media.find((m) => m.type === "Cover") ?? null;
  const gallery = media
    .filter((m) => m.type === "Gallery")
    .sort((a, b) => a.sortOrder - b.sortOrder);

  const handleUpload = async (type: ClinicMediaType, file: File | undefined, sortOrder?: number) => {
    if (!file) return;
    const error = validateFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    try {
      await upload.mutateAsync({ type, file, sortOrder });
      toast.success("Imagem enviada.");
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível enviar a imagem."));
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await remove.mutateAsync(id);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível remover a imagem."));
    }
  };

  // Move uma imagem da galeria trocando o sortOrder com o vizinho.
  const handleMove = async (index: number, direction: -1 | 1) => {
    const target = gallery[index];
    const neighbor = gallery[index + direction];
    if (!target || !neighbor) return;
    try {
      await Promise.all([
        reorder.mutateAsync({ id: target.id, sortOrder: neighbor.sortOrder }),
        reorder.mutateAsync({ id: neighbor.id, sortOrder: target.sortOrder }),
      ]);
    } catch (err) {
      toast.error(getApiErrorMessage(err, "Não foi possível reordenar."));
    }
  };

  const renderThumb = (item: ClinicMedia) => (
    <Image src={item.url} alt="" fill className="object-cover" unoptimized />
  );

  return (
    <section className="space-y-6 rounded-2xl border border-[#d7f3ea] bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div>
        <h2 className="text-lg font-bold text-[#0f172a] dark:text-white">Mídia</h2>
        <p className="mt-1 text-sm text-[#64748b] dark:text-slate-400">
          Capa e galeria exibidas na página pública. JPEG, PNG ou WEBP até 5MB.
        </p>
      </div>

      {/* Capa */}
      <div className="space-y-2">
        <p className="text-sm font-semibold text-[#0f172a] dark:text-white">Capa</p>
        <div className="relative h-40 w-full overflow-hidden rounded-xl border border-[#d7f3ea] bg-[#ecfdf5] dark:border-slate-700 dark:bg-slate-800">
          {cover ? (
            renderThumb(cover)
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[#94a3b8]">Sem capa</div>
          )}
        </div>
        {canEdit && (
          <div className="flex gap-2">
            <input
              ref={coverInput}
              type="file"
              accept={ALLOWED.join(",")}
              className="hidden"
              onChange={(e) => {
                void handleUpload("Cover", e.target.files?.[0]);
                e.target.value = "";
              }}
            />
            <Button type="button" variant="outline" fullWidth={false} onClick={() => coverInput.current?.click()}>
              <ImagePlus size={16} />
              {cover ? "Trocar capa" : "Enviar capa"}
            </Button>
            {cover && (
              <Button type="button" variant="danger" fullWidth={false} onClick={() => handleDelete(cover.id)}>
                <Trash2 size={16} />
                Remover
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Galeria */}
      <div className="space-y-3">
        <p className="text-sm font-semibold text-[#0f172a] dark:text-white">Galeria</p>
        {gallery.length === 0 && (
          <p className="text-sm text-[#94a3b8] dark:text-slate-500">Nenhuma imagem na galeria.</p>
        )}
        {gallery.length > 0 && (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {gallery.map((item, index) => (
              <div key={item.id} className="group relative h-28 overflow-hidden rounded-xl border border-[#d7f3ea] dark:border-slate-700">
                {renderThumb(item)}
                {canEdit && (
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-black/40 p-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button type="button" aria-label="Mover para a esquerda" disabled={index === 0} onClick={() => handleMove(index, -1)} className="text-white disabled:opacity-30">
                      <ArrowLeft size={16} />
                    </button>
                    <button type="button" aria-label="Remover imagem" onClick={() => handleDelete(item.id)} className="text-white hover:text-red-300">
                      <Trash2 size={16} />
                    </button>
                    <button type="button" aria-label="Mover para a direita" disabled={index === gallery.length - 1} onClick={() => handleMove(index, 1)} className="text-white disabled:opacity-30">
                      <ArrowRight size={16} />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {canEdit && (
          <>
            <input
              ref={galleryInput}
              type="file"
              accept={ALLOWED.join(",")}
              className="hidden"
              onChange={(e) => {
                void handleUpload("Gallery", e.target.files?.[0], gallery.length);
                e.target.value = "";
              }}
            />
            <Button type="button" variant="outline" fullWidth={false} loading={upload.isPending} onClick={() => galleryInput.current?.click()}>
              <ImagePlus size={16} />
              Adicionar à galeria
            </Button>
          </>
        )}
      </div>
    </section>
  );
}
