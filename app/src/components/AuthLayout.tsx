import { useAuth } from "@/hooks/useAuth";
import { useSalon } from "@/providers/useSalon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { LOGIN_PATH } from "@/const";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Scissors as ScissorsIcon,
  UserCircle,
  DollarSign,
  MessageSquare,
  FileCheck,
  PanelLeft,
  Building2,
  Settings,
} from "lucide-react";
import {
  type CSSProperties,
  type ReactNode,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate } from "react-router";
import { AuthLayoutSkeleton } from "./AuthLayoutSkeleton";
import { Button } from "./ui/button";
import { MobileTopBar } from "./MobileTopBar";
import MobileSidebarCloser from "./MobileSidebarCloser";
import { SidebarUserMenu } from "./SidebarUserMenu";
import { trpc } from "@/providers/trpc";
import CreateSalonForm from "./CreateSalonForm";
import { getSegmentLabel, type SalonSegment } from "@contracts/segment-labels";
import {
  getThemeCssVars,
  defaultThemeForSegment,
} from "@contracts/segment-palettes";

const planLabels: Record<string, string> = {
  free: "Grátis",
  essential: "Essencial",
  pro: "Pro",
  business: "Business",
};

function Logo({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6 2C6 2 3 6 3 9C3 12 5 14 7 14C9 14 11 12 11 9C11 6 8 2 8 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-primary"
      />
      <path
        d="M18 2C18 2 21 6 21 9C21 12 19 14 17 14C15 14 13 12 13 9C13 6 16 2 16 2"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-secondary"
      />
      <circle
        cx="7"
        cy="18"
        r="2"
        fill="currentColor"
        className="text-primary"
      />
      <circle
        cx="17"
        cy="18"
        r="2"
        fill="currentColor"
        className="text-secondary"
      />
    </svg>
  );
}

function getMenuItems(segment: SalonSegment) {
  const labels = getSegmentLabel;
  return [
    { icon: LayoutDashboard, label: "Início", path: "/dashboard" },
    { icon: Users, label: labels(segment, "client"), path: "/clients" },
    {
      icon: CalendarDays,
      label: labels(segment, "appointment"),
      path: "/appointments",
    },
    {
      icon: ScissorsIcon,
      label: labels(segment, "service"),
      path: "/services",
    },
    {
      icon: UserCircle,
      label: labels(segment, "professional"),
      path: "/professionals",
    },
    { icon: DollarSign, label: "Financeiro", path: "/financial" },
    { icon: MessageSquare, label: "Mensagens", path: "/communications" },
    { icon: FileCheck, label: "Termos e Autorizações", path: "/consent" },
    { icon: Settings, label: "Configurações", path: "/settings" },
  ];
}

const SIDEBAR_WIDTH_KEY = "sidebar-width";
const DEFAULT_WIDTH = 280;
const MIN_WIDTH = 200;
const MAX_WIDTH = 480;

export default function AuthLayout({ children }: { children: ReactNode }) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const saved = localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { isLoading, user } = useAuth();
  const { salon } = useSalon();

  useEffect(() => {
    localStorage.setItem(SIDEBAR_WIDTH_KEY, sidebarWidth.toString());
  }, [sidebarWidth]);

  // Tema também no <html>: portais (sheet mobile, dialogs) ficam fora da
  // árvore do SidebarProvider e herdariam apenas a cor do :root
  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    const themeId = salon
      ? (salon.theme ?? defaultThemeForSegment(salon.segment).id)
      : null;
    const vars = themeId ? getThemeCssVars(themeId) : {};
    const previous: Record<string, string> = {};
    for (const [key, value] of Object.entries(vars)) {
      previous[key] = root.style.getPropertyValue(key);
      root.style.setProperty(key, value);
    }
    return () => {
      for (const key of Object.keys(vars)) {
        if (previous[key]) root.style.setProperty(key, previous[key]);
        else root.style.removeProperty(key);
      }
    };
  }, [salon]);

  if (isLoading) {
    return <AuthLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex flex-col items-center gap-8 p-8 max-w-md w-full">
          <div className="flex flex-col items-center gap-6">
            <h1 className="text-2xl font-semibold tracking-tight text-center">
              StudioFlow
            </h1>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Acesse sua conta para gerenciar seu negócio.
            </p>
          </div>
          <Button
            onClick={() => {
              window.location.href = LOGIN_PATH;
            }}
            size="lg"
            className="w-full shadow-lg hover:shadow-xl transition-all"
          >
            Entrar
          </Button>
        </div>
      </div>
    );
  }

  const themeId = salon
    ? (salon.theme ?? defaultThemeForSegment(salon.segment).id)
    : null;

  return (
    <SidebarProvider
      style={
        {
          ...(themeId ? getThemeCssVars(themeId) : {}),
          "--sidebar-width": `${sidebarWidth}px`,
        } as CSSProperties
      }
    >
      <MobileSidebarCloser />
      <AuthLayoutContent setSidebarWidth={setSidebarWidth}>
        {children}
      </AuthLayoutContent>
    </SidebarProvider>
  );
}

