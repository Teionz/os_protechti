import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/Layout";
import { Eye, Edit, Trash2, Plus, TrendingUp } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

/**
 * SalesList - Listagem de Vendas
 * Design: Dark Tech Professional
 * Funcionalidades: Busca, filtros, estatísticas, ações CRUD
 */
export default function SalesList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");

  // Dados de exemplo
  const [sales] = useState([
    {
      id: 1,
      numero: "VND-001",
      cliente: "João Silva",
      data: "01/03/2026",
      valor: 1500.0,
      status: "FINALIZADA",
      comissao: 150.0,
      vendedor: "Carlos",
    },
    {
      id: 2,
      numero: "VND-002",
      cliente: "Maria Santos",
      data: "02/03/2026",
      valor: 2800.0,
      status: "FINALIZADA",
      comissao: 280.0,
      vendedor: "Ana",
    },
    {
      id: 3,
      numero: "VND-003",
      cliente: "Carlos Oliveira",
      data: "03/03/2026",
      valor: 950.0,
      status: "PENDENTE",
      comissao: 95.0,
      vendedor: "Carlos",
    },
    {
      id: 4,
      numero: "VND-004",
      cliente: "Ana Costa",
      data: "03/03/2026",
      valor: 3200.0,
      status: "FINALIZADA",
      comissao: 320.0,
      vendedor: "Maria",
    },
    {
      id: 5,
      numero: "VND-005",
      cliente: "ProTech Ltda",
      data: "03/03/2026",
      valor: 5600.0,
      status: "CANCELADA",
      comissao: 0.0,
      vendedor: "João",
    },
  ]);

  const filteredSales = sales.filter((sale) => {
    const matchSearch =
      sale.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sale.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = statusFilter === "TODOS" || sale.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalVendas = sales.length;
  const totalFaturamento = sales
    .filter((s) => s.status === "FINALIZADA")
    .reduce((acc, s) => acc + s.valor, 0);
  const totalComissoes = sales
    .filter((s) => s.status === "FINALIZADA")
    .reduce((acc, s) => acc + s.comissao, 0);
  const vendaPendente = sales.filter((s) => s.status === "PENDENTE").length;

  const getStatusColor = (status: string) => {
    switch (status) {
      case "FINALIZADA":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "PENDENTE":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "CANCELADA":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-[#00D9FF] mb-2">Vendas</h1>
            <p className="text-gray-400">Gerencie suas vendas e comissões</p>
          </div>
          <Button
            onClick={() => navigate("/sales/new")}
            className="bg-[#00D9FF] text-[#0f1419] hover:bg-[#00D9FF]/80"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Venda
          </Button>
        </div>

        {/* ESTATÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-2">Total de Vendas</div>
                <div className="text-3xl font-bold text-[#00D9FF]">{totalVendas}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-[#00D9FF]/50" />
            </div>
          </Card>

          <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-2">Faturamento</div>
                <div className="text-3xl font-bold text-[#00D9FF]">R$ {totalFaturamento.toFixed(2)}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500/50" />
            </div>
          </Card>

          <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-2">Comissões</div>
                <div className="text-3xl font-bold text-[#00D9FF]">R$ {totalComissoes.toFixed(2)}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-yellow-500/50" />
            </div>
          </Card>

          <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-gray-400 text-sm mb-2">Pendentes</div>
                <div className="text-3xl font-bold text-[#00D9FF]">{vendaPendente}</div>
              </div>
              <TrendingUp className="w-8 h-8 text-orange-500/50" />
            </div>
          </Card>
        </div>

        {/* FILTROS */}
        <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Input
              placeholder="Buscar por número ou cliente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-[#0f1419] border-[#00D9FF]/30 text-white"
            />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-48 bg-[#0f1419] border-[#00D9FF]/30 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-[#1a1f2e] border-[#00D9FF]/30">
                <SelectItem value="TODOS">Todos os Status</SelectItem>
                <SelectItem value="FINALIZADA">Finalizada</SelectItem>
                <SelectItem value="PENDENTE">Pendente</SelectItem>
                <SelectItem value="CANCELADA">Cancelada</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* TABELA DE VENDAS */}
        <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#00D9FF]/20">
                <th className="text-left py-4 px-4 text-[#00D9FF] font-semibold">Número</th>
                <th className="text-left py-4 px-4 text-[#00D9FF] font-semibold">Cliente</th>
                <th className="text-left py-4 px-4 text-[#00D9FF] font-semibold">Data</th>
                <th className="text-left py-4 px-4 text-[#00D9FF] font-semibold">Valor</th>
                <th className="text-left py-4 px-4 text-[#00D9FF] font-semibold">Comissão</th>
                <th className="text-left py-4 px-4 text-[#00D9FF] font-semibold">Vendedor</th>
                <th className="text-left py-4 px-4 text-[#00D9FF] font-semibold">Status</th>
                <th className="text-left py-4 px-4 text-[#00D9FF] font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {filteredSales.map((sale) => (
                <tr key={sale.id} className="border-b border-[#00D9FF]/10 hover:bg-[#0f1419]/50 transition">
                  <td className="py-4 px-4 text-white font-mono">{sale.numero}</td>
                  <td className="py-4 px-4 text-white">{sale.cliente}</td>
                  <td className="py-4 px-4 text-gray-400">{sale.data}</td>
                  <td className="py-4 px-4 text-white font-semibold">R$ {sale.valor.toFixed(2)}</td>
                  <td className="py-4 px-4 text-[#00D9FF]">R$ {sale.comissao.toFixed(2)}</td>
                  <td className="py-4 px-4 text-gray-400">{sale.vendedor}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(sale.status)}`}>
                      {sale.status}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toast.info("Visualizar venda: " + sale.numero)}
                        className="p-2 hover:bg-[#00D9FF]/10 rounded-lg transition text-[#00D9FF]"
                        title="Visualizar"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/sales/edit/${sale.id}`)}
                        className="p-2 hover:bg-[#00D9FF]/10 rounded-lg transition text-[#00D9FF]"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => toast.error("Venda deletada!")}
                        className="p-2 hover:bg-red-500/10 rounded-lg transition text-red-400"
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
    </Layout>
  );
}
