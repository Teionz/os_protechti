import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Calendar, TrendingUp, CheckCircle, AlertCircle } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  pending: "Pendente",
  in_progress: "Em Andamento",
  completed: "Concluído",
  cancelled: "Cancelado",
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Reports() {
  const { data: orders = [], isLoading } = trpc.orders.list.useQuery();
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fmt = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
  const fmtD = (d: Date | null | undefined) => d ? new Date(d).toLocaleDateString("pt-BR") : "-";

  // Filter orders by date range
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      if (!order.createdAt) return false;
      const orderDate = new Date(order.createdAt);
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;

      if (start && orderDate < start) return false;
      if (end) {
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        if (orderDate > endOfDay) return false;
      }
      return true;
    });
  }, [orders, startDate, endDate]);

  // Calculate statistics
  const stats = useMemo(() => {
    const total = filteredOrders.reduce((sum, o) => sum + Number(o.total || 0), 0);
    const completed = filteredOrders.filter((o: any) => o.status === "completed").length;
    const pending = filteredOrders.filter((o: any) => o.status === "pending" || o.status === "budgeting" || o.status === "awaiting_approval").length;
    const inProgress = filteredOrders.filter((o: any) => o.status === "in_progress" || o.status === "awaiting_pickup").length;

    return {
      total,
      completed,
      pending,
      inProgress,
      totalOrders: filteredOrders.length,
    };
  }, [filteredOrders]);

  // Group by status
  const ordersByStatus = useMemo(() => {
    const grouped: Record<string, typeof filteredOrders> = {
      pending: [],
      in_progress: [],
      completed: [],
      cancelled: [],
    };
    filteredOrders.forEach((order: any) => {
      const status = order.status || "pending";
      if (status in grouped) {
        (grouped as any)[status].push(order);
      }
    });
    return grouped;
  }, [filteredOrders]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-muted-foreground">Carregando relatórios...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Relatórios</h1>
          <p className="text-muted-foreground">Análise de ordens de serviço por período</p>
        </div>

        {/* Date Filter */}
        <Card className="p-6 mb-6 border-border/50">
          <div className="flex flex-col md:flex-row gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Data Inicial
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-foreground mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Data Final
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-background border-border"
              />
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setStartDate("");
                setEndDate("");
              }}
            >
              Limpar Filtro
            </Button>
          </div>
        </Card>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="p-4 bg-card border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <TrendingUp className="w-5 h-5 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Receita Total</p>
                <p className="text-2xl font-bold text-accent">{fmt(stats.total)}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total de OS</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalOrders}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Concluídas</p>
                <p className="text-2xl font-bold text-foreground">{stats.completed}</p>
              </div>
            </div>
          </Card>

          <Card className="p-4 bg-card border-border/50">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <AlertCircle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Pendentes</p>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Summary */}
          <Card className="p-6 border-border/50">
            <h2 className="text-lg font-semibold text-foreground mb-4">Resumo por Status</h2>
            <div className="space-y-3">
              {Object.entries(STATUS_LABELS).map(([status, label]) => {
                const count = ordersByStatus[status as keyof typeof ordersByStatus]?.length || 0;
                const percentage = stats.totalOrders > 0 ? (count / stats.totalOrders) * 100 : 0;
                return (
                  <div key={status}>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-foreground">{label}</span>
                      <span className="text-sm text-muted-foreground">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === "completed"
                            ? "bg-green-500"
                            : status === "pending"
                            ? "bg-yellow-500"
                            : status === "in_progress"
                            ? "bg-blue-500"
                            : "bg-red-500"
                        }`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Revenue Summary */}
          <Card className="p-6 border-border/50">
            <h2 className="text-lg font-semibold text-foreground mb-4">Resumo Financeiro</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-3 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Total de OS</span>
                <span className="font-semibold text-foreground">{stats.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Receita Total</span>
                <span className="font-semibold text-accent">{fmt(stats.total)}</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-border/30">
                <span className="text-sm text-muted-foreground">Ticket Médio</span>
                <span className="font-semibold text-foreground">
                  {fmt(stats.totalOrders > 0 ? stats.total / stats.totalOrders : 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">Taxa de Conclusão</span>
                <span className="font-semibold text-green-500">
                  {stats.totalOrders > 0 ? ((stats.completed / stats.totalOrders) * 100).toFixed(1) : 0}%
                </span>
              </div>
            </div>
          </Card>
        </div>

        {/* Orders Table */}
        <Card className="mt-6 border-border/50">
          <div className="p-6 border-b border-border/30">
            <h2 className="text-lg font-semibold text-foreground">Detalhes das OS</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/50 bg-background/50">
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">OS</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Cliente</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Data</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Técnico</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-foreground">Status</th>
                  <th className="px-6 py-3 text-right text-sm font-semibold text-foreground">Total</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                      Nenhuma OS encontrada no período selecionado
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((order, idx) => (
                    <tr
                      key={order.id}
                      className={`border-b border-border/30 ${
                        idx % 2 === 0 ? "bg-background/50" : "bg-background"
                      } hover:bg-accent/5 transition-colors`}
                    >
                      <td className="px-6 py-3 text-sm font-medium text-foreground">#{order.id}</td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">
                        {order.client?.name || "-"}
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">
                        {fmtD(order.createdAt)}
                      </td>
                      <td className="px-6 py-3 text-sm text-muted-foreground">
                        {order.technician || "-"}
                      </td>
                      <td className="px-6 py-3 text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[(order as any).status] || "bg-gray-100 text-gray-800"}`}>
                          {STATUS_LABELS[(order as any).status] || (order as any).status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm font-semibold text-accent text-right">
                        {fmt(Number(order.total || 0))}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
