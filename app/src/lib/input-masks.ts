// Padrões de entrada Brasil — usados em todos os formulários do app.
// Telefone: (99) 99999-9999 | Datas: dd/mm/aaaa | Dinheiro: 1.234,56

/** Mantém apenas os dígitos do valor. */
export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Mantém apenas letras (com acentos), espaços e pontuação comum de nomes.
 * Por padrão remove dígitos (uso em nomes de pessoas).
 * `allowDigits: true` para nomes de negócios (ex: "Barbearia 2 Irmãos").
 */
export function onlyText(
  value: string,
  options: { allowDigits?: boolean } = {}
): string {
  const pattern = options.allowDigits
    ? /[^a-zA-ZÀ-ÖØ-öø-ÿ0-9\s&'’.-]/g
    : /[^a-zA-ZÀ-ÖØ-öø-ÿ\s'’.-]/g;
  return value.replace(pattern, "");
}

/** Máscara de telefone celular BR: (11) 99999-9999 (aceita fixo 8 dígitos). */
export function maskPhoneBR(value: string): string {
  const d = onlyDigits(value).slice(0, 11);
  if (d.length === 0) return "";
  if (d.length <= 2) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10)
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

/** Máscara de data BR: dd/mm/aaaa. */
export function maskDateBR(value: string): string {
  const d = onlyDigits(value).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
}

/** Valida uma data dd/mm/aaaa (dia 1-31, mês 1-12, ano 1900 até o atual). */
export function isValidDateBR(value: string): boolean {
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return false;
  const day = Number(m[1]);
  const month = Number(m[2]);
  const year = Number(m[3]);
  if (year < 1900 || year > new Date().getFullYear()) return false;
  if (month < 1 || month > 12) return false;
  if (day < 1 || day > 31) return false;
  return true;
}

/** Converte dd/mm/aaaa → aaaa-mm-dd (formato que o banco espera). */
export function dateBRToISO(value: string): string {
  const m = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  return m ? `${m[3]}-${m[2]}-${m[1]}` : "";
}

/** Converte aaaa-mm-dd (banco) → dd/mm/aaaa (tela). */
export function isoToDateBR(value: string): string {
  const m = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : "";
}

/**
 * Máscara de dinheiro BR: digita-se só os números e o valor vai
 * entrando dos centavos para o real. Ex: "2500" → "25,00".
 * `maxDigits` limita a quantidade de dígitos (default 10 = R$ 99 milhões;
 * use 7 em preços de serviço = R$ 99.999,99).
 */
export function maskMoneyBR(value: string, maxDigits = 10): string {
  const d = onlyDigits(value).slice(0, maxDigits);
  if (!d) return "";
  return (Number(d) / 100).toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Converte "1.234,56" (tela) → "1234.56" (banco). */
export function moneyBRToDot(value: string): string {
  if (!value) return "";
  return value.replace(/\./g, "").replace(",", ".");
}

/** Converte "1234.56" (banco) → "1.234,56" (tela). */
export function moneyDotToBR(value: string): string {
  const n = Number(value);
  if (Number.isNaN(n)) return "";
  return n.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/** Máscara de URL amigável (slug): letras minúsculas, números e hífen. */
export function maskSlug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}
