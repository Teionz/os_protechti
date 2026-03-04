import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { getLoginUrl } from "@/const";

/**
 * Home - Página de Login com OAuth Manus
 * Design: Dark Tech Professional com foco na autenticação
 */
export default function Home() {
  const [, navigate] = useLocation();
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  // Se já está autenticado, redireciona para dashboard
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, user, navigate]);

  // Se está carregando, mostra spinner
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-accent mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <Card className="card-float w-full max-w-md p-8 relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 rounded-lg bg-accent/20 flex items-center justify-center">
            <FileText className="w-7 h-7 text-accent" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">ProTech OS</h1>
            <p className="text-xs text-muted-foreground">Sistema de Gestão</p>
          </div>
        </div>

        {/* Title */}
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground mb-2">Bem-vindo</h2>
          <p className="text-muted-foreground text-sm">
            Faça login para acessar o sistema de ordens de serviço
          </p>
        </div>

        {/* OAuth Login Button */}
        <div className="space-y-4">
          <Button
            onClick={() => {
              window.location.href = getLoginUrl();
            }}
            className="btn-glow w-full py-2 font-semibold"
          >
            Entrar com Manus
          </Button>

          {/* Demo Access */}
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/dashboard")}
            className="w-full"
          >
            Acessar Demo
          </Button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-xs text-muted-foreground">
            ProTech Soluções em TI © 2026
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Sistema de Gestão de Ordens de Serviço
          </p>
        </div>
      </Card>
    </div>
  );
}
