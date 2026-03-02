import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { Save } from "lucide-react";
import { useLocation } from "wouter";
import { useState } from "react";
import { toast } from "sonner";

/**
 * ServiceForm - Formulário de cadastro/edição de Serviço
 * Design: Dark Tech Professional
 */
export default function ServiceForm() {
  const [, navigate] = useLocation();
  const [formData, setFormData] = useState({
    nome: "",
    categoria: "MANUTENCAO",
    descricao: "",
    preco: 0,
    tempoEstimado: "1 hora",
    ativo: true,
    observacoes: "",
  });

  const handleChange = (field: string, value: any) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleSalvar = () => {
    if (!formData.nome) {
      toast.error("Por favor, preencha o nome do serviço");
      return;
    }
    if (formData.preco <= 0) {
      toast.error("Por favor, preencha um preço válido");
      return;
    }
    toast.success("Serviço salvo com sucesso!");
    setTimeout(() => navigate("/services"), 1500);
  };

  return (
    <Layout>
      <div className="container py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#00D9FF] mb-2">Novo Serviço</h1>
          <p className="text-gray-400">Preencha os dados abaixo para criar um novo serviço</p>
        </div>

        <div className="space-y-6">
          {/* INFORMAÇÕES BÁSICAS */}
          <div>
            <h3 className="text-lg font-bold text-[#00D9FF] mb-4">📋 Informações Básicas</h3>
            <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label className="text-[#00D9FF]">Nome do Serviço *</Label>
                  <Input
                    placeholder="Ex: Manutenção de Notebook"
                    value={formData.nome}
                    onChange={(e) => handleChange("nome", e.target.value)}
                    className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#00D9FF]">Categoria</Label>
                  <Select value={formData.categoria} onValueChange={(v) => handleChange("categoria", v)}>
                    <SelectTrigger className="bg-[#0f1419] border-[#00D9FF]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f2e] border-[#00D9FF]/30">
                      <SelectItem value="MANUTENCAO">Manutenção</SelectItem>
                      <SelectItem value="SOFTWARE">Software</SelectItem>
                      <SelectItem value="HARDWARE">Hardware</SelectItem>
                      <SelectItem value="RECUPERACAO">Recuperação</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-[#00D9FF]">Tempo Estimado</Label>
                  <Input
                    placeholder="Ex: 2 horas"
                    value={formData.tempoEstimado}
                    onChange={(e) => handleChange("tempoEstimado", e.target.value)}
                    className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-[#00D9FF]">Descrição</Label>
                  <Textarea
                    placeholder="Descreva o serviço em detalhes"
                    value={formData.descricao}
                    onChange={(e) => handleChange("descricao", e.target.value)}
                    className="bg-[#0f1419] border-[#00D9FF]/30 text-white min-h-[100px]"
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* PREÇO E STATUS */}
          <div>
            <h3 className="text-lg font-bold text-[#00D9FF] mb-4">💳 Preço e Status</h3>
            <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-[#00D9FF]">Preço (R$) *</Label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={formData.preco}
                    onChange={(e) => handleChange("preco", parseFloat(e.target.value))}
                    className="bg-[#0f1419] border-[#00D9FF]/30 text-white"
                  />
                </div>
                <div>
                  <Label className="text-[#00D9FF]">Status</Label>
                  <Select value={formData.ativo ? "ATIVO" : "INATIVO"} onValueChange={(v) => handleChange("ativo", v === "ATIVO")}>
                    <SelectTrigger className="bg-[#0f1419] border-[#00D9FF]/30 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1a1f2e] border-[#00D9FF]/30">
                      <SelectItem value="ATIVO">Ativo</SelectItem>
                      <SelectItem value="INATIVO">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          </div>

          {/* OBSERVAÇÕES */}
          <div>
            <h3 className="text-lg font-bold text-[#00D9FF] mb-4">📝 Observações</h3>
            <Card className="p-6 bg-[#1a1f2e] border-[#00D9FF]/20">
              <Label className="text-[#00D9FF]">Observações</Label>
              <Textarea
                placeholder="Observações adicionais sobre o serviço"
                value={formData.observacoes}
                onChange={(e) => handleChange("observacoes", e.target.value)}
                className="bg-[#0f1419] border-[#00D9FF]/30 text-white min-h-[100px]"
              />
            </Card>
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex gap-4 justify-end">
            <Button
              onClick={() => navigate("/services")}
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
              Salvar Serviço
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
