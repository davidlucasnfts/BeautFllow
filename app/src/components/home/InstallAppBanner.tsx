import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Download, Share, Smartphone, X } from "lucide-react";

// Evento beforeinstallprompt não é padronizado — tipamos manualmente
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "studioflow_install_banner_dismissed";

function isInstalled(): boolean {
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone ===
      true
  );
}

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

// No iOS, todos os navegadores são obrigados pela Apple a usar o motor do
// Safari — só o Safari propriamente dispara essas instruções corretamente
function isIosSafari(): boolean {
  return isIos() && /safari/i.test(window.navigator.userAgent) &&
    !/crios|fxios|edgios|opios/i.test(window.navigator.userAgent);
}

function isFirefox(): boolean {
  return /firefox/i.test(window.navigator.userAgent);
}

function isMobile(): boolean {
  return /android|iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

/**
 * Banner de instalação do PWA (cobertura multi-navegador).
 * - Navegadores Chromium (Chrome, Edge, Samsung Internet, Brave, Opera —
 *   Android e desktop): usa beforeinstallprompt (botão "Instalar agora")
 *   quando o navegador dispara o evento; se não disparar, guia manual.
 * - iPhone/iPad: passo a passo do Safari; se estiver em outro navegador,
 *   orienta abrir no Safari primeiro (só o Safari instala no iOS).
 * - Firefox: não suporta instalação PWA — o guia explica a limitação e
 *   recomenda o Chrome para ter o app completo.
 * - Some quando já instalado ou dispensado (localStorage).
 */
export function InstallAppBanner() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isInstalled() || localStorage.getItem(DISMISS_KEY)) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // Navegadores nem sempre disparam o evento — no mobile mostra o guia
    // manual como fallback (se o evento chegar depois, o botão nativo
    // substitui o guia). No desktop sem evento, não mostra nada — evita
    // instrução errada em navegador que não instala.
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isMobile()) {
      timer = setTimeout(() => setVisible(true), 2500);
    }

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      if (timer) clearTimeout(timer);
    };
  }, []);

  const install = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setVisible(false);
  };

  const dismiss = () => {
    localStorage.setItem(DISMISS_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="flex items-start gap-3 p-4 rounded-lg border border-blue-200 bg-blue-50 text-blue-900">
      <Smartphone className="h-5 w-5 shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium">
          Instale o StudioFlow{" "}
          {isMobile() ? "no seu celular" : "no seu computador"}
        </p>
        <p className="text-xs text-blue-800/80 mt-0.5">
          Acesse como um aplicativo, em tela cheia, sem precisar abrir o
          navegador.
        </p>

        {deferredPrompt ? (
          <Button
            size="sm"
            className="mt-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={install}
          >
            <Download className="mr-2 h-4 w-4" />
            Instalar agora
          </Button>
        ) : isIos() && !isIosSafari() ? (
          <div className="mt-2 text-xs text-blue-800/90 space-y-1">
            <p>
              No iPhone, só o <strong>Safari</strong> instala aplicativos.
            </p>
            <ol className="space-y-1 list-decimal list-inside">
              <li>
                Copie o endereço desta página (toque na barra de endereço →
                Copiar)
              </li>
              <li>
                Abra o <strong>Safari</strong> e cole o endereço
              </li>
              <li>
                Faça login — o guia de instalação vai aparecer aqui no
                Dashboard
              </li>
            </ol>
          </div>
        ) : isIos() ? (
          <ol className="mt-2 text-xs text-blue-800/90 space-y-1 list-decimal list-inside">
            <li>
              Toque no botão{" "}
              <Share className="inline h-3.5 w-3.5 -mt-0.5" /> Compartilhar do
              Safari
            </li>
            <li>
              Role as opções e toque em{" "}
              <strong>Adicionar à Tela de Início</strong>
            </li>
            <li>
              Toque em <strong>Adicionar</strong> — o ícone do StudioFlow vai
              aparecer na sua tela inicial
            </li>
          </ol>
        ) : isFirefox() ? (
          <div className="mt-2 text-xs text-blue-800/90 space-y-1">
            <p>
              O Firefox não instala aplicativos (PWA) — essa função ainda não
              existe nele.
            </p>
            <p>
              Para ter o StudioFlow como app no aparelho, acesse pelo{" "}
              <strong>Chrome</strong> — o botão de instalar vai aparecer aqui
              no Dashboard.
            </p>
          </div>
        ) : (
          <ol className="mt-2 text-xs text-blue-800/90 space-y-1 list-decimal list-inside">
            <li>
              Toque nos <strong>3 pontinhos</strong> (menu) no canto superior
              do navegador
            </li>
            <li>
              Toque em <strong>Instalar app</strong> (ou{" "}
              <strong>Adicionar à tela inicial</strong>)
            </li>
            <li>
              Confirme em <strong>Instalar</strong> — o ícone do StudioFlow
              vai aparecer na sua tela inicial
            </li>
          </ol>
        )}
      </div>
      <button
        type="button"
        aria-label="Dispensar"
        className="shrink-0 p-1 rounded-md text-blue-700 hover:bg-blue-100 transition-colors"
        onClick={dismiss}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
