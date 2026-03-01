import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Eye, Edit, Trash2, Plus, Search } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

/**
 * ClientList - Listagem de Clientes
 * Design: Dark Tech Professional com tabela responsiva
 */
export default function ClientList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - será substituído por chamadas à API
  const clientes = [
    {
      id: 1,
      nome: "SAULO PARAGUASSU",
      cnpjCpf: "329.350.928-21",
      email: "saulo.paraguassu@gmail.com",
      telefone: "(17) 99776-7186",
      cidade: "São José do Rio Preto",
      estado: "SP",
      ordens: 5,
      totalGasto: 1500.0,
    },
    {
      id: 2,
      nome: "EMPRESA XYZ LTDA",
      cnpjCpf: "12.345.678/0001-90",
      email: "contato@empresaxyz.com.br",
      telefone: "(17) 3333-3333",
      cidade: "São José do Rio Preto",
      estado: "SP",
      ordens: 8,
      totalGasto: 3200.0,
    },
    {
      id: 3,
      nome: "JOÃO SILVA",
      cnpjCpf: "123.456.789-10",
      email: "joao.silva@email.com",
      telefone: "(17) 98888-8888",
      cidade: "Mirassol",
      estado: "SP",
      ordens: 3,
      totalGasto: 850.0,
    },
    {
      id: 4,
      nome: "MARIA SANTOS",
      cnpjCpf: "987.654.321-00",
      email: "maria.santos@email.com",
      telefone: "(17) 99999-9999",
      cidade: "São José do Rio Preto",
      estado: "SP",
      ordens: 2,
      totalGasto: 600.0,
    },
  ];

  const filtrados = clientes.filter(
    (cliente) =>
      cliente.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cliente.cnpjCpf.includes(searchTerm) ||
      cliente.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          Mostrando {filtrados.length} de {clientes.length} clientes
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
                    Ordens
                  </th>
                  <th className="text-right py-4 px-6 text-sm font-semibold text-foreground">
                    Total Gasto
                  </th>
                  <th className="text-center py-4 px-6 text-sm font-semibold text-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filtrados.map((cliente) => (
                  <tr
                    key={cliente.id}
                    className="border-b border-border/50 hover:bg-accent/5 transition-colors"
                  >
                    <td className="py-4 px-6 text-foreground font-medium">
                      {cliente.nome}
                    </td>
                    <td className="py-4 px-6 text-foreground text-sm">
                      {cliente.cnpjCpf}
                    </td>
                    <td className="py-4 px-6 text-foreground text-sm">
                      {cliente.email}
                    </td>
                    <td className="py-4 px-6 text-foreground text-sm">
                      {cliente.telefone}
                    </td>
                    <td className="py-4 px-6 text-foreground text-sm">
                      {cliente.cidade}
                    </td>
                    <td className="py-4 px-6 text-center text-foreground">
                      <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-accent/20 text-accent font-semibold text-sm">
                        {cliente.ordens}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-accent font-semibold">
                      R$ {cliente.totalGasto.toFixed(2)}
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
                          onClick={() => {
                            if (
                              confirm(
                                `Deseja deletar o cliente ${cliente.nome}?`
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
                Nenhum cliente encontrado
              </p>
              <Button
                onClick={() => navigate("/clients/new")}
                className="btn-glow gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Primeiro Cliente
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
