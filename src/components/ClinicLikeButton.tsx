"use client";

import { useState, MouseEvent } from "react";
import { useRouter } from "next/navigation";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/utils/apiError";
import { likeClinic, unlikeClinic } from "@/app/(patient-authenticated)/paciente/services/patient-portal.service";

interface Props {
  clinicId: number;
  likeCount: number;
  /** Estado inicial do paciente autenticado (fonte privada). */
  likedByMe?: boolean;
  /** Paciente autenticado pode curtir; visitante é direcionado ao login. */
  canLike: boolean;
  /** Ação quando um visitante tenta curtir (padrão: login do paciente). */
  onRequireAuth?: () => void;
  size?: number;
}

/**
 * Botão de like/unlike de clínica, reutilizável no portal e no perfil público
 * (e no futuro marketplace). Faz atualização otimista do contador com rollback
 * em caso de erro. O contador nunca fica negativo.
 */
export function ClinicLikeButton({
  clinicId,
  likeCount,
  likedByMe = false,
  canLike,
  onRequireAuth,
  size = 16,
}: Props) {
  const router = useRouter();
  const [liked, setLiked] = useState(likedByMe);
  const [count, setCount] = useState(likeCount);
  const [pending, setPending] = useState(false);

  const handleClick = async (event: MouseEvent) => {
    // Evita disparar a navegação do card que envolve o botão.
    event.preventDefault();
    event.stopPropagation();

    if (!canLike) {
      if (onRequireAuth) onRequireAuth();
      else router.push("/paciente/login");
      return;
    }
    if (pending) return;

    const previousLiked = liked;
    const previousCount = count;
    const nextLiked = !liked;

    // Atualização otimista.
    setLiked(nextLiked);
    setCount((c) => (nextLiked ? c + 1 : Math.max(0, c - 1)));
    setPending(true);

    try {
      const result = nextLiked ? await likeClinic(clinicId) : await unlikeClinic(clinicId);
      setLiked(result.likedByMe);
      setCount(Math.max(0, result.likeCount));
    } catch (err) {
      // Rollback do contador/estado.
      setLiked(previousLiked);
      setCount(previousCount);
      toast.error(getApiErrorMessage(err, "Não foi possível atualizar o like."));
    } finally {
      setPending(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-pressed={liked}
      aria-label={liked ? "Descurtir clínica" : "Curtir clínica"}
      disabled={pending}
      className={`inline-flex items-center gap-1 text-sm font-semibold transition-colors ${
        liked ? "text-red-500" : "text-[#64748b] hover:text-red-500 dark:text-slate-300"
      } disabled:opacity-60`}
    >
      <Heart size={size} className={liked ? "fill-red-500" : ""} />
      {count}
    </button>
  );
}
