import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import Layout from "@/components/Layout";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

/**
 * OSList - Listagem de Ordens de Serviço
 * Design: Dark Tech Professional com tabela responsiva
 */
export default function OSList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");

  // Mock data - será substituído por chamadas à API
  const ordens = [
    {
      id: 1,
      numero: "705",
      cliente: "SAULO PARAGUASSU",
      equipamento: "NOTEBOOK",
      data: "20/02/2026",
      status: "Concluído",
      total: "R$ 300,00",
    },
    {
      id: 2,
      numero: "704",
      cliente: "EMPRESA XYZ",
      equipamento: "DESKTOP",
      data: "19/02/2026",
      status: "Pendente",
      total: "R$ 450,00",
    },
    {
      id: 3,
      numero: "703",
      cliente: "JOÃO SILVA",
      equipamento: "IMPRESSORA",
      data: "18/02/2026",
      status: "Em Andamento",
      total: "R$ 150,00",
    },
  ];

  const filteredOrdens = ordens.filter(
    (ordem) =>
      ordem.numero.includes(searchTerm) ||
      ordem.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ordem.equipamento.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Concluído":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Pendente":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
      case "Em Andamento":
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
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
            className="btn-glow gap-2"
          >
            <Plus className="w-4 h-4" />
            Nova OS
          </Button>
        </div>

        {/* Search Bar */}
        <Card className="card-float p-6 mb-6">
          <div className="flex items-center gap-2">
            <Search className="w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por número, cliente ou equipamento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </Card>

        {/* Results Info */}
        <div className="mb-6">
          <p className="text-muted-foreground">
            Mostrando <span className="text-accent font-semibold">{filteredOrdens.length}</span> de{" "}
            <span className="text-accent font-semibold">{ordens.length}</span> ordens
          </p>
        </div>

        {/* Table */}
        <Card className="card-float overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-card/50">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Número
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Cliente
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Equipamento
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Data
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-foreground">
                    Total
                  </th>
                  <th className="px-6 py-4 text-center text-sm font-semibold text-foreground">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredOrdens.map((ordem) => (
                  <tr
                    key={ordem.id}
                    className="border-b border-border hover:bg-card/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-foreground font-semibold">
                      #{ordem.numero}
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {ordem.cliente}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {ordem.equipamento}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {ordem.data}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                          ordem.status
                        )}`}
                      >
                        {ordem.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-accent font-semibold">
                      {ordem.total}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => navigate(`/os/${ordem.id}`)}
                          className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors text-blue-400"
                          title="Visualizar"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/os/edit/${ordem.id}`)}
                          className="p-2 hover:bg-accent/20 rounded-lg transition-colors text-accent"
                          title="Editar"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 hover:bg-red-500/20 rounded-lg transition-colors text-red-400"
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
          </div>

          {filteredOrdens.length === 0 && (
            <div className="p-12 text-center">
              <p className="text-muted-foreground mb-4">
                Nenhuma ordem de serviço encontrada
              </p>
              <Button
                onClick={() => navigate("/os/new")}
                className="btn-glow gap-2"
              >
                <Plus className="w-4 h-4" />
                Criar Nova OS
              </Button>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
}
