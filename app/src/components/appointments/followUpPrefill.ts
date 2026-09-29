/** Pré-preenchimento do formulário de agendamento a partir de um retorno
 *  pendente. O Dashboard grava em sessionStorage e a página de Agendamentos
 *  consome ao montar (reutiliza toda a lógica de slots/conflitos). */
export const FOLLOWUP_PREFILL_KEY = "studioflow_followup_prefill";

export type FollowUpPrefill = {
  clientId: number;
  professionalId: number | null;
  serviceId: number | null;
  /** data sugerida (yyyy-MM-dd) — pode estar no passado se o retorno venceu */
  date: string;
  followUpId: number;
};

export function saveFollowUpPrefill(prefill: FollowUpPrefill) {
  sessionStorage.setItem(FOLLOWUP_PREFILL_KEY, JSON.stringify(prefill));
}

/** Lê e remove o preenchimento (uso único). */
export function consumeFollowUpPrefill(): FollowUpPrefill | null {
  const raw = sessionStorage.getItem(FOLLOWUP_PREFILL_KEY);
  if (!raw) return null;
  sessionStorage.removeItem(FOLLOWUP_PREFILL_KEY);
  try {
    return JSON.parse(raw) as FollowUpPrefill;
  } catch {
    return null;
  }
}
