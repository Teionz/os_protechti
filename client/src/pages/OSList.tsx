import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { Plus, Search, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * OSList - Listagem de Ordens de Serviço
 * Design: Dark Tech Professional com integração tRPC
 */
export default function OSList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Buscar dados do banco
  const { data: orders = [], isLoading, refetch } = trpc.orders.list.useQuery();

  // Mutation para deletar
  const deleteOrderMutation = trpc.orders.delete.useMutation({
    onSuccess: () => {
      toast.success("Ordem deletada com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar: ${error.message}`);
    },
  });

  // Filtrar ordens
  const filteredOrders = orders.filter((order: any) => {
    const matchesSearch =
      order.orderNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.client?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.equipmentName?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || order.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Estatísticas
  const stats = {
    total: orders.length,
    completed: orders.filter((o: any) => o.status === "completed").length,
    inProgress: orders.filter((o: any) => o.status === "in_progress").length,
    totalValue: orders.reduce((sum: number, o: any) => sum + (Number(o.total) || 0), 0),
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      budgeting: "bg-blue-500/20 text-blue-400 border-blue-500/30",
      awaiting_approval: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      in_progress: "bg-purple-500/20 text-purple-400 border-purple-500/30",
      awaiting_pickup: "bg-orange-500/20 text-orange-400 border-orange-500/30",
      completed: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      budgeting: "Orçando",
      awaiting_approval: "Aguardando",
      in_progress: "Em Andamento",
      awaiting_pickup: "Aguardando Retirada",
      completed: "Finalizada",
    };
    return labels[status] || status;
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar esta ordem?")) {
      deleteOrderMutation.mutate(id);
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Ordens de Serviço</h1>
            <p className="text-muted-foreground">Visualize e gerencie todas as suas ordens</p>
          </div>
          <Button
            onClick={() => navigate("/os/new")}
            className="bg-accent text-background hover:bg-accent/90 gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova OS
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="card-float p-4">
            <div className="text-sm text-muted-foreground mb-1">Total de Ordens</div>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </Card>
          <Card className="card-float p-4">
            <div className="text-sm text-muted-foreground mb-1">Em Andamento</div>
            <div className="text-2xl font-bold text-purple-400">{stats.inProgress}</div>
          </Card>
          <Card className="card-float p-4">
            <div className="text-sm text-muted-foreground mb-1">Finalizadas</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.completed}</div>
          </Card>
          <Card className="card-float p-4">
            <div className="text-sm text-muted-foreground mb-1">Valor Total</div>
            <div className="text-2xl font-bold text-accent">R$ {stats.totalValue.toFixed(2)}</div>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="card-float p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex items-center gap-2">
              <Search className="w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar por número, cliente ou equipamento..."
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
              <option value="budgeting">Orçando</option>
              <option value="awaiting_approval">Aguardando Aprovação</option>
              <option value="in_progress">Em Andamento</option>
              <option value="awaiting_pickup">Aguardando Retirada</option>
              <option value="completed">Finalizada</option>
            </select>
          </div>
        </Card>

        {/* Results Info */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando {filteredOrders.length} de {orders.length} ordens
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : filteredOrders.length === 0 ? (
          <Card className="card-float p-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhuma ordem encontrada</p>
            <Button
              onClick={() => navigate("/os/new")}
              className="bg-accent text-background hover:bg-accent/90"
            >
              Criar Primeira Ordem
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
                    <th className="text-left p-4 text-foreground font-semibold">Equipamento</th>
                    <th className="text-left p-4 text-foreground font-semibold">Status</th>
                    <th className="text-right p-4 text-foreground font-semibold">Valor</th>
                    <th className="text-center p-4 text-foreground font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order: any) => {
                    // Exibir equipmentName se existir, senão mostrar equipmentTag
                    const displayEquipment = order.equipmentName || order.equipmentTag || "—";
                    return (
                      <tr key={order.id} className="border-b border-border/50 hover:bg-background/50 transition">
                      <td className="p-4 text-foreground font-medium">{order.orderNumber}</td>
                      <td className="p-4 text-foreground">{order.client?.name || "—"}</td>
                      <td className="p-4 text-foreground">{displayEquipment}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </td>
                      <td className="p-4 text-right text-accent font-semibold">
                        R$ {Number(order.total || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/os/${order.id}`)}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/os/edit/${order.id}`)}
                            className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(order.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          </div>
        )}
      </div>
    </Layout>
  );
}
