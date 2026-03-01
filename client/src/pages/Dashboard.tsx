import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Plus, FileText, Users, DollarSign } from "lucide-react";
import { useLocation } from "wouter";

/**
 * Dashboard - Página principal do sistema
 * Design: Dark Tech Professional com cards flutuantes e glow effects
 */
export default function Dashboard() {
  const [, navigate] = useLocation();

  const stats = [
    {
      title: "Ordens de Serviço",
      value: "12",
      icon: FileText,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
    },
    {
      title: "Clientes",
      value: "8",
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      title: "Receita (Mês)",
      value: "R$ 3.450",
      icon: DollarSign,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
    },
  ];

  return (
    <Layout>
      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo ao ProTech OS
          </h2>
          <p className="text-muted-foreground">
            Gerencie suas ordens de serviço de forma rápida e eficiente
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="card-float p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">
                      {stat.title}
                    </p>
                    <p className="text-3xl font-bold text-foreground">
                      {stat.value}
                    </p>
                  </div>
                  <div className={`${stat.bgColor} p-3 rounded-lg`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="card-float p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:glow-accent"
            onClick={() => navigate("/os/new")}
          >
            <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mb-4">
              <Plus className="w-8 h-8 text-accent" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Criar Nova OS
            </h3>
            <p className="text-sm text-muted-foreground">
              Registre uma nova ordem de serviço
            </p>
          </Card>

          <Card className="card-float p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:glow-accent"
            onClick={() => navigate("/os/list")}
          >
            <div className="w-16 h-16 rounded-full bg-blue-500/20 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Listar Ordens
            </h3>
            <p className="text-sm text-muted-foreground">
              Visualize todas as ordens de serviço
            </p>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
