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
 * QuotationForm - Formulário de cadastro/edição de Orçamento
 * Design: Dark Tech Professional
 */
export default function QuotationForm() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    numero: "ORC-006",
    cliente: "",
    dataQuotacao: new Date().toISOString().split("T")[0],
    validadeQuotacao: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "PENDENTE",
    observacoes: "",
  });

  const [items, setItems] = useState<any[]>([
    { id: 1, tipo: "SERVICO", descricao: "", quantidade: 1, unitario: 0, subtotal: 0 },
  ]);

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    if (field === "quantidade" || field === "unitario") {
      newItems[index].subtotal = newItems[index].quantidade * newItems[index].unitario;
    }
    
    setItems(newItems);
  };

  const handleAddItem = () => {
    setItems([
      ...items,
      { id: items.length + 1, tipo: "SERVICO", descricao: "", quantidade: 1, unitario: 0, subtotal: 0 },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSalvar = () => {
    if (!formData.cliente) {
      toast.error("Por favor, preencha o cliente");
      return;
    }
    if (items.length === 0) {
      toast.error("Por favor, adicione pelo menos um item");
      return;
    }
    toast.success("Orçamento salvo com sucesso!");
    setTimeout(() => navigate("/quotations"), 1500);
  };

  const total = items.reduce((acc, item) => acc + item.subtotal, 0);

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#00D9FF] mb-2">Novo Orçamento</h1>
          <p className="text-gray-400">Preencha os dados abaixo para criar um novo orçamento</p>
        </div>

        <div className="space-y-6">
          {/* INFORMAÇÕES GERAIS */}
          <div>
            <h3 className="text-lg font-bold text-[#00D9FF] mb-4">📋 Informações Gerais</h3>
            <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#00D9FF]">Número do Orçamento</Label>
                  <Input
                    placeholder="ORC-001"
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
                  <Label className="text-[#00D9FF]">Data do Orçamento</Label>
                  <Input
                    type="date"
                    value={formData.dataQuotacao}
                    onChange={(e) => handleChange("dataQuotacao", e.target.value)}
                    className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#00D9FF]">Validade</Label>
                  <Input
                    type="date"
                    value={formData.validadeQuotacao}
                    onChange={(e) => handleChange("validadeQuotacao", e.target.value)}
                    className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-[#00D9FF]">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger className="bg-[#0f1419] border-[#00D9FF]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f2e] border-[#00D9FF]/30">
                      <SelectItem value="PENDENTE">Pendente</SelectItem>
                      <SelectItem value="APROVADO">Aprovado</SelectItem>
                      <SelectItem value="REJEITADO">Rejeitado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>

          {/* ITENS DO ORÇAMENTO */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-[#00D9FF]">📦 Itens do Orçamento</h3>
              <Button
                onClick={handleAddItem}
                size="sm"
                className="bg-[#00D9FF] text-[#0f1419] hover:bg-[#00D9FF]/80"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Item
              </Button>
            </div>
            <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="p-4 bg-[#0f1419] rounded-lg border border-[#00D9FF]/20">
                    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-4">
                      <div>
                        <Label className="text-[#00D9FF] text-sm">Tipo</Label>
                        <Select
                          value={item.tipo}
                          onValueChange={(v) => handleItemChange(index, "tipo", v)}
                        >
                          <SelectTrigger className="bg-[#1a1f2e] border-[#00D9FF]/30 text-white text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-[#1a1f2e] border-[#00D9FF]/30">
                            <SelectItem value="SERVICO">Serviço</SelectItem>
                            <SelectItem value="PRODUTO">Produto</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="md:col-span-2">
                        <Label className="text-[#00D9FF] text-sm">Descrição</Label>
                        <Input
                          placeholder="Descrição do item"
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
          </div>

          {/* TOTALIZAÇÕES */}
          <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-[#0f1419] rounded-lg">
                <div className="text-gray-400 text-sm mb-2">Subtotal</div>
                <div className="text-2xl font-bold text-[#00D9FF]">R$ {total.toFixed(2)}</div>
              </div>
              <div className="p-4 bg-[#0f1419] rounded-lg">
                <div className="text-gray-400 text-sm mb-2">Desconto</div>
                <div className="text-2xl font-bold text-[#00D9FF]">R$ 0.00</div>
              </div>
              <div className="p-4 bg-[#0f1419] rounded-lg border-2 border-[#00D9FF]/50">
                <div className="text-gray-400 text-sm mb-2">Total</div>
                <div className="text-2xl font-bold text-[#00D9FF]">R$ {total.toFixed(2)}</div>
              </div>
            </div>
          </Card>

          {/* OBSERVAÇÕES */}
          <div>
            <h3 className="text-lg font-bold text-[#00D9FF] mb-4">📝 Observações</h3>
            <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
              <Textarea
                placeholder="Observações sobre o orçamento"
                value={formData.observacoes}
                onChange={(e) => handleChange("observacoes", e.target.value)}
                className="bg-[#0f1419] border-[#00D9FF]/30 text-white min-h-[100px]"
              />
            </Card>
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex gap-4 justify-end">
            <Button
              onClick={() => navigate("/quotations")}
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
              Salvar Orçamento
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
