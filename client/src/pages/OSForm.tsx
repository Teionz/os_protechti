import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Layout from "@/components/Layout";
import { Save, Plus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";

/**
 * OSForm - Formulário de cadastro/edição de Ordem de Serviço
 * Design: Dark Tech Professional com multi-step form
 */
export default function OSForm() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    numero: "705",
    data: new Date().toISOString().split("T")[0],
    entrada: "",
    saida: "",
    origem: "ANUNCIO",
    carregador: false,
    ligando: false,
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
      defeitos: "",
      solucao: "",
      laudo: "",
    },
    servicos: [{ nome: "", quantidade: 1, valorUnitario: 0 }],
    produtos: [{ nome: "", unidade: "UN", quantidade: 1, valorUnitario: 0 }],
    pagamento: {
      vencimento: "",
      valor: 0,
      forma: "A_COMBINAR",
      observacao: "",
    },
    observacoes: "",
  });

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
      servicos: [...formData.servicos, { nome: "", quantidade: 1, valorUnitario: 0 }],
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
      produtos: [...formData.produtos, { nome: "", unidade: "UN", quantidade: 1, valorUnitario: 0 }],
    });
  };

  const removerProduto = (index: number) => {
    setFormData({
      ...formData,
      produtos: formData.produtos.filter((_, i) => i !== index),
    });
  };

  const totalServicos = formData.servicos.reduce((acc, s) => acc + (s.quantidade * s.valorUnitario), 0);
  const totalProdutos = formData.produtos.reduce((acc, p) => acc + (p.quantidade * p.valorUnitario), 0);
  const totalGeral = totalServicos + totalProdutos;

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">Nova Ordem de Serviço</h1>
            <p className="text-muted-foreground">Preencha os campos abaixo para criar uma nova OS</p>
          </div>
          <Button className="btn-glow gap-2">
            <Save className="w-4 h-4" />
            Salvar
          </Button>
        </div>

        {/* Seção: Informações Básicas */}
        <Card className="card-float p-6 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Informações Básicas</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-foreground mb-2 block">Número da OS</Label>
              <Input
                type="text"
                value={formData.numero}
                onChange={(e) => setFormData({ ...formData, numero: e.target.value })}
                readOnly
                className="bg-input/50"
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Data de Emissão</Label>
              <Input
                type="date"
                value={formData.data}
                onChange={(e) => setFormData({ ...formData, data: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Entrada</Label>
              <Input
                type="datetime-local"
                value={formData.entrada}
                onChange={(e) => setFormData({ ...formData, entrada: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Saída</Label>
              <Input
                type="datetime-local"
                value={formData.saida}
                onChange={(e) => setFormData({ ...formData, saida: e.target.value })}
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Origem</Label>
              <Select value={formData.origem} onValueChange={(value) => setFormData({ ...formData, origem: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ANUNCIO">Anúncio</SelectItem>
                  <SelectItem value="CLIENTE">Cliente</SelectItem>
                  <SelectItem value="BNI">BNI</SelectItem>
                  <SelectItem value="INDICACAO">Indicação</SelectItem>
                  <SelectItem value="NOVO">Novo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.carregador}
                  onChange={(e) => setFormData({ ...formData, carregador: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-foreground">Carregador</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ligando}
                  onChange={(e) => setFormData({ ...formData, ligando: e.target.checked })}
                  className="w-4 h-4"
                />
                <span className="text-foreground">Ligando</span>
              </label>
            </div>
          </div>
        </Card>

        {/* Seção: Dados do Cliente */}
        <Card className="card-float p-6 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Dados do Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Label className="text-foreground mb-2 block">Nome/Razão Social</Label>
              <Input
                type="text"
                placeholder="Nome do cliente"
                value={formData.cliente.nome}
                onChange={(e) => handleClienteChange("nome", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">CNPJ/CPF</Label>
              <Input
                type="text"
                placeholder="00.000.000/0000-00"
                value={formData.cliente.cnpjCpf}
                onChange={(e) => handleClienteChange("cnpjCpf", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Telefone</Label>
              <Input
                type="tel"
                placeholder="(17) 99999-9999"
                value={formData.cliente.telefone}
                onChange={(e) => handleClienteChange("telefone", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-foreground mb-2 block">E-mail</Label>
              <Input
                type="email"
                placeholder="email@exemplo.com"
                value={formData.cliente.email}
                onChange={(e) => handleClienteChange("email", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-foreground mb-2 block">Endereço</Label>
              <Input
                type="text"
                placeholder="Rua, Avenida, etc"
                value={formData.cliente.endereco}
                onChange={(e) => handleClienteChange("endereco", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Número</Label>
              <Input
                type="text"
                placeholder="123"
                value={formData.cliente.numero}
                onChange={(e) => handleClienteChange("numero", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Complemento</Label>
              <Input
                type="text"
                placeholder="Apto, Sala, etc"
                value={formData.cliente.complemento}
                onChange={(e) => handleClienteChange("complemento", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Bairro</Label>
              <Input
                type="text"
                placeholder="Bairro"
                value={formData.cliente.bairro}
                onChange={(e) => handleClienteChange("bairro", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">CEP</Label>
              <Input
                type="text"
                placeholder="00000-000"
                value={formData.cliente.cep}
                onChange={(e) => handleClienteChange("cep", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Cidade</Label>
              <Input
                type="text"
                placeholder="Cidade"
                value={formData.cliente.cidade}
                onChange={(e) => handleClienteChange("cidade", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Estado</Label>
              <Input
                type="text"
                placeholder="SP"
                value={formData.cliente.estado}
                onChange={(e) => handleClienteChange("estado", e.target.value)}
              />
            </div>
          </div>
        </Card>

        {/* Seção: Equipamento */}
        <Card className="card-float p-6 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Equipamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-foreground mb-2 block">Nome do Equipamento</Label>
              <Input
                type="text"
                placeholder="Notebook, Desktop, etc"
                value={formData.equipamento.nome}
                onChange={(e) => handleEquipamentoChange("nome", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Marca</Label>
              <Input
                type="text"
                placeholder="Dell, HP, Lenovo, etc"
                value={formData.equipamento.marca}
                onChange={(e) => handleEquipamentoChange("marca", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Modelo</Label>
              <Input
                type="text"
                placeholder="Modelo"
                value={formData.equipamento.modelo}
                onChange={(e) => handleEquipamentoChange("modelo", e.target.value)}
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Série</Label>
              <Input
                type="text"
                placeholder="Número de série"
                value={formData.equipamento.serie}
                onChange={(e) => handleEquipamentoChange("serie", e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-foreground mb-2 block">Defeitos</Label>
              <Textarea
                placeholder="Descreva os defeitos encontrados"
                value={formData.equipamento.defeitos}
                onChange={(e) => handleEquipamentoChange("defeitos", e.target.value)}
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-foreground mb-2 block">Solução</Label>
              <Textarea
                placeholder="Descreva a solução aplicada"
                value={formData.equipamento.solucao}
                onChange={(e) => handleEquipamentoChange("solucao", e.target.value)}
                rows={3}
              />
            </div>
            <div className="md:col-span-2">
              <Label className="text-foreground mb-2 block">Laudo Técnico</Label>
              <Textarea
                placeholder="Laudo técnico completo"
                value={formData.equipamento.laudo}
                onChange={(e) => handleEquipamentoChange("laudo", e.target.value)}
                rows={4}
              />
            </div>
          </div>
        </Card>

        {/* Seção: Serviços */}
        <Card className="card-float p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Serviços</h2>
            <Button
              onClick={adicionarServico}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
          </div>
          <div className="space-y-4">
            {formData.servicos.map((servico, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-input/30 rounded-lg">
                <div>
                  <Label className="text-foreground mb-2 block text-xs">Nome</Label>
                  <Input
                    type="text"
                    placeholder="Nome do serviço"
                    value={servico.nome}
                    onChange={(e) => handleServicoChange(index, "nome", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-foreground mb-2 block text-xs">Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={servico.quantidade}
                    onChange={(e) => handleServicoChange(index, "quantidade", parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-foreground mb-2 block text-xs">Valor Unitário</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={servico.valorUnitario}
                    onChange={(e) => handleServicoChange(index, "valorUnitario", parseFloat(e.target.value))}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => removerServico(index)}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-foreground font-semibold">
              Total Serviços: <span className="text-accent">R$ {totalServicos.toFixed(2)}</span>
            </p>
          </div>
        </Card>

        {/* Seção: Produtos */}
        <Card className="card-float p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Produtos</h2>
            <Button
              onClick={adicionarProduto}
              variant="outline"
              size="sm"
              className="gap-2"
            >
              <Plus className="w-4 h-4" />
              Adicionar
            </Button>
          </div>
          <div className="space-y-4">
            {formData.produtos.map((produto, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 bg-input/30 rounded-lg">
                <div>
                  <Label className="text-foreground mb-2 block text-xs">Nome</Label>
                  <Input
                    type="text"
                    placeholder="Nome do produto"
                    value={produto.nome}
                    onChange={(e) => handleProdutoChange(index, "nome", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-foreground mb-2 block text-xs">Unidade</Label>
                  <Input
                    type="text"
                    placeholder="UN"
                    value={produto.unidade}
                    onChange={(e) => handleProdutoChange(index, "unidade", e.target.value)}
                  />
                </div>
                <div>
                  <Label className="text-foreground mb-2 block text-xs">Quantidade</Label>
                  <Input
                    type="number"
                    min="1"
                    value={produto.quantidade}
                    onChange={(e) => handleProdutoChange(index, "quantidade", parseFloat(e.target.value))}
                  />
                </div>
                <div>
                  <Label className="text-foreground mb-2 block text-xs">Valor Unitário</Label>
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    value={produto.valorUnitario}
                    onChange={(e) => handleProdutoChange(index, "valorUnitario", parseFloat(e.target.value))}
                  />
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={() => removerProduto(index)}
                    variant="destructive"
                    size="sm"
                    className="w-full"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-foreground font-semibold">
              Total Produtos: <span className="text-accent">R$ {totalProdutos.toFixed(2)}</span>
            </p>
          </div>
        </Card>

        {/* Seção: Pagamento */}
        <Card className="card-float p-6 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Pagamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label className="text-foreground mb-2 block">Vencimento</Label>
              <Input
                type="date"
                value={formData.pagamento.vencimento}
                onChange={(e) => setFormData({
                  ...formData,
                  pagamento: { ...formData.pagamento, vencimento: e.target.value }
                })}
              />
            </div>
            <div>
              <Label className="text-foreground mb-2 block">Forma de Pagamento</Label>
              <Select
                value={formData.pagamento.forma}
                onValueChange={(value) => setFormData({
                  ...formData,
                  pagamento: { ...formData.pagamento, forma: value }
                })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="A_COMBINAR">A Combinar</SelectItem>
                  <SelectItem value="DINHEIRO">Dinheiro</SelectItem>
                  <SelectItem value="CARTAO_CREDITO">Cartão de Crédito</SelectItem>
                  <SelectItem value="CARTAO_DEBITO">Cartão de Débito</SelectItem>
                  <SelectItem value="TRANSFERENCIA">Transferência</SelectItem>
                  <SelectItem value="CHEQUE">Cheque</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label className="text-foreground mb-2 block">Observação</Label>
              <Textarea
                placeholder="Observações sobre o pagamento"
                value={formData.pagamento.observacao}
                onChange={(e) => setFormData({
                  ...formData,
                  pagamento: { ...formData.pagamento, observacao: e.target.value }
                })}
                rows={2}
              />
            </div>
          </div>
          <div className="mt-6 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <div className="flex items-center justify-between">
              <span className="text-foreground font-semibold">Total Geral:</span>
              <span className="text-2xl font-bold text-accent">R$ {totalGeral.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Seção: Observações */}
        <Card className="card-float p-6 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Observações</h2>
          <Textarea
            placeholder="Observações gerais sobre a ordem de serviço"
            value={formData.observacoes}
            onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
            rows={4}
          />
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => navigate("/dashboard")}
            variant="outline"
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button className="btn-glow flex-1 gap-2">
            <Save className="w-4 h-4" />
            Salvar Ordem de Serviço
          </Button>
        </div>
      </div>
    </Layout>
  );
}
