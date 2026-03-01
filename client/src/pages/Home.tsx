import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText, Lock, Mail } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

/**
 * Home - Página de Login
 * Design: Dark Tech Professional com foco na autenticação
 */
export default function Home() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simular login - será substituído por chamada à API
    setTimeout(() => {
      setLoading(false);
      navigate("/dashboard");
    }, 1000);
  };

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

        {/* Form */}
        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email */}
          <div>
            <Label className="text-foreground mb-2 block text-sm font-medium">
              E-mail
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <Label className="text-foreground mb-2 block text-sm font-medium">
              Senha
            </Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-border bg-input cursor-pointer"
            />
            <span className="text-sm text-muted-foreground">Lembrar-me</span>
          </label>

          {/* Login Button */}
          <Button
            type="submit"
            disabled={loading}
            className="btn-glow w-full py-2 font-semibold"
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>

        {/* Divider */}
        <div className="my-6 relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">ou</span>
          </div>
        </div>

        {/* Demo Access */}
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/dashboard")}
          className="w-full"
        >
          Acessar Demo
        </Button>

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
