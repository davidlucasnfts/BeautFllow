/**
 * Substitui os placeholders dos modelos de termo pelos dados reais do
 * cliente e do estabelecimento no momento da assinatura.
 */
export function renderTermContent(
  content: string,
  vars: { clientName: string; salonName: string }
): string {
  return content
    .replaceAll("[NOME DO CLIENTE]", vars.clientName)
    .replaceAll("[NOME DO ESTABELECIMENTO]", vars.salonName);
}
