import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Plus, Search, Eye, Edit, Trash2, Download, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * QuotationList - Listagem de Orçamentos
 * Design: Dark Tech Professional com integração tRPC
 */
export default function QuotationList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Buscar dados do banco
  const { data: quotations = [], isLoading, refetch } = trpc.quotations.list.useQuery();

  // Mutation para deletar
  const deleteQuotationMutation = trpc.quotations.delete.useMutation({
    onSuccess: () => {
      toast.success("Orçamento deletado com sucesso!");
      refetch();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar: ${error.message}`);
    },
  });

  // Filtrar orçamentos
  const filteredQuotations = quotations.filter((quotation: any) => {
    const matchesSearch =
      quotation.quotationNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.client?.name?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || quotation.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Estatísticas
  const stats = {
    total: quotations.length,
    pending: quotations.filter((q: any) => q.status === "pending").length,
    approved: quotations.filter((q: any) => q.status === "approved").length,
    totalValue: quotations.reduce((sum: number, q: any) => sum + (Number(q.total) || 0), 0),
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      pending: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
      approved: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      rejected: "bg-red-500/20 text-red-400 border-red-500/30",
      converted: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400 border-gray-500/30";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: "Pendente",
      approved: "Aprovado",
      rejected: "Rejeitado",
      converted: "Convertido",
    };
    return labels[status] || status;
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Tem certeza que deseja deletar este orçamento?")) {
      deleteQuotationMutation.mutate(id);
    }
  };

  const handleConvert = (id: number) => {
    const quotation = quotations.find((q: any) => q.id === id);
    if (quotation) {
      // Navegar para criar nova OS com dados do orçamento
      navigate(`/os/new?quotationId=${id}`);
      toast.success("Orçamento convertido em Ordem de Serviço!");
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Orçamentos</h1>
            <p className="text-muted-foreground">Visualize e gerencie todos os seus orçamentos</p>
          </div>
          <Button
            onClick={() => navigate("/quotations/new")}
            className="bg-accent text-background hover:bg-accent/90 gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Orçamento
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="card-float p-4">
            <div className="text-sm text-muted-foreground mb-1">Total de Orçamentos</div>
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
          </Card>
          <Card className="card-float p-4">
            <div className="text-sm text-muted-foreground mb-1">Pendentes</div>
            <div className="text-2xl font-bold text-yellow-400">{stats.pending}</div>
          </Card>
          <Card className="card-float p-4">
            <div className="text-sm text-muted-foreground mb-1">Aprovados</div>
            <div className="text-2xl font-bold text-emerald-400">{stats.approved}</div>
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
              <option value="approved">Aprovado</option>
              <option value="rejected">Rejeitado</option>
              <option value="converted">Convertido</option>
            </select>
          </div>
        </Card>

        {/* Results Info */}
        <div className="mb-4 text-sm text-muted-foreground">
          Mostrando {filteredQuotations.length} de {quotations.length} orçamentos
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-accent" />
          </div>
        ) : filteredQuotations.length === 0 ? (
          <Card className="card-float p-12 text-center">
            <p className="text-muted-foreground mb-4">Nenhum orçamento encontrado</p>
            <Button
              onClick={() => navigate("/quotations/new")}
              className="bg-accent text-background hover:bg-accent/90"
            >
              Criar Primeiro Orçamento
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
                    <th className="text-left p-4 text-foreground font-semibold">Data</th>
                    <th className="text-left p-4 text-foreground font-semibold">Status</th>
                    <th className="text-right p-4 text-foreground font-semibold">Valor</th>
                    <th className="text-center p-4 text-foreground font-semibold">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredQuotations.map((quotation: any) => (
                    <tr key={quotation.id} className="border-b border-border/50 hover:bg-background/50 transition">
                      <td className="p-4 text-foreground font-medium">{quotation.quotationNumber}</td>
                      <td className="p-4 text-foreground">{quotation.client?.name || "—"}</td>
                      <td className="p-4 text-foreground">
                        {quotation.createdAt ? new Date(quotation.createdAt).toLocaleDateString("pt-BR") : "—"}
                      </td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(quotation.status)}`}>
                          {getStatusLabel(quotation.status)}
                        </span>
                      </td>
                      <td className="p-4 text-right text-accent font-semibold">
                        R$ {Number(quotation.total || 0).toFixed(2)}
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => navigate(`/quotations/${quotation.id}`)}
                            className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/quotations/edit/${quotation.id}`)}
                            className="p-2 text-amber-400 hover:bg-amber-500/10 rounded-lg transition"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {quotation.status === "approved" && (
                            <button
                              onClick={() => handleConvert(quotation.id)}
                              className="p-2 text-purple-400 hover:bg-purple-500/10 rounded-lg transition"
                              title="Converter em OS"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(quotation.id)}
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
