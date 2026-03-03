import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Plus, Search, Eye, Edit, Trash2, Download } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

/**
 * QuotationList - Listagem de Orçamentos
 * Design: Dark Tech Professional
 * Funcionalidades: Busca, filtros, ações (visualizar, editar, deletar, converter em OS)
 */
export default function QuotationList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");

  // Dados de exemplo
  const [quotations] = useState([
    {
      id: 1,
      numero: "ORC-001",
      cliente: "João Silva",
      data: "2026-03-01",
      validade: "2026-03-15",
      total: 1500.0,
      status: "PENDENTE",
      itens: 3,
    },
    {
      id: 2,
      numero: "ORC-002",
      cliente: "Maria Santos",
      data: "2026-02-28",
      validade: "2026-03-14",
      total: 2800.0,
      status: "APROVADO",
      itens: 5,
    },
    {
      id: 3,
      numero: "ORC-003",
      cliente: "Carlos Oliveira",
      data: "2026-02-25",
      validade: "2026-03-11",
      total: 950.0,
      status: "REJEITADO",
      itens: 2,
    },
    {
      id: 4,
      numero: "ORC-004",
      cliente: "Ana Costa",
      data: "2026-02-20",
      validade: "2026-03-06",
      total: 3200.0,
      status: "CONVERTIDO",
      itens: 4,
    },
    {
      id: 5,
      numero: "ORC-005",
      cliente: "ProTech Ltda",
      data: "2026-03-02",
      validade: "2026-03-16",
      total: 5600.0,
      status: "PENDENTE",
      itens: 8,
    },
  ]);

  const filteredQuotations = quotations.filter((quotation) => {
    const matchesSearch =
      quotation.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.cliente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "TODOS" || quotation.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleDelete = (id: number) => {
    toast.success(`Orçamento #${id} deletado com sucesso!`);
  };

  const handleEdit = (id: number) => {
    navigate(`/quotations/edit/${id}`);
  };

  const handleView = (id: number) => {
    navigate(`/quotations/${id}`);
  };

  const handleConvert = (id: number) => {
    toast.success(`Orçamento #${id} convertido em Ordem de Serviço!`);
    setTimeout(() => navigate("/os/list"), 1500);
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDENTE: "bg-yellow-500/20 text-yellow-400",
      APROVADO: "bg-green-500/20 text-green-400",
      REJEITADO: "bg-red-500/20 text-red-400",
      CONVERTIDO: "bg-blue-500/20 text-blue-400",
    };
    return colors[status] || "bg-gray-500/20 text-gray-400";
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      PENDENTE: "Pendente",
      APROVADO: "Aprovado",
      REJEITADO: "Rejeitado",
      CONVERTIDO: "Convertido",
    };
    return labels[status] || status;
  };

  const totalValue = filteredQuotations.reduce((acc, q) => acc + q.total, 0);

  return (
    <Layout>
      <div className="container py-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#00D9FF] mb-2">Orçamentos</h1>
            <p className="text-gray-400">Gerenciar orçamentos de produtos e serviços</p>
          </div>
          <Button
            onClick={() => navigate("/quotations/new")}
            className="bg-[#00D9FF] text-[#0f1419] hover:bg-[#00D9FF]/80"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Orçamento
          </Button>
        </div>

        {/* CARDS DE ESTATÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
            <div className="text-gray-400 text-sm mb-2">Total de Orçamentos</div>
            <div className="text-3xl font-bold text-[#00D9FF]">{quotations.length}</div>
          </Card>
          <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
            <div className="text-gray-400 text-sm mb-2">Pendentes</div>
            <div className="text-3xl font-bold text-yellow-400">{quotations.filter((q) => q.status === "PENDENTE").length}</div>
          </Card>
          <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
            <div className="text-gray-400 text-sm mb-2">Aprovados</div>
            <div className="text-3xl font-bold text-green-400">{quotations.filter((q) => q.status === "APROVADO").length}</div>
          </Card>
          <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
            <div className="text-gray-400 text-sm mb-2">Valor Total</div>
            <div className="text-3xl font-bold text-[#00D9FF]">R$ {totalValue.toFixed(2)}</div>
          </Card>
        </div>

        {/* FILTROS E BUSCA */}
        <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-[#00D9FF]" />
              <Input
                placeholder="Buscar por número ou cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0f1419] border-[#00D9FF]/30 text-white"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2 bg-[#0f1419] border border-[#00D9FF]/30 text-white rounded-lg focus:outline-none focus:border-[#00D9FF]"
            >
              <option value="TODOS">Todos os Status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="APROVADO">Aprovado</option>
              <option value="REJEITADO">Rejeitado</option>
              <option value="CONVERTIDO">Convertido</option>
            </select>
          </div>
        </Card>

        {/* TABELA DE ORÇAMENTOS */}
        <Card className="bg-[#1a1f2e] border-[#00D9FF]/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#00D9FF]/20 bg-[#0f1419]">
                  <th className="text-left p-4 text-[#00D9FF] font-bold">Número</th>
                  <th className="text-left p-4 text-[#00D9FF] font-bold">Cliente</th>
                  <th className="text-center p-4 text-[#00D9FF] font-bold">Data</th>
                  <th className="text-center p-4 text-[#00D9FF] font-bold">Validade</th>
                  <th className="text-center p-4 text-[#00D9FF] font-bold">Itens</th>
                  <th className="text-right p-4 text-[#00D9FF] font-bold">Total</th>
                  <th className="text-center p-4 text-[#00D9FF] font-bold">Status</th>
                  <th className="text-center p-4 text-[#00D9FF] font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredQuotations.length > 0 ? (
                  filteredQuotations.map((quotation) => (
                    <tr key={quotation.id} className="border-b border-[#00D9FF]/10 hover:bg-[#0f1419]/50 transition">
                      <td className="p-4 text-[#00D9FF] font-semibold">{quotation.numero}</td>
                      <td className="p-4 text-white">{quotation.cliente}</td>
                      <td className="p-4 text-center text-gray-400">{new Date(quotation.data).toLocaleDateString("pt-BR")}</td>
                      <td className="p-4 text-center text-gray-400">{new Date(quotation.validade).toLocaleDateString("pt-BR")}</td>
                      <td className="p-4 text-center text-gray-400">{quotation.itens}</td>
                      <td className="p-4 text-right text-[#00D9FF] font-semibold">R$ {quotation.total.toFixed(2)}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(quotation.status)}`}>
                          {getStatusLabel(quotation.status)}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleView(quotation.id)}
                            className="p-2 hover:bg-[#00D9FF]/10 rounded-lg transition text-[#00D9FF]"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(quotation.id)}
                            className="p-2 hover:bg-[#00D9FF]/10 rounded-lg transition text-[#00D9FF]"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {quotation.status === "APROVADO" && (
                            <button
                              onClick={() => handleConvert(quotation.id)}
                              className="p-2 hover:bg-green-500/10 rounded-lg transition text-green-400"
                              title="Converter em OS"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => handleDelete(quotation.id)}
                            className="p-2 hover:bg-red-500/10 rounded-lg transition text-red-400"
                            title="Deletar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-gray-400">
                      Nenhum orçamento encontrado
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
