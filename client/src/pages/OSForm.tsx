import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Save, Plus, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

/**
 * OSForm - Formulário de cadastro/edição de Ordem de Serviço
 * Design: Dark Tech Professional com multi-step form
 * Baseado no GestãoClick com seção de Equipamento expandida
 */
export default function OSForm() {
  const [, navigate] = useLocation();
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dadosGerais: true,
    cliente: true,
    equipamento: true,
    servicos: true,
    produtos: true,
    pagamento: true,
    observacoes: true,
    campos: true,
  });

  const [formData, setFormData] = useState({
    numero: "705",
    data: new Date().toISOString().split("T")[0],
    entrada: "09:00",
    saida: "17:00",
    previsaoEntrega: "",
    situacao: "ORCANDO",
    prioridade: "MEDIA",
    canal: "PRESENCIAL",
    origem: "ANUNCIO",
    teclaFaltando: false,
    telaTrincada: false,
    carregador: false,
    bolsa: false,
    ligando: false,
    caboEnergia: false,
    senha: "",
    cliente: {
      nome: "",
      cnpjCpf: "",
      endereco: "",
      numero: "",
      complemento: "",
      bairro: "",
      cep: "",
      cidade: "",
      estado: "",
      telefone: "",
      email: "",
    },
    equipamento: {
      nome: "",
      marca: "",
      modelo: "",
      serie: "",
      condicoes: "",
      defeitos: "",
      acessorios: "",
      solucao: "",
      laudo: "",
      termos: "",
    },
    servicos: [{ nome: "", detalhes: "", quantidade: 1, valorUnitario: 0, desconto: 0 }],
    produtos: [{ nome: "", detalhes: "", unidade: "UN", quantidade: 1, valorUnitario: 0, desconto: 0 }],
    pagamento: {
      vencimento: "",
      valor: 0,
      forma: "A_COMBINAR",
      observacao: "",
    },
    observacoes: "",
    observacoesInternas: "",
  });

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !(expandedSections[section] ?? false),
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleClienteChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      cliente: { ...formData.cliente, [field]: value },
    });
  };

  const handleEquipamentoChange = (field: string, value: string) => {
    setFormData({
      ...formData,
      equipamento: { ...formData.equipamento, [field]: value },
    });
  };

  const handleServicoChange = (index: number, field: string, value: any) => {
    const novoServicos = [...formData.servicos];
    novoServicos[index] = { ...novoServicos[index], [field]: value };
    setFormData({ ...formData, servicos: novoServicos });
  };

  const handleProdutoChange = (index: number, field: string, value: any) => {
    const novoProdutos = [...formData.produtos];
    novoProdutos[index] = { ...novoProdutos[index], [field]: value };
    setFormData({ ...formData, produtos: novoProdutos });
  };

  const adicionarServico = () => {
    setFormData({
      ...formData,
      servicos: [...formData.servicos, { nome: "", detalhes: "", quantidade: 1, valorUnitario: 0, desconto: 0 }],
    });
  };

  const removerServico = (index: number) => {
    setFormData({
      ...formData,
      servicos: formData.servicos.filter((_, i) => i !== index),
    });
  };

  const adicionarProduto = () => {
    setFormData({
      ...formData,
      produtos: [...formData.produtos, { nome: "", detalhes: "", unidade: "UN", quantidade: 1, valorUnitario: 0, desconto: 0 }],
    });
  };

  const removerProduto = (index: number) => {
    setFormData({
      ...formData,
      produtos: formData.produtos.filter((_, i) => i !== index),
    });
  };

  const calcularTotal = () => {
    const totalServicos = formData.servicos.reduce((acc, s) => acc + (s.quantidade * s.valorUnitario - s.desconto), 0);
    const totalProdutos = formData.produtos.reduce((acc, p) => acc + (p.quantidade * p.valorUnitario - p.desconto), 0);
    return totalServicos + totalProdutos;
  };

  const handleSalvar = () => {
    if (!formData.cliente.nome) {
      toast.error("Por favor, preencha o nome do cliente");
      return;
    }
    toast.success("Ordem de Serviço salva com sucesso!");
    setTimeout(() => navigate("/os/list"), 1500);
  };

  const SectionHeader = ({ title, section }: { title: string; section: string }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-[#00D9FF]/10 to-[#00D9FF]/5 border border-[#00D9FF]/30 rounded-lg hover:border-[#00D9FF]/50 transition-all"
    >
      <h3 className="text-lg font-bold text-[#00D9FF]">{title}</h3>
      {expandedSections[section as keyof typeof expandedSections] ? (
        <ChevronUp className="w-5 h-5 text-[#00D9FF]" />
      ) : (
        <ChevronDown className="w-5 h-5 text-[#00D9FF]" />
      )}
    </button>
  );

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#00D9FF] mb-2">Nova Ordem de Serviço</h1>
          <p className="text-gray-400">Preencha os dados abaixo para criar uma nova ordem de serviço</p>
        </div>

        <div className="space-y-6">
          {/* DADOS GERAIS */}
          <div>
            <SectionHeader title="📋 Dados Gerais" section="dadosGerais" />
            {expandedSections.dadosGerais && (
              <Card className="mt-4 p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#00D9FF]">Número</Label>
                    <Input
                      value={formData.numero}
                      onChange={(e) => handleChange("numero", e.target.value)}
                      disabled
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Data</Label>
                    <Input
                      type="date"
                      value={formData.data}
                      onChange={(e) => handleChange("data", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Hora Entrada</Label>
                    <Input
                      type="time"
                      value={formData.entrada}
                      onChange={(e) => handleChange("entrada", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Hora Saída</Label>
                    <Input
                      type="time"
                      value={formData.saida}
                      onChange={(e) => handleChange("saida", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Previsão Entrega</Label>
                    <Input
                      type="date"
                      value={formData.previsaoEntrega}
                      onChange={(e) => handleChange("previsaoEntrega", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Situação</Label>
                    <Select value={formData.situacao} onValueChange={(v) => handleChange("situacao", v)}>
                      <SelectTrigger className="bg-[#0f1419] border-[#00D9FF]/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1f2e] border-[#00D9FF]/30">
                        <SelectItem value="ORCANDO">Orçando</SelectItem>
                        <SelectItem value="AGUARDANDO_APROVACAO">Aguardando Aprovação</SelectItem>
                        <SelectItem value="EM_ANDAMENTO">Em Andamento</SelectItem>
                        <SelectItem value="AGUARDANDO_RETIRADA">Aguardando Retirada</SelectItem>
                        <SelectItem value="FINALIZADA">Finalizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Prioridade</Label>
                    <Select value={formData.prioridade} onValueChange={(v) => handleChange("prioridade", v)}>
                      <SelectTrigger className="bg-[#0f1419] border-[#00D9FF]/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1f2e] border-[#00D9FF]/30">
                        <SelectItem value="BAIXA">Baixa</SelectItem>
                        <SelectItem value="MEDIA">Média</SelectItem>
                        <SelectItem value="ALTA">Alta</SelectItem>
                        <SelectItem value="URGENTE">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Canal de Venda</Label>
                    <Select value={formData.canal} onValueChange={(v) => handleChange("canal", v)}>
                      <SelectTrigger className="bg-[#0f1419] border-[#00D9FF]/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1f2e] border-[#00D9FF]/30">
                        <SelectItem value="PRESENCIAL">Presencial</SelectItem>
                        <SelectItem value="INTERNET">Internet</SelectItem>
                        <SelectItem value="TELEMARKETING">Telemarketing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* CLIENTE */}
          <div>
            <SectionHeader title="👤 Cliente" section="cliente" />
            {expandedSections.cliente && (
              <Card className="mt-4 p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-[#00D9FF]">Nome do Cliente *</Label>
                    <Input
                      placeholder="Digite o nome do cliente"
                      value={formData.cliente.nome}
                      onChange={(e) => handleClienteChange("nome", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">CNPJ/CPF</Label>
                    <Input
                      placeholder="00.000.000/0000-00"
                      value={formData.cliente.cnpjCpf}
                      onChange={(e) => handleClienteChange("cnpjCpf", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Email</Label>
                    <Input
                      type="email"
                      placeholder="email@exemplo.com"
                      value={formData.cliente.email}
                      onChange={(e) => handleClienteChange("email", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Telefone</Label>
                    <Input
                      placeholder="(17) 99999-9999"
                      value={formData.cliente.telefone}
                      onChange={(e) => handleClienteChange("telefone", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[#00D9FF]">Endereço</Label>
                    <Input
                      placeholder="Rua, Avenida, etc"
                      value={formData.cliente.endereco}
                      onChange={(e) => handleClienteChange("endereco", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Número</Label>
                    <Input
                      placeholder="123"
                      value={formData.cliente.numero}
                      onChange={(e) => handleClienteChange("numero", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Complemento</Label>
                    <Input
                      placeholder="Apto, Sala, etc"
                      value={formData.cliente.complemento}
                      onChange={(e) => handleClienteChange("complemento", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Bairro</Label>
                    <Input
                      placeholder="Bairro"
                      value={formData.cliente.bairro}
                      onChange={(e) => handleClienteChange("bairro", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">CEP</Label>
                    <Input
                      placeholder="00000-000"
                      value={formData.cliente.cep}
                      onChange={(e) => handleClienteChange("cep", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Cidade</Label>
                    <Input
                      placeholder="Cidade"
                      value={formData.cliente.cidade}
                      onChange={(e) => handleClienteChange("cidade", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Estado</Label>
                    <Input
                      placeholder="SP"
                      value={formData.cliente.estado}
                      onChange={(e) => handleClienteChange("estado", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* EQUIPAMENTO - EXPANDIDO */}
          <div>
            <SectionHeader title="🖥️ Equipamento" section="equipamento" />
            {expandedSections.equipamento && (
              <Card className="mt-4 p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label className="text-[#00D9FF]">Nome do Equipamento</Label>
                    <Input
                      placeholder="Ex: Notebook, Smartphone, etc"
                      value={formData.equipamento.nome}
                      onChange={(e) => handleEquipamentoChange("nome", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Marca</Label>
                    <Input
                      placeholder="Ex: Dell, Apple, Samsung"
                      value={formData.equipamento.marca}
                      onChange={(e) => handleEquipamentoChange("marca", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Modelo</Label>
                    <Input
                      placeholder="Ex: XPS 13, iPhone 14"
                      value={formData.equipamento.modelo}
                      onChange={(e) => handleEquipamentoChange("modelo", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Série</Label>
                    <Input
                      placeholder="Número de série"
                      value={formData.equipamento.serie}
                      onChange={(e) => handleEquipamentoChange("serie", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[#00D9FF]">Condições do Equipamento</Label>
                    <Textarea
                      placeholder="Descreva o estado geral do equipamento"
                      value={formData.equipamento.condicoes}
                      onChange={(e) => handleEquipamentoChange("condicoes", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white min-h-[80px]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[#00D9FF]">Defeitos Relatados</Label>
                    <Textarea
                      placeholder="Descreva os problemas/defeitos"
                      value={formData.equipamento.defeitos}
                      onChange={(e) => handleEquipamentoChange("defeitos", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white min-h-[80px]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[#00D9FF]">Acessórios</Label>
                    <Textarea
                      placeholder="Ex: Carregador, Cabo, Bolsa, etc"
                      value={formData.equipamento.acessorios}
                      onChange={(e) => handleEquipamentoChange("acessorios", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white min-h-[80px]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[#00D9FF]">Solução Proposta</Label>
                    <Textarea
                      placeholder="Descreva a solução que será implementada"
                      value={formData.equipamento.solucao}
                      onChange={(e) => handleEquipamentoChange("solucao", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white min-h-[80px]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[#00D9FF]">Laudo Técnico</Label>
                    <Textarea
                      placeholder="Resultado do diagnóstico técnico"
                      value={formData.equipamento.laudo}
                      onChange={(e) => handleEquipamentoChange("laudo", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white min-h-[80px]"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[#00D9FF]">Termos e Condições</Label>
                    <Textarea
                      placeholder="Termos específicos desta ordem"
                      value={formData.equipamento.termos}
                      onChange={(e) => handleEquipamentoChange("termos", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white min-h-[80px]"
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* CAMPOS EXTRAS */}
          <div>
            <SectionHeader title="⚙️ Campos Extras" section="campos" />
            {expandedSections.campos && (
              <Card className="mt-4 p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#00D9FF]">Origem</Label>
                    <Select value={formData.origem} onValueChange={(v) => handleChange("origem", v)}>
                      <SelectTrigger className="bg-[#0f1419] border-[#00D9FF]/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1f2e] border-[#00D9FF]/30">
                        <SelectItem value="ANUNCIO">Anúncio</SelectItem>
                        <SelectItem value="CLIENTE">Cliente</SelectItem>
                        <SelectItem value="BNI">BNI</SelectItem>
                        <SelectItem value="INDICACAO">Indicação</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Senha</Label>
                    <Input
                      type="password"
                      placeholder="Senha do equipamento"
                      value={formData.senha}
                      onChange={(e) => handleChange("senha", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="teclaFaltando"
                      checked={formData.teclaFaltando}
                      onChange={(e) => handleChange("teclaFaltando", e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="teclaFaltando" className="text-[#00D9FF] cursor-pointer">
                      Tecla Faltando
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="telaTrincada"
                      checked={formData.telaTrincada}
                      onChange={(e) => handleChange("telaTrincada", e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="telaTrincada" className="text-[#00D9FF] cursor-pointer">
                      Tela Trincada
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="carregador"
                      checked={formData.carregador}
                      onChange={(e) => handleChange("carregador", e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="carregador" className="text-[#00D9FF] cursor-pointer">
                      Carregador
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="bolsa"
                      checked={formData.bolsa}
                      onChange={(e) => handleChange("bolsa", e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="bolsa" className="text-[#00D9FF] cursor-pointer">
                      Bolsa
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="ligando"
                      checked={formData.ligando}
                      onChange={(e) => handleChange("ligando", e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="ligando" className="text-[#00D9FF] cursor-pointer">
                      Ligando
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="caboEnergia"
                      checked={formData.caboEnergia}
                      onChange={(e) => handleChange("caboEnergia", e.target.checked)}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="caboEnergia" className="text-[#00D9FF] cursor-pointer">
                      Cabo de Energia
                    </Label>
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* SERVIÇOS */}
          <div>
            <SectionHeader title="🔧 Serviços/Mão de Obra" section="servicos" />
            {expandedSections.servicos && (
              <Card className="mt-4 p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#00D9FF]/20">
                        <th className="text-left p-2 text-[#00D9FF]">Serviço</th>
                        <th className="text-left p-2 text-[#00D9FF]">Detalhes</th>
                        <th className="text-center p-2 text-[#00D9FF]">Qtd</th>
                        <th className="text-right p-2 text-[#00D9FF]">Valor</th>
                        <th className="text-right p-2 text-[#00D9FF]">Desconto</th>
                        <th className="text-right p-2 text-[#00D9FF]">Subtotal</th>
                        <th className="text-center p-2 text-[#00D9FF]">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.servicos.map((servico, index) => (
                        <tr key={index} className="border-b border-[#00D9FF]/10">
                          <td className="p-2">
                            <Input
                              placeholder="Nome do serviço"
                              value={servico.nome}
                              onChange={(e) => handleServicoChange(index, "nome", e.target.value)}
                              className="bg-[#0f1419] border-[#00D9FF]/30 text-white text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              placeholder="Detalhes"
                              value={servico.detalhes}
                              onChange={(e) => handleServicoChange(index, "detalhes", e.target.value)}
                              className="bg-[#0f1419] border-[#00D9FF]/30 text-white text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={servico.quantidade}
                              onChange={(e) => handleServicoChange(index, "quantidade", parseFloat(e.target.value))}
                              className="bg-[#0f1419] border-[#00D9FF]/30 text-white text-xs text-center"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={servico.valorUnitario}
                              onChange={(e) => handleServicoChange(index, "valorUnitario", parseFloat(e.target.value))}
                              className="bg-[#0f1419] border-[#00D9FF]/30 text-white text-xs text-right"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={servico.desconto}
                              onChange={(e) => handleServicoChange(index, "desconto", parseFloat(e.target.value))}
                              className="bg-[#0f1419] border-[#00D9FF]/30 text-white text-xs text-right"
                            />
                          </td>
                          <td className="p-2 text-right text-[#00D9FF]">
                            R$ {(servico.quantidade * servico.valorUnitario - servico.desconto).toFixed(2)}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => removerServico(index)}
                              className="text-red-500 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button
                  onClick={adicionarServico}
                  className="mt-4 bg-[#00D9FF] text-[#0f1419] hover:bg-[#00D9FF]/80"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Serviço
                </Button>
              </Card>
            )}
          </div>

          {/* PRODUTOS */}
          <div>
            <SectionHeader title="📦 Produtos/Peças" section="produtos" />
            {expandedSections.produtos && (
              <Card className="mt-4 p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#00D9FF]/20">
                        <th className="text-left p-2 text-[#00D9FF]">Produto</th>
                        <th className="text-left p-2 text-[#00D9FF]">Detalhes</th>
                        <th className="text-center p-2 text-[#00D9FF]">Qtd</th>
                        <th className="text-right p-2 text-[#00D9FF]">Valor</th>
                        <th className="text-right p-2 text-[#00D9FF]">Desconto</th>
                        <th className="text-right p-2 text-[#00D9FF]">Subtotal</th>
                        <th className="text-center p-2 text-[#00D9FF]">Ação</th>
                      </tr>
                    </thead>
                    <tbody>
                      {formData.produtos.map((produto, index) => (
                        <tr key={index} className="border-b border-[#00D9FF]/10">
                          <td className="p-2">
                            <Input
                              placeholder="Nome do produto"
                              value={produto.nome}
                              onChange={(e) => handleProdutoChange(index, "nome", e.target.value)}
                              className="bg-[#0f1419] border-[#00D9FF]/30 text-white text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              placeholder="Detalhes"
                              value={produto.detalhes}
                              onChange={(e) => handleProdutoChange(index, "detalhes", e.target.value)}
                              className="bg-[#0f1419] border-[#00D9FF]/30 text-white text-xs"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={produto.quantidade}
                              onChange={(e) => handleProdutoChange(index, "quantidade", parseFloat(e.target.value))}
                              className="bg-[#0f1419] border-[#00D9FF]/30 text-white text-xs text-center"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={produto.valorUnitario}
                              onChange={(e) => handleProdutoChange(index, "valorUnitario", parseFloat(e.target.value))}
                              className="bg-[#0f1419] border-[#00D9FF]/30 text-white text-xs text-right"
                            />
                          </td>
                          <td className="p-2">
                            <Input
                              type="number"
                              value={produto.desconto}
                              onChange={(e) => handleProdutoChange(index, "desconto", parseFloat(e.target.value))}
                              className="bg-[#0f1419] border-[#00D9FF]/30 text-white text-xs text-right"
                            />
                          </td>
                          <td className="p-2 text-right text-[#00D9FF]">
                            R$ {(produto.quantidade * produto.valorUnitario - produto.desconto).toFixed(2)}
                          </td>
                          <td className="p-2 text-center">
                            <button
                              onClick={() => removerProduto(index)}
                              className="text-red-500 hover:text-red-400"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button
                  onClick={adicionarProduto}
                  className="mt-4 bg-[#00D9FF] text-[#0f1419] hover:bg-[#00D9FF]/80"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Produto
                </Button>
              </Card>
            )}
          </div>

          {/* PAGAMENTO */}
          <div>
            <SectionHeader title="💳 Pagamento" section="pagamento" />
            {expandedSections.pagamento && (
              <Card className="mt-4 p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-[#00D9FF]">Vencimento</Label>
                    <Input
                      type="date"
                      value={formData.pagamento.vencimento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pagamento: { ...formData.pagamento, vencimento: e.target.value },
                        })
                      }
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Forma de Pagamento</Label>
                    <Select
                      value={formData.pagamento.forma}
                      onValueChange={(v) =>
                        setFormData({
                          ...formData,
                          pagamento: { ...formData.pagamento, forma: v },
                        })
                      }
                    >
                      <SelectTrigger className="bg-[#0f1419] border-[#00D9FF]/30 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-[#1a1f2e] border-[#00D9FF]/30">
                        <SelectItem value="A_COMBINAR">A Combinar</SelectItem>
                        <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                        <SelectItem value="CARTAO">Cartão</SelectItem>
                        <SelectItem value="BOLETO">Boleto</SelectItem>
                        <SelectItem value="PIX">PIX</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[#00D9FF]">Total: R$ {calcularTotal().toFixed(2)}</Label>
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-[#00D9FF]">Observação de Pagamento</Label>
                    <Textarea
                      placeholder="Observações sobre o pagamento"
                      value={formData.pagamento.observacao}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          pagamento: { ...formData.pagamento, observacao: e.target.value },
                        })
                      }
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white min-h-[80px]"
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* OBSERVAÇÕES */}
          <div>
            <SectionHeader title="📝 Observações" section="observacoes" />
            {expandedSections.observacoes && (
              <Card className="mt-4 p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
                <div className="space-y-4">
                  <div>
                    <Label className="text-[#00D9FF]">Observações (será impressa)</Label>
                    <Textarea
                      placeholder="Observações que aparecerão no documento impresso"
                      value={formData.observacoes}
                      onChange={(e) => handleChange("observacoes", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white min-h-[100px]"
                    />
                  </div>
                  <div>
                    <Label className="text-[#00D9FF]">Observações Internas</Label>
                    <Textarea
                      placeholder="Observações internas (não serão impressas)"
                      value={formData.observacoesInternas}
                      onChange={(e) => handleChange("observacoesInternas", e.target.value)}
                      className="bg-[#0f1419] border-[#00D9FF]/30 text-white min-h-[100px]"
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex gap-4 justify-end">
            <Button
              onClick={() => navigate("/os/list")}
              variant="outline"
              className="border-[#00D9FF]/30 text-[#00D9FF] hover:bg-[#00D9FF]/10"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvar}
              className="bg-[#00D9FF] text-[#0f1419] hover:bg-[#00D9FF]/80"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Ordem de Serviço
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
