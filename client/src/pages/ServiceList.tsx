import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Plus, Search, Eye, Edit, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

/**
 * ServiceList - Listagem de Serviços
 * Design: Dark Tech Professional
 * Funcionalidades: Busca, filtros, ações (visualizar, editar, deletar)
 */
export default function ServiceList() {
  const [, navigate] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("TODOS");

  // Dados de exemplo
  const [services] = useState([
    {
      id: 1,
      nome: "Manutenção de Notebook",
      categoria: "MANUTENCAO",
      descricao: "Limpeza, troca de pasta térmica e diagnóstico",
      preco: 150.0,
      tempoEstimado: "2 horas",
      ativo: true,
    },
    {
      id: 2,
      nome: "Formatação de PC",
      categoria: "SOFTWARE",
      descricao: "Formatação completa e instalação de SO",
      preco: 120.0,
      tempoEstimado: "3 horas",
      ativo: true,
    },
    {
      id: 3,
      nome: "Troca de HD",
      categoria: "HARDWARE",
      descricao: "Substituição de disco rígido por SSD",
      preco: 200.0,
      tempoEstimado: "1 hora",
      ativo: true,
    },
    {
      id: 4,
      nome: "Instalação de Antivírus",
      categoria: "SOFTWARE",
      descricao: "Instalação e configuração de antivírus",
      preco: 80.0,
      tempoEstimado: "30 minutos",
      ativo: true,
    },
    {
      id: 5,
      nome: "Recuperação de Dados",
      categoria: "RECUPERACAO",
      descricao: "Recuperação de dados de HD danificado",
      preco: 350.0,
      tempoEstimado: "4 horas",
      ativo: true,
    },
  ]);

  const filteredServices = services.filter((service) => {
    const matchesSearch =
      service.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "TODOS" || service.categoria === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleDelete = (id: number) => {
    toast.success(`Serviço #${id} deletado com sucesso!`);
  };

  const handleEdit = (id: number) => {
    navigate(`/services/edit/${id}`);
  };

  const handleView = (id: number) => {
    navigate(`/services/${id}`);
  };

  const getCategoryLabel = (category: string) => {
    const categories: Record<string, string> = {
      MANUTENCAO: "Manutenção",
      SOFTWARE: "Software",
      HARDWARE: "Hardware",
      RECUPERACAO: "Recuperação",
    };
    return categories[category] || category;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      MANUTENCAO: "bg-blue-500/20 text-blue-400",
      SOFTWARE: "bg-purple-500/20 text-purple-400",
      HARDWARE: "bg-orange-500/20 text-orange-400",
      RECUPERACAO: "bg-red-500/20 text-red-400",
    };
    return colors[category] || "bg-gray-500/20 text-gray-400";
  };

  return (
    <Layout>
      <div className="container py-8">
        {/* HEADER */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-[#00D9FF] mb-2">Serviços</h1>
            <p className="text-gray-400">Gerenciar serviços oferecidos pela empresa</p>
          </div>
          <Button
            onClick={() => navigate("/services/new")}
            className="bg-[#00D9FF] text-[#0f1419] hover:bg-[#00D9FF]/80"
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Serviço
          </Button>
        </div>

        {/* CARDS DE ESTATÍSTICAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
            <div className="text-gray-400 text-sm mb-2">Total de Serviços</div>
            <div className="text-3xl font-bold text-[#00D9FF]">{services.length}</div>
          </Card>
          <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
            <div className="text-gray-400 text-sm mb-2">Serviços Ativos</div>
            <div className="text-3xl font-bold text-[#00D9FF]">{services.filter((s) => s.ativo).length}</div>
          </Card>
          <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
            <div className="text-gray-400 text-sm mb-2">Preço Médio</div>
            <div className="text-3xl font-bold text-[#00D9FF]">
              R$ {(services.reduce((acc, s) => acc + s.preco, 0) / services.length).toFixed(2)}
            </div>
          </Card>
        </div>

        {/* FILTROS E BUSCA */}
        <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-[#00D9FF]" />
              <Input
                placeholder="Buscar por nome ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-[#0f1419] border-[#00D9FF]/30 text-white"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 bg-[#0f1419] border border-[#00D9FF]/30 text-white rounded-lg focus:outline-none focus:border-[#00D9FF]"
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
        <Card className="bg-[#1a1f2e] border-[#00D9FF]/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#00D9FF]/20 bg-[#0f1419]">
                  <th className="text-left p-4 text-[#00D9FF] font-bold">Serviço</th>
                  <th className="text-left p-4 text-[#00D9FF] font-bold">Categoria</th>
                  <th className="text-left p-4 text-[#00D9FF] font-bold">Descrição</th>
                  <th className="text-right p-4 text-[#00D9FF] font-bold">Preço</th>
                  <th className="text-center p-4 text-[#00D9FF] font-bold">Tempo Est.</th>
                  <th className="text-center p-4 text-[#00D9FF] font-bold">Status</th>
                  <th className="text-center p-4 text-[#00D9FF] font-bold">Ações</th>
                </tr>
              </thead>
              <tbody>
                {filteredServices.length > 0 ? (
                  filteredServices.map((service) => (
                    <tr key={service.id} className="border-b border-[#00D9FF]/10 hover:bg-[#0f1419]/50 transition">
                      <td className="p-4 text-white font-semibold">{service.nome}</td>
                      <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getCategoryColor(service.categoria)}`}>
                          {getCategoryLabel(service.categoria)}
                        </span>
                      </td>
                      <td className="p-4 text-gray-400 text-sm">{service.descricao}</td>
                      <td className="p-4 text-right text-[#00D9FF] font-semibold">R$ {service.preco.toFixed(2)}</td>
                      <td className="p-4 text-center text-gray-400">{service.tempoEstimado}</td>
                      <td className="p-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${service.ativo ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>
                          {service.ativo ? "Ativo" : "Inativo"}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleView(service.id)}
                            className="p-2 hover:bg-[#00D9FF]/10 rounded-lg transition text-[#00D9FF]"
                            title="Visualizar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEdit(service.id)}
                            className="p-2 hover:bg-[#00D9FF]/10 rounded-lg transition text-[#00D9FF]"
                            title="Editar"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(service.id)}
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
                    <td colSpan={7} className="p-8 text-center text-gray-400">
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
