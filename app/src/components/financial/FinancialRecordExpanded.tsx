import { format } from "date-fns";
import { ChevronDown } from "lucide-react";
import type { ReactNode } from "react";
import type {
  FinancialRecordType,
  FinancialPaymentMethod,
} from "./FinancialFormDialog";

export type FinancialRecordForList = {
  id: number;
  clientId: number | null;
  professionalId: number | null;
  type: FinancialRecordType;
  description: string | null;
  amount: string;
  commissionAmount: string;
  paymentMethod: FinancialPaymentMethod;
  recordDate: string | Date;
  notes: string | null;
};

const typeLabels: Record<FinancialRecordType, string> = {
  service: "Serviço",
  product: "Produto",
  package: "Pacote",
  refund: "Reembolso",
  other: "Outro",
};

const paymentLabels: Record<FinancialPaymentMethod, string> = {
  pix: "Pix",
  credit_card: "Cartão de Crédito",
  debit_card: "Cartão de Débito",
  cash: "Dinheiro",
  other: "Outro",
};

function formatBRL(value: string | number) {
  return Number(value).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: ReactNode;
}) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold text-slate-400 uppercase">
        {label}
      </p>
      <p className="text-sm font-medium text-slate-800 break-words">
        {value}
      </p>
    </div>
  );
}

/** Ficha expandida do lançamento ao clicar na linha da tabela */
export default function FinancialRecordExpanded({
  record,
  clientName,
  professionalName,
  onClose,
}: {
  record: FinancialRecordForList;
  clientName: string;
  professionalName: string;
  onClose: () => void;
}) {
  return (
    <div className="border-l-2 border-primary px-4 pb-3 pt-2 space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <Detail
          label="Data"
          value={
            record.recordDate
              ? format(new Date(record.recordDate), "dd/MM/yyyy")
              : "-"
          }
        />
        <Detail label="Tipo" value={typeLabels[record.type]} />
        <Detail label="Cliente" value={clientName} />
        <Detail label="Profissional" value={professionalName} />
        <Detail
          label="Pagamento"
          value={paymentLabels[record.paymentMethod]}
        />
        <Detail
          label="Valor"
          value={
            <span
              className={
                record.type === "refund" ? "text-rose-600" : "text-emerald-600"
              }
            >
              {record.type === "refund" ? "-" : ""}
              {formatBRL(record.amount)}
            </span>
          }
        />
        <Detail label="Comissão" value={formatBRL(record.commissionAmount)} />
        <Detail
          label="Descrição"
          value={record.description ?? "-"}
        />
        {record.notes && <Detail label="Observações" value={record.notes} />}
      </div>
      <div className="flex justify-center pt-1">
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
        >
          <ChevronDown className="h-3.5 w-3.5" />
          Fechar
        </button>
      </div>
    </div>
  );
}
