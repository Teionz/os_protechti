import { ReactNode } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  showSidebar?: boolean;
}

/**
 * Layout - Componente wrapper para todas as páginas
 * Contém: Header + Sidebar + Conteúdo
 * 
 * Uso:
 * <Layout>
 *   <YourPageContent />
 * </Layout>
 */
export default function Layout({ children, showSidebar = true }: LayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <div className="flex">
        {/* Sidebar */}
        {showSidebar && <Sidebar />}

        {/* Content Area */}
        <main
          className={`flex-1 transition-all duration-300 ${
            showSidebar ? "md:ml-64" : ""
          } pb-20 md:pb-0`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
