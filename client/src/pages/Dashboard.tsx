import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Plus, FileText, Users, DollarSign, TrendingUp, ShoppingCart, Loader2, BarChart3 } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

/**
 * Dashboard - Página principal do sistema
 * Design: Dark Tech Professional com estatísticas em tempo real
 */
export default function Dashboard() {
  const [, navigate] = useLocation();

  // Buscar dados do banco
  const { data: orders = [], isLoading: ordersLoading } = trpc.orders.list.useQuery();
  const { data: clients = [], isLoading: clientsLoading } = trpc.clients.list.useQuery();
  const { data: quotations = [], isLoading: quotationsLoading } = trpc.quotations.list.useQuery();
  const { data: sales = [], isLoading: salesLoading } = trpc.sales.list.useQuery();
  const { data: products = [], isLoading: productsLoading } = trpc.products.list.useQuery();

  const isLoading = ordersLoading || clientsLoading || quotationsLoading || salesLoading || productsLoading;

  // Calcular estatísticas
  const stats = [
    {
      title: "Ordens de Serviço",
      value: orders.length.toString(),
      icon: FileText,
      color: "text-cyan-400",
      bgColor: "bg-cyan-500/10",
      trend: orders.filter((o: any) => o.status === "in_progress").length,
      trendLabel: "em andamento",
    },
    {
      title: "Clientes",
      value: clients.length.toString(),
      icon: Users,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      trend: clients.length,
      trendLabel: "cadastrados",
    },
    {
      title: "Receita (Mês)",
      value: `R$ ${sales
        .filter((s: any) => s.status === "completed")
        .reduce((sum: number, s: any) => sum + (Number(s.total) || 0), 0)
        .toFixed(2)}`,
      icon: DollarSign,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      trend: sales.filter((s: any) => s.status === "completed").length,
      trendLabel: "vendas",
    },
    {
      title: "Orçamentos",
      value: quotations.length.toString(),
      icon: ShoppingCart,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      trend: quotations.filter((q: any) => q.status === "pending").length,
      trendLabel: "pendentes",
    },
  ];

  // Últimas ordens
  const recentOrders = orders.slice(0, 5);

  // Últimas vendas
  const recentSales = sales.slice(0, 5);

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Bem-vindo ao ProTech OS
          </h2>
          <p className="text-muted-foreground">
            Gerencie suas ordens de serviço, clientes, orçamentos e vendas de forma rápida e eficiente
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="card-float p-6">
                <div className="flex items-start justify-between mb-4">
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
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  <span>{stat.trend} {stat.trendLabel}</span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <Card className="card-float p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent/50 transition"
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

          <Card className="card-float p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent/50 transition"
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

          <Card className="card-float p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-accent/50 transition"
            onClick={() => navigate("/reports")}
          >
            <div className="w-16 h-16 rounded-full bg-purple-500/20 flex items-center justify-center mb-4">
              <BarChart3 className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Relatórios
            </h3>
            <p className="text-sm text-muted-foreground">
              Análise de ordens por período
            </p>
          </Card>
        </div>

        {/* Recent Orders and Sales */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Orders */}
          <Card className="card-float p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Ordens Recentes</h3>
            {recentOrders.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma ordem registrada</p>
            ) : (
              <div className="space-y-3">
                {recentOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background/80 transition cursor-pointer"
                    onClick={() => navigate(`/os/${order.id}`)}
                  >
                    <div>
                      <p className="font-medium text-foreground">{order.orderNumber}</p>
                      <p className="text-xs text-muted-foreground">{order.client?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent">R$ {Number(order.total || 0).toFixed(2)}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {order.status === "completed" ? "Finalizada" : order.status === "in_progress" ? "Em Andamento" : "Pendente"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              onClick={() => navigate("/os/list")}
              className="w-full mt-4 bg-background border border-border text-foreground hover:bg-background/80"
            >
              Ver Todas
            </Button>
          </Card>

          {/* Recent Sales */}
          <Card className="card-float p-6">
            <h3 className="text-lg font-bold text-foreground mb-4">Vendas Recentes</h3>
            {recentSales.length === 0 ? (
              <p className="text-muted-foreground text-sm">Nenhuma venda registrada</p>
            ) : (
              <div className="space-y-3">
                {recentSales.map((sale: any) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-3 bg-background/50 rounded-lg hover:bg-background/80 transition cursor-pointer"
                    onClick={() => navigate(`/sales/${sale.id}`)}
                  >
                    <div>
                      <p className="font-medium text-foreground">{sale.saleNumber}</p>
                      <p className="text-xs text-muted-foreground">{sale.client?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-accent">R$ {Number(sale.total || 0).toFixed(2)}</p>
                      <p className="text-xs text-purple-400">
                        Comissão: R$ {Number(sale.commission || 0).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <Button
              onClick={() => navigate("/sales/list")}
              className="w-full mt-4 bg-background border border-border text-foreground hover:bg-background/80"
            >
              Ver Todas
            </Button>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
