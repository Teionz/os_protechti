import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/Layout";
import { Eye, Edit, Trash2, Plus, TrendingUp, Loader2, Search } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * SalesList - Listagem de Vendas
 * Design: Dark Tech Professional com integração tRPC
 */
export default function SalesList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Buscar dados do banco
  const { data: sales = [], isLoading, refetch } = trpc.sales.list.useQuery();

  // Mutation para deletar
  const deleteSaleMutation = trpc.sales.delete.useMutation({
    onSuccess: () => {
      toast.success("Venda deletada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar: ${error.message}`);
    },
  });

  // Filtrar vendas
  const filteredSales = sales.filter((sale: any) => {
    const matchesSearch =
      sale.saleNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || sale.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Estatísticas
  const stats = {
    total: sales.length,
    completed: sales.filter((s: any) => s.status === "completed").length,
    pending: sales.filter((s: any) => s.status === "pending").length,
    totalRevenue: sales
      .filter((s: any) => s.status === "completed")
      .reduce((sum: number, s: any) => sum + (Number(s.total) || 0), 0),
    totalCommission: sales.reduce((sum: number, s: any) => sum + (Number(s.commission) || 0), 0),
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      cancelled: "bg-red-500/20 text-red-400 border-red-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      completed: "Finalizada",
      cancelled: "Cancelada",
    };
    return labels[status] || status;
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar esta venda?")) {
      deleteSaleMutation.mutate(id);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Vendas</h1>
            <p className="text-muted-foreground">Visualize e gerencie todas as suas vendas</p>
          </div>
          <Button
            onClick={() => navigate("/sales/new")}
            className="bg-accent text-background hover:bg-accent/90 gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova Venda
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card className="card-float p-4">
            <div className="text-sm text-muted-foreground mb-1">Total de Vendas</div>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </Card>
          <Card className="card-float p-4">
            <div className="text-sm text-muted-foreground mb-1">Finalizadas</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.completed}</div>
          </Card>
          <Card className="card-float p-4">
            <div className="text-sm text-muted-foreground mb-1">Pendentes</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
          </Card>
          <Card className="card-float p-4">
            <div className="text-sm text-muted-foreground mb-1">Faturamento</div>
            <div className="text-2xl font-bold text-accent">R$ {stats.totalRevenue.toFixed(2)}</div>
          </Card>
          <Card className="card-float p-4">
            <div className="text-sm text-muted-foreground mb-1">Comissões</div>
            <div className="text-2xl font-bold text-purple-400">R$ {stats.totalCommission.toFixed(2)}</div>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="card-float p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por número ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 bg-background border-border"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-background border border-border rounded-lg text-foreground"
            >
              <option value="all">Todos os Status</option>
              <option value="pending">Pendente</option>
              <option value="completed">Finalizada</option>
              <option value="cancelled">Cancelada</option>
            </select>
          </div>
        </Card>

        {/* Results Info */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando {filteredSales.length} de {sales.length} vendas
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : filteredSales.length === 0 ? (
          <Card className="card-float p-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma venda encontrada</p>
            <Button
              onClick={() => navigate("/sales/new")}
              className="bg-accent text-background hover:bg-accent/90"
            >
              Registrar Primeira Venda
            </Button>
          </Card>
        ) : (
          <div className="overflow-x-auto">
            <Card className="card-float">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left p-4 text-foreground font-semibold">Número</th>
                    <th className="text-left p-4 text-foreground font-semibold">Cliente</th>
                    <th className="text-left p-4 text-foreground font-semibold">Vendedor</th>
                    <th className="text-left p-4 text-foreground font-semibold">Status</th>
                    <th className="text-right p-4 text-foreground font-semibold">Valor</th>
                    <th className="text-right p-4 text-foreground font-semibold">Comissão</th>
                    <th className="text-center p-4 text-foreground font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale: any) => (
                    <tr key={sale.id} className="border-b border-border/50 hover:bg-background/50 transition">
                      <td className="p-4 text-foreground font-medium">{sale.saleNumber}</td>
                      <td className="p-4 text-foreground">{sale.client?.name || "—"}</td>
                      <td className="p-4 text-foreground">{sale.seller || "—"}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(sale.status)}`}>
                          {getStatusLabel(sale.status)}
                        </span>
                      </td>
                      <td className="p-4 text-right text-accent font-semibold">
                        R$ {Number(sale.total || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-right text-purple-400 font-semibold">
                        R$ {Number(sale.commission || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/sales/${sale.id}`)}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/sales/edit/${sale.id}`)}
                            className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(sale.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