type AuthLayoutContentProps = {
  children: ReactNode;
  setSidebarWidth: (width: number) => void;
};

function AuthLayoutContent({
  children,
  setSidebarWidth,
}: AuthLayoutContentProps) {
  const { user } = useAuth();
  const { salon, setSalon } = useSalon();
  const location = useLocation();
  const navigate = useNavigate();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const activeMenuItem = getMenuItems(salon?.segment ?? "beauty_salon").find(
    item => item.path === location.pathname
  );
  const isMobile = useIsMobile();

  const { data: salonsData } = trpc.salon.list.useQuery(undefined, {
    enabled: !!user,
  });

  useEffect(() => {
    if (salonsData && salonsData.length > 0 && !salon) {
      const first = salonsData[0];
      setSalon({
        id: first.id,
        name: first.name,
        slug: first.slug,
        segment: first.segment,
        role: first.role,
        plan: first.plan,
        schedule: first.schedule,
        theme: first.theme,
        clientStatus: first.clientStatus,
      });
    }
  }, [salonsData, salon, setSalon]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const newWidth = e.clientX - sidebarLeft;
      if (newWidth >= MIN_WIDTH && newWidth <= MAX_WIDTH) {
        setSidebarWidth(newWidth);
      }
    };
    const handleMouseUp = () => {
      setIsResizing(false);
    };
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  if (salonsData && salonsData.length === 0) {
    return <CreateSalonForm />;
  }

  // Wrapper só no mobile: o Sheet usa h-full (layout viewport), que fica maior
  // que a tela visível quando a barra de URL some — o wrapper h-dvh limita a
  // altura ao viewport real. No desktop o wrapper fica fora do DOM (sidebar
  // desktop depende da estrutura exata de flex children do shadcn).
  const sidebarBody = (
    <>
      <SidebarHeader className="h-16 shrink-0 justify-center">
            <div className="flex items-center gap-3 px-2 transition-all w-full">
              <button
                onClick={toggleSidebar}
                className="h-8 w-8 flex items-center justify-center hover:bg-accent rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring shrink-0"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4 text-muted-foreground" />
              </button>
              {!isCollapsed ? (
                <div className="flex items-center gap-2 min-w-0">
                  <Logo className="h-5 w-5" />
                  <span className="font-serif font-semibold tracking-tight truncate">
                    StudioFlow
                  </span>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          {!isCollapsed && salon && (
            <div className="px-4 pb-2 shrink-0">
              <div className="flex items-center gap-2 rounded-md bg-muted/50 px-3 py-2">
                <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{salon.name}</p>
                  <p className="text-[10px] text-muted-foreground uppercase">
                    {planLabels[salon.plan] ?? salon.plan}
                  </p>
                </div>
              </div>
            </div>
          )}

          <SidebarContent className="gap-0 overflow-y-auto">
            <SidebarMenu className="px-2 py-1">
              {getMenuItems(salon?.segment ?? "beauty_salon").map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      onClick={() => navigate(item.path)}
                      tooltip={item.label}
                      className={`h-10 transition-all font-normal data-[active=true]:bg-primary/10 data-[active=true]:text-primary`}
                    >
                      <item.icon
                        className={`h-4 w-4 ${isActive ? "text-primary" : ""}`}
                      />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="p-3 shrink-0">
            <SidebarUserMenu />
          </SidebarFooter>
    </>
  );

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r-0">
          {isMobile ? (
            <div className="flex h-dvh flex-col overflow-hidden">
              {sidebarBody}
            </div>
          ) : (
            sidebarBody
          )}
        </Sidebar>
        <div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-primary/20 transition-colors ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (isCollapsed) return;
            setIsResizing(true);
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset>
        {isMobile && (
          <MobileTopBar title={activeMenuItem?.label ?? "Menu"} />
        )}
        <main className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </SidebarInset>
    </>
  );
}
