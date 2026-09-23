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

function isMobile(): boolean {
  return /android|iphone|ipad|ipod/i.test(window.navigator.userAgent);
}

/**
 * Banner de instalação do PWA.
 * - Android/Chrome: captura beforeinstallprompt e abre o prompt nativo.
 * - iPhone/iPad (Safari não dispara o evento): mostra o passo a passo manual.
 * - Some quando já instalado ou quando o usuário dispensa (localStorage).
 */
export function InstallAppBanner() {
  const [visible, setVisible] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (isInstalled() || localStorage.getItem(DISMISS_KEY)) return;
    if (!isMobile()) return;

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setVisible(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS nunca dispara beforeinstallprompt — mostra o guia manual
    let timer: ReturnType<typeof setTimeout> | undefined;
    if (isIos()) {
      timer = setTimeout(() => setVisible(true), 1500);
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
          Instale o StudioFlow no seu celular
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
        ) : (
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
