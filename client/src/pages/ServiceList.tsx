import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Plus, Search, Eye, Edit, Trash2, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * ServiceList - Listagem de Serviços
 * Design: Dark Tech Professional
 * Dados: Conectado ao tRPC e banco de dados MySQL
 */
export default function ServiceList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("TODOS");

  // Buscar serviços do banco de dados via tRPC
  const { data: servicos = [], isLoading, error } = trpc.services.list.useQuery();
  const deleteServiceMutation = trpc.services.delete.useMutation({
    onSuccess: () => {
      toast.success("Serviço deletado com sucesso!");
      trpc.useUtils().services.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar serviço: ${error.message}`);
    },
  });

  // Filtrar serviços por busca e categoria
  const filteredServices = useMemo(() => {
    return servicos.filter((service) => {
      const matchesSearch =
        service.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "TODOS" || service.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [servicos, searchTerm, categoryFilter]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    return {
      total: servicos.length,
      ativos: servicos.filter(s => s.status === "active").length,
      precoMedio: servicos.length > 0 
        ? servicos.reduce((acc, s) => acc + Number(s.price || 0), 0) / servicos.length
        : 0,
    };
  }, [servicos]);

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Deseja deletar o serviço ${name}?`)) {
      deleteServiceMutation.mutate(id);
    }
  };

  const handleEdit = (id: number) => {
    navigate(`/services/edit/${id}`);
  };

  const handleView = (id: number) => {
    navigate(`/services/${id}`);
  };

  const getCategoryLabel = (category: string | null | undefined) => {
    const categories: Record<string, string> = {
      MANUTENCAO: "Manutenção",
      SOFTWARE: "Software",
      HARDWARE: "Hardware",
      RECUPERACAO: "Recuperação",
    };
    return categories[category || ""] || category || "Sem categoria";
  };

  const getCategoryColor = (category: string | null | undefined) => {
    const colors: Record<string, string> = {
      MANUTENCAO: "bg-blue-500/20 text-blue-400",
      SOFTWARE: "bg-purple-500/20 text-purple-400",
      HARDWARE: "bg-orange-500/20 text-orange-400",
      RECUPERACAO: "bg-red-500/20 text-red-400",
    };
    return colors[category || ""] || "bg-gray-500/20 text-gray-400";
  };

  if (error) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center text-destructive">
            <p>Erro ao carregar serviços: {error.message}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-accent mb-2">Serviços</h1>
            <p className="text-muted-foreground">Gerenciar serviços oferecidos pela empresa</p>
          </div>
          <Button
            onClick={() => navigate("/services/new")}
            className="btn-glow gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Serviço
          </Button>
        </div>

        {/* CARDS DE ESTATÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="card-float p-6">
            <div className="text-muted-foreground text-sm mb-2">Total de Serviços</div>
            <div className="text-3xl font-bold text-accent">{isLoading ? "-" : stats.total}</div>
          </Card>
          <Card className="card-float p-6">
            <div className="text-muted-foreground text-sm mb-2">Serviços Ativos</div>
            <div className="text-3xl font-bold text-accent">{isLoading ? "-" : stats.ativos}</div>
          </Card>
          <Card className="card-float p-6">
            <div className="text-muted-foreground text-sm mb-2">Preço Médio</div>
            <div className="text-3xl font-bold text-accent">
              {isLoading ? "-" : `R$ ${stats.precoMedio.toFixed(2)}`}
            </div>
          </Card>
        </div>

        {/* FILTROS E BUSCA */}
        <Card className="card-float p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-accent" />
              <input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 bg-background border border-border rounded-lg px-4 py-2 text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-background border border-border text-foreground rounded-lg focus:outline-none focus:border-accent"
            >
              <option value="TODOS">Todas as Categorias</option>
              <option value="MANUTENCAO">Manutenção</option>
              <option value="SOFTWARE">Software</option>
              <option value="HARDWARE">Hardware</option>
              <option value="RECUPERACAO">Recuperação</option>
            </select>
          </div>
        </Card>

        {/* TABELA DE SERVIÇOS */}
        <Card className="card-float overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-left p-4 text-accent font-bold">Serviço</th>
                  <th className="text-left p-4 text-accent font-bold">Categoria</th>
                  <th className="text-left p-4 text-accent font-bold">Descrição</th>
                  <th className="text-right p-4 text-accent font-bold">Preço</th>
                  <th className="text-center p-4 text-accent font-bold">Tempo Est.</th>
                  <th className="text-center p-4 text-accent font-bold">Status</th>
                  <th className="text-center p-4 text-accent font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-accent" />
                        <span className="text-muted-foreground">Carregando...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <tr key={service.id} className="border-b border-border/50 hover:bg-accent/5 transition">
                      <td className="p-4 text-foreground font-semibold">{service.name}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(service.category)}`}>
                          {getCategoryLabel(service.category)}
                        </span>
                      </td>
                      <td className="p-4 text-muted-foreground text-sm">
                        {service.description ? service.description.substring(0, 50) + "..." : "-"}
                      </td>
                      <td className="p-4 text-right text-accent font-semibold">R$ {Number(service.price).toFixed(2)}</td>
                      <td className="p-4 text-center text-muted-foreground">{service.estimatedTime || "-"}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${service.status === "active" ? "bg-emerald-500/20 text-emerald-400" : "bg-destructive/20 text-destructive"}`}>
                          {service.status === "active" ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleView(service.id)}
                            className="p-2 hover:bg-accent/10 rounded-lg transition text-accent"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(service.id)}
                            className="p-2 hover:bg-accent/10 rounded-lg transition text-accent"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id, service.name)}
                            disabled={deleteServiceMutation.isPending}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition text-destructive disabled:opacity-50"
                            title="Deletar"
                          >
                            {deleteServiceMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground">
                      Nenhum serviço encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
