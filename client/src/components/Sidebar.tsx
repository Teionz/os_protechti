import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  BarChart3,
  Package,
  Wrench,
} from "lucide-react";
import { useState } from "react";

/**
 * Sidebar - Menu lateral reutilizável
 * Aparece em todas as páginas (exceto login)
 * Contém: Links de navegação, ícones, status ativo
 */
export default function Sidebar() {
  const [, navigate] = useLocation();
  const [isOpen, setIsOpen] = useState(true);

  const menuItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      badge: null,
    },
    {
      label: "Ordens de Serviço",
      icon: FileText,
      href: "/os/list",
      badge: "12",
    },
    {
      label: "Clientes",
      icon: Users,
      href: "/clientes",
      badge: null,
    },
    {
      label: "Produtos",
      icon: Package,
      href: "/produtos",
      badge: null,
    },
    {
      label: "Serviços",
      icon: Wrench,
      href: "/servicos",
      badge: null,
    },
    {
      label: "Relatórios",
      icon: BarChart3,
      href: "/relatorios",
      badge: null,
    },
  ];

  const bottomMenuItems = [
    {
      label: "Configurações",
      icon: Settings,
      href: "/configuracoes",
    },
  ];

  return (
    <>
      {/* Sidebar Desktop */}
      <aside
        className={`hidden md:flex flex-col fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 ${
          isOpen ? "w-64" : "w-20"
        } pt-20 z-40`}
      >
        {/* Menu Items */}
        <nav className="flex-1 px-3 py-6 space-y-2 overflow-y-auto">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                onClick={() => navigate(item.href)}
                variant="ghost"
                className={`w-full justify-start gap-3 px-4 py-2 h-auto hover:bg-accent/10 transition-colors ${
                  !isOpen && "justify-center"
                }`}
                title={!isOpen ? item.label : ""}
              >
                <Icon className="w-5 h-5 text-accent flex-shrink-0" />
                {isOpen && (
                  <>
                    <span className="flex-1 text-left text-foreground">
                      {item.label}
                    </span>
                    {item.badge && (
                      <span className="px-2 py-1 text-xs font-semibold bg-accent text-accent-foreground rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Divider */}
        <div className="border-t border-border mx-3 my-4"></div>

        {/* Bottom Menu */}
        <nav className="px-3 py-4 space-y-2">
          {bottomMenuItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                onClick={() => navigate(item.href)}
                variant="ghost"
                className={`w-full justify-start gap-3 px-4 py-2 h-auto hover:bg-accent/10 transition-colors ${
                  !isOpen && "justify-center"
                }`}
                title={!isOpen ? item.label : ""}
              >
                <Icon className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                {isOpen && (
                  <span className="flex-1 text-left text-foreground">
                    {item.label}
                  </span>
                )}
              </Button>
            );
          })}
        </nav>

        {/* Toggle Button */}
        <div className="px-3 py-4 border-t border-border">
          <Button
            onClick={() => setIsOpen(!isOpen)}
            variant="outline"
            size="sm"
            className="w-full"
          >
            {isOpen ? "←" : "→"}
          </Button>
        </div>
      </aside>

      {/* Sidebar Mobile - Drawer */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border">
        <nav className="flex items-center justify-around px-2 py-3 overflow-x-auto">
          {menuItems.slice(0, 4).map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.href}
                onClick={() => navigate(item.href)}
                variant="ghost"
                size="sm"
                className="flex flex-col items-center gap-1 h-auto py-2 px-2"
                title={item.label}
              >
                <Icon className="w-5 h-5 text-accent" />
                <span className="text-xs text-foreground">{item.label}</span>
              </Button>
            );
          })}
        </nav>
      </div>
    </>
  );
}
