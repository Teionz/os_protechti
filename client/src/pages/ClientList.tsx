import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Eye, Edit, Trash2, Plus, Search, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * ClientList - Listagem de Clientes
 * Design: Dark Tech Professional com tabela responsiva
 * Dados: Conectado ao tRPC e banco de dados MySQL
 */
export default function ClientList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Buscar clientes do banco de dados via tRPC
  const { data: clientes = [], isLoading, error } = trpc.clients.list.useQuery();
  const deleteClientMutation = trpc.clients.delete.useMutation({
    onSuccess: () => {
      toast.success("Cliente deletado com sucesso!");
      // Recarregar lista
      trpc.useUtils().clients.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar cliente: ${error.message}`);
    },
  });

  // Filtrar clientes por busca
  const filtrados = useMemo(() => {
    return clientes.filter(
      (cliente) =>
        cliente.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cliente.cnpjCpf?.includes(searchTerm) ||
        cliente.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [clientes, searchTerm]);

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Deseja deletar o cliente ${name}?`)) {
      deleteClientMutation.mutate(id);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center text-destructive">
            <p>Erro ao carregar clientes: {error.message}</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8">
        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Clientes</h1>
            <p className="text-muted-foreground">
              Visualize e gerencie todos os seus clientes
            </p>
          </div>
          <Button
            onClick={() => navigate("/clients/new")}
            className="btn-glow gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Cliente
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="card-float p-6 mb-6">
          <div className="flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ/CPF ou e-mail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-foreground placeholder-muted-foreground focus:outline-none"
            />
          </div>
        </Card>

        {/* Results Count */}
        <div className="mb-4 text-sm text-muted-foreground">
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Carregando clientes...
            </span>
          ) : (
            `Mostrando ${filtrados.length} de ${clientes.length} clientes`
          )}
        </div>

        {/* Table */}
        <Card className="card-float overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-background/50">
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
                    Nome
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
                    CNPJ/CPF
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
                    E-mail
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
                    Telefone
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
                    Cidade
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-accent" />
                        <span className="text-muted-foreground">Carregando...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center">
                      <p className="text-muted-foreground mb-4">
                        Nenhum cliente encontrado
                      </p>
                      <Button
                        onClick={() => navigate("/clients/new")}
                        className="btn-glow gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Criar Primeiro Cliente
                      </Button>
                    </td>
                  </tr>
                ) : (
                  filtrados.map((cliente) => (
                    <tr
                      key={cliente.id}
                      className="border-b border-border/50 hover:bg-accent/5 transition-colors"
                    >
                      <td className="py-4 px-6 text-foreground font-medium">
                        {cliente.name}
                      </td>
                      <td className="py-4 px-6 text-foreground text-sm">
                        {cliente.cnpjCpf || "-"}
                      </td>
                      <td className="py-4 px-6 text-foreground text-sm">
                        {cliente.email || "-"}
                      </td>
                      <td className="py-4 px-6 text-foreground text-sm">
                        {cliente.phone || "-"}
                      </td>
                      <td className="py-4 px-6 text-foreground text-sm">
                        {cliente.city || "-"}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => navigate(`/clients/${cliente.id}`)}
                            variant="ghost"
                            size="sm"
                            title="Visualizar"
                            className="hover:bg-accent/20"
                          >
                            <Eye className="w-4 h-4 text-accent" />
                          </Button>
                          <Button
                            onClick={() => navigate(`/clients/edit/${cliente.id}`)}
                            variant="ghost"
                            size="sm"
                            title="Editar"
                            className="hover:bg-accent/20"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(cliente.id, cliente.name)}
                            variant="ghost"
                            size="sm"
                            title="Deletar"
                            disabled={deleteClientMutation.isPending}
                            className="hover:bg-destructive/20"
                          >
                            {deleteClientMutation.isPending ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4 text-destructive" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </Layout>
  );
}
