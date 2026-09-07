import { useEffect } from "react";
import { useLocation } from "react-router";
import { useSidebar } from "@/components/ui/sidebar";

/** Fecha o sheet da sidebar mobile sempre que a rota muda (desktop não usa openMobile) */
export default function MobileSidebarCloser() {
  const { pathname } = useLocation();
  const { setOpenMobile } = useSidebar();

  useEffect(() => {
    setOpenMobile(false);
  }, [pathname, setOpenMobile]);

  return null;
}
