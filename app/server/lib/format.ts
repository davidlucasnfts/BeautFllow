/**
 * Padronização de texto de entrada do usuário.
 * Regra do projeto: campos de nome sempre gravados com a
 * inicial maiúscula de cada palavra, independente de como
 * o usuário digitou.
 */
export function capitalizeWords(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, " ")
    .split(" ")
    .map(word => word.charAt(0).toLocaleUpperCase("pt-BR") + word.slice(1).toLocaleLowerCase("pt-BR"))
    .join(" ");
}
