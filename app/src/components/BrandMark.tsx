/** Símbolo da marca StudioFlow — fios dourados em fluxo.
 *  Imagem ORIGINAL da marca (gerada por IA), nunca recriada.
 *  Cor FIXA da marca: NUNCA segue o tema do estabelecimento
 *  (regra da marca padrão). Usar com classes de altura (ex.: `h-5`). */
export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src="/brand/logo-icon.png"
      alt=""
      aria-hidden="true"
      className={className}
      draggable={false}
    />
  );
}
