import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Eye, Edit, Trash2, Plus, Search } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

/**
 * ProductList - Listagem de Produtos
 * Design: Dark Tech Professional com tabela responsiva
 */
export default function ProductList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - será substituído por chamadas à API
  const produtos = [
    {
      id: 1,
      nome: "TECLADO ACER A515",
      categoria: "Periféricos",
      unidade: "UN",
      preco: 120.0,
      estoque: 15,
      fornecedor: "Fornecedor A",
      sku: "TECLADO-ACER-A515",
    },
    {
      id: 2,
      nome: "HD SSD 240GB",
      categoria: "Armazenamento",
      unidade: "UN",
      preco: 180.0,
      estoque: 8,
      fornecedor: "Fornecedor B",
      sku: "SSD-240GB",
    },
    {
      id: 3,
      nome: "MEMÓRIA RAM 8GB DDR4",
      categoria: "Memória",
      unidade: "UN",
      preco: 150.0,
      estoque: 12,
      fornecedor: "Fornecedor C",
      sku: "RAM-8GB-DDR4",
    },
    {
      id: 4,
      nome: "BATERIA NOTEBOOK",
      categoria: "Baterias",
      unidade: "UN",
      preco: 200.0,
      estoque: 5,
      fornecedor: "Fornecedor A",
      sku: "BATERIA-NB",
    },
    {
      id: 5,
      nome: "CABO HDMI 2M",
      categoria: "Cabos",
      unidade: "UN",
      preco: 35.0,
      estoque: 30,
      fornecedor: "Fornecedor D",
      sku: "CABO-HDMI-2M",
    },
    {
      id: 6,
      nome: "PASTA TÉRMICA",
      categoria: "Acessórios",
      unidade: "TUBO",
      preco: 25.0,
      estoque: 20,
      fornecedor: "Fornecedor B",
      sku: "PASTA-TERMICA",
    },
  ];

  const filtrados = produtos.filter(
    (produto) =>
      produto.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      produto.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const estoqueTotal = produtos.reduce((acc, p) => acc + p.estoque, 0);
  const valorEstoque = produtos.reduce((acc, p) => acc + p.preco * p.estoque, 0);

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
                  {produtos.length}
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
                  {estoqueTotal}
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
                  R$ {valorEstoque.toFixed(2)}
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
          Mostrando {filtrados.length} de {produtos.length} produtos
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
                {filtrados.map((produto) => (
                  <tr
                    key={produto.id}
                    className="border-b border-border/50 hover:bg-accent/5 transition-colors"
                  >
                    <td className="py-4 px-6 text-foreground font-medium">
                      {produto.nome}
                    </td>
                    <td className="py-4 px-6 text-foreground text-sm font-mono">
                      {produto.sku}
                    </td>
                    <td className="py-4 px-6 text-foreground text-sm">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-accent/20 text-accent">
                        {produto.categoria}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center text-foreground">
                      {produto.unidade}
                    </td>
                    <td className="py-4 px-6 text-right text-accent font-semibold">
                      R$ {produto.preco.toFixed(2)}
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-semibold text-sm ${
                          produto.estoque > 10
                            ? "bg-emerald-500/20 text-emerald-400"
                            : produto.estoque > 5
                              ? "bg-yellow-500/20 text-yellow-400"
                              : "bg-destructive/20 text-destructive"
                        }`}
                      >
                        {produto.estoque}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-foreground text-sm">
                      {produto.fornecedor}
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
                          onClick={() => {
                            if (
                              confirm(
                                `Deseja deletar o produto ${produto.nome}?`
                              )
                            ) {
                              // Lógica de deleção aqui
                            }
                          }}
                          variant="ghost"
                          size="sm"
                          title="Deletar"
                          className="hover:bg-destructive/20"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filtrados.length === 0 && (
            <div className="py-12 text-center">
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
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
