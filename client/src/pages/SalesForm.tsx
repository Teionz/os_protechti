import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Save, Plus, Trash2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

/**
 * SalesForm - Formulário de cadastro/edição de Venda
 * Design: Dark Tech Professional
 * Funcionalidades: Dados gerais, itens de venda, cálculo de comissão
 */
export default function SalesForm() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    numero: "VND-006",
    cliente: "",
    data: new Date().toISOString().split("T")[0],
    vendedor: "",
    status: "FINALIZADA",
    percentualComissao: 10,
    observacoes: "",
  });

  const [itens, setItens] = useState<any[]>([]);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleAddItem = () => {
    setItens([
      ...itens,
      { id: Date.now(), descricao: "", quantidade: 1, unitario: 0, subtotal: 0 },
    ]);
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItens = [...itens];
    newItens[index][field] = value;

    if (field === "quantidade" || field === "unitario") {
      newItens[index].subtotal = newItens[index].quantidade * newItens[index].unitario;
    }

    setItens(newItens);
  };

  const handleRemoveItem = (index: number) => {
    setItens(itens.filter((_, i) => i !== index));
  };

  const handleSalvar = () => {
    if (!formData.cliente) {
      toast.error("Por favor, preencha o cliente");
      return;
    }
    if (!formData.vendedor) {
      toast.error("Por favor, preencha o vendedor");
      return;
    }
    if (itens.length === 0) {
      toast.error("Por favor, adicione pelo menos um item");
      return;
    }
    toast.success("Venda salva com sucesso!");
    setTimeout(() => navigate("/sales"), 1500);
  };

  const totalVenda = itens.reduce((acc, item) => acc + item.subtotal, 0);
  const comissao = (totalVenda * formData.percentualComissao) / 100;

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#00D9FF] mb-2">Nova Venda</h1>
          <p className="text-gray-400">Preencha os dados abaixo para registrar uma nova venda</p>
        </div>

        <div className="space-y-6">
          {/* INFORMAÇÕES GERAIS */}
          <div>
            <h3 className="text-lg font-bold text-[#00D9FF] mb-4">📋 Informações Gerais</h3>
            <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#00D9FF]">Número da Venda</Label>
                  <Input
                    placeholder="VND-001"
                    value={formData.numero}
                    onChange={(e) => handleChange("numero", e.target.value)}
                    className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                    disabled
                  />
                </div>
                <div>
                  <Label className="text-[#00D9FF]">Cliente *</Label>
                  <Input
                    placeholder="Nome do cliente"
                    value={formData.cliente}
                    onChange={(e) => handleChange("cliente", e.target.value)}
                    className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#00D9FF]">Data da Venda</Label>
                  <Input
                    type="date"
                    value={formData.data}
                    onChange={(e) => handleChange("data", e.target.value)}
                    className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#00D9FF]">Vendedor *</Label>
                  <Input
                    placeholder="Nome do vendedor"
                    value={formData.vendedor}
                    onChange={(e) => handleChange("vendedor", e.target.value)}
                    className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#00D9FF]">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger className="bg-[#0f1419] border-[#00D9FF]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f2e] border-[#00D9FF]/30">
                      <SelectItem value="FINALIZADA">Finalizada</SelectItem>
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="CANCELADA">Cancelada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#00D9FF]">Percentual de Comissão (%)</Label>
                  <Input
                    type="number"
                    placeholder="10"
                    value={formData.percentualComissao}
                    onChange={(e) => handleChange("percentualComissao", parseFloat(e.target.value))}
                    className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* ITENS DE VENDA */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#00D9FF]">📦 Itens da Venda</h3>
              <Button
                onClick={handleAddItem}
                size="sm"
                className="bg-[#00D9FF] text-[#0f1419] hover:bg-[#00D9FF]/80"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>

            {itens.length > 0 ? (
              <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
                <div className="space-y-4">
                  {itens.map((item, index) => (
                    <div key={item.id} className="p-4 bg-[#0f1419] rounded-lg border border-[#00D9FF]/20">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div className="md:col-span-2">
                          <Label className="text-[#00D9FF] text-sm">Descrição</Label>
                          <Input
                            placeholder="Ex: Serviço de Manutenção"
                            value={item.descricao}
                            onChange={(e) => handleItemChange(index, "descricao", e.target.value)}
                            className="bg-[#1a1f2e] border-[#00D9FF]/30 text-white text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-[#00D9FF] text-sm">Quantidade</Label>
                          <Input
                            type="number"
                            placeholder="1"
                            value={item.quantidade}
                            onChange={(e) => handleItemChange(index, "quantidade", parseFloat(e.target.value))}
                            className="bg-[#1a1f2e] border-[#00D9FF]/30 text-white text-sm"
                          />
                        </div>
                        <div>
                          <Label className="text-[#00D9FF] text-sm">Valor Unit.</Label>
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={item.unitario}
                            onChange={(e) => handleItemChange(index, "unitario", parseFloat(e.target.value))}
                            className="bg-[#1a1f2e] border-[#00D9FF]/30 text-white text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="text-[#00D9FF]">
                          Subtotal: <span className="font-bold">R$ {item.subtotal.toFixed(2)}</span>
                        </div>
                        <button
                          onClick={() => handleRemoveItem(index)}
                          className="p-2 hover:bg-red-500/10 rounded-lg transition text-red-400"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ) : (
              <Button
                onClick={handleAddItem}
                className="w-full bg-[#00D9FF]/20 text-[#00D9FF] hover:bg-[#00D9FF]/30 border border-[#00D9FF]/50"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            )}
          </div>

          {/* TOTALIZAÇÕES */}
          {itens.length > 0 && (
            <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-[#0f1419] rounded-lg">
                  <div className="text-gray-400 text-sm mb-2">Total da Venda</div>
                  <div className="text-2xl font-bold text-[#00D9FF]">R$ {totalVenda.toFixed(2)}</div>
                </div>
                <div className="p-4 bg-[#0f1419] rounded-lg">
                  <div className="text-gray-400 text-sm mb-2">Comissão ({formData.percentualComissao}%)</div>
                  <div className="text-2xl font-bold text-green-400">R$ {comissao.toFixed(2)}</div>
                </div>
                <div className="p-4 bg-[#0f1419] rounded-lg border-2 border-[#00D9FF]/50">
                  <div className="text-gray-400 text-sm mb-2">Líquido</div>
                  <div className="text-2xl font-bold text-[#00D9FF]">R$ {(totalVenda - comissao).toFixed(2)}</div>
                </div>
              </div>
            </Card>
          )}

          {/* OBSERVAÇÕES */}
          <div>
            <h3 className="text-lg font-bold text-[#00D9FF] mb-4">📝 Observações</h3>
            <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
              <Textarea
                placeholder="Observações sobre a venda"
                value={formData.observacoes}
                onChange={(e) => handleChange("observacoes", e.target.value)}
                className="bg-[#0f1419] border-[#00D9FF]/30 text-white min-h-[100px]"
              />
            </Card>
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex gap-4 justify-end">
            <Button
              onClick={() => navigate("/sales")}
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
              Salvar Venda
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
