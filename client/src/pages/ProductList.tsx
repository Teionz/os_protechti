import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Eye, Edit, Trash2, Plus, Search, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

/**
 * ProductList - Listagem de Produtos
 * Design: Dark Tech Professional com tabela responsiva
 * Dados: Conectado ao tRPC e banco de dados MySQL
 */
export default function ProductList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Buscar produtos do banco de dados via tRPC
  const { data: produtos = [], isLoading, error } = trpc.products.list.useQuery();
  const deleteProductMutation = trpc.products.delete.useMutation({
    onSuccess: () => {
      toast.success("Produto deletado com sucesso!");
      trpc.useUtils().products.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Erro ao deletar produto: ${error.message}`);
    },
  });

  // Filtrar produtos por busca
  const filtrados = useMemo(() => {
    return produtos.filter(
      (produto) =>
        produto.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.sku?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        produto.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [produtos, searchTerm]);

  // Calcular estatísticas
  const stats = useMemo(() => {
    return {
      total: produtos.length,
      estoque: produtos.reduce((acc, p) => acc + (p.stock || 0), 0),
      valor: produtos.reduce((acc, p) => acc + (Number(p.price) || 0) * (p.stock || 0), 0),
    };
  }, [produtos]);

  const handleDelete = (id: number, name: string) => {
    if (confirm(`Deseja deletar o produto ${name}?`)) {
      deleteProductMutation.mutate(id);
    }
  };

  if (error) {
    return (
      <Layout>
        <div className="container py-8">
          <div className="text-center text-destructive">
            <p>Erro ao carregar produtos: {error.message}</p>
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
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Produtos
            </h1>
            <p className="text-muted-foreground">
              Visualize e gerencie todos os seus produtos
            </p>
          </div>
          <Button
            onClick={() => navigate("/products/new")}
            className="btn-glow gap-2"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </Button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="card-float p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Total de Produtos
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? "-" : stats.total}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
                <span className="text-2xl text-accent">📦</span>
              </div>
            </div>
          </Card>

          <Card className="card-float p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Itens em Estoque
                </p>
                <p className="text-3xl font-bold text-foreground">
                  {isLoading ? "-" : stats.estoque}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center">
                <span className="text-2xl text-blue-400">📊</span>
              </div>
            </div>
          </Card>

          <Card className="card-float p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  Valor Total
                </p>
                <p className="text-3xl font-bold text-accent">
                  {isLoading ? "-" : `R$ ${stats.valor.toFixed(2)}`}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <span className="text-2xl text-emerald-400">💰</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Search Bar */}
        <Card className="card-float p-6 mb-6">
          <div className="flex items-center gap-3 bg-background border border-border rounded-lg px-4 py-3">
            <Search className="w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nome, SKU ou categoria..."
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
              Carregando produtos...
            </span>
          ) : (
            `Mostrando ${filtrados.length} de ${stats.total} produtos`
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
                    SKU
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
                    Categoria
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">
                    Unidade
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">
                    Preço
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">
                    Estoque
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-semibold text-foreground">
                    Fornecedor
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="w-5 h-5 animate-spin text-accent" />
                        <span className="text-muted-foreground">Carregando...</span>
                      </div>
                    </td>
                  </tr>
                ) : filtrados.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center">
                      <p className="text-muted-foreground mb-4">
                        Nenhum produto encontrado
                      </p>
                      <Button
                        onClick={() => navigate("/products/new")}
                        className="btn-glow gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Criar Primeiro Produto
                      </Button>
                    </td>
                  </tr>
                ) : (
                  filtrados.map((produto) => (
                    <tr
                      key={produto.id}
                      className="border-b border-border/50 hover:bg-accent/5 transition-colors"
                    >
                      <td className="py-4 px-6 text-foreground font-medium">
                        {produto.name}
                      </td>
                      <td className="py-4 px-6 text-foreground text-sm font-mono">
                        {produto.sku || "-"}
                      </td>
                      <td className="py-4 px-6 text-foreground text-sm">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent">
                          {produto.category || "Sem categoria"}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center text-foreground">
                        {produto.unit || "-"}
                      </td>
                      <td className="py-4 px-6 text-right text-accent font-semibold">
                        R$ {Number(produto.price).toFixed(2)}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                            (produto.stock || 0) > 10
                              ? "bg-emerald-500/20 text-emerald-400"
                              : (produto.stock || 0) > 5
                                ? "bg-yellow-500/20 text-yellow-400"
                                : "bg-destructive/20 text-destructive"
                          }`}
                        >
                          {produto.stock || 0}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-foreground text-sm">
                        {produto.supplier || "-"}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            onClick={() => navigate(`/products/${produto.id}`)}
                            variant="ghost"
                            size="sm"
                            title="Visualizar"
                            className="hover:bg-accent/20"
                          >
                            <Eye className="w-4 h-4 text-accent" />
                          </Button>
                          <Button
                            onClick={() =>
                              navigate(`/products/edit/${produto.id}`)
                            }
                            variant="ghost"
                            size="sm"
                            title="Editar"
                            className="hover:bg-accent/20"
                          >
                            <Edit className="w-4 h-4 text-blue-400" />
                          </Button>
                          <Button
                            onClick={() => handleDelete(produto.id, produto.name)}
                            variant="ghost"
                            size="sm"
                            title="Deletar"
                            disabled={deleteProductMutation.isPending}
                            className="hover:bg-destructive/20"
                          >
                            {deleteProductMutation.isPending ? (
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
