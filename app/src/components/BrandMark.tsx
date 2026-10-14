/** Símbolo da marca StudioFlow — fios dourados em fluxo.
 *  Cor FIXA da marca (#B3A18A champanhe): NUNCA segue o tema do
 *  estabelecimento (regra da marca padrão). Usar com classes de altura
 *  apenas (ex.: `h-5`) — o largura acompanha a proporção do viewBox. */
export function BrandMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 48 64"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#B3A18A"
        d="M20 62 C26 48 36 40 34 26 C32.5 14 38 7 45 2 C39 9 35.5 16 37 27 C39 41 28 50 24 62 Z"
      />
      <path
        fill="#B3A18A"
        d="M6 62 C11 50 19 44 17.5 33 C16.3 23.5 20.5 17.5 26 13.5 C21 19 18.8 25 20 34 C21.7 45.5 13 52 10 62 Z"
      />
    </svg>
  );
}
