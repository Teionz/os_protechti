import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { useLocation } from "wouter";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

/**
 * ClientForm - Formulário de cadastro/edição de Cliente
 * Design: Dark Tech Professional com campos organizados
 * Integrações: BrasilAPI (CNPJ) e ViaCEP (CEP)
 */
export default function ClientForm() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    cnpjCpf: "",
    email: "",
    telefone: "",
    endereco: "",
    numero: "",
    complemento: "",
    bairro: "",
    cep: "",
    cidade: "",
    estado: "SP",
    contato: "",
    observacoes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  /**
   * Busca dados do CNPJ via BrasilAPI
   */
  const handleCNPJBlur = async () => {
    const cnpj = formData.cnpjCpf.replace(/\D/g, "");

    // Validar se é CNPJ (14 dígitos)
    if (cnpj.length !== 14) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `https://api.brasil.io/api/v1/cnpj/${cnpj}/`,
        {
          headers: {
            Authorization: "Token 6d8f3a9c8b2e1f4a7c9d3e5b8f1a4c7e",
          },
        }
      );

      if (!response.ok) {
        // Tentar com BrasilAPI alternativa
        const altResponse = await fetch(
          `https://brasilapi.com.br/api/cnpj/v1/${cnpj}`
        );

        if (!altResponse.ok) {
          toast.error("CNPJ não encontrado");
          setLoading(false);
          return;
        }

        const data = await altResponse.json();

        setFormData((prev) => ({
          ...prev,
          nome: data.name || "",
          endereco: `${data.address || ""}`,
          numero: data.number || "",
          bairro: data.district || "",
          cidade: data.city || "",
          estado: data.state || "SP",
          telefone: data.phone || "",
          email: data.email || "",
          cep: data.zip_code?.replace(/\D/g, "") || "",
        }));

        toast.success("Dados do CNPJ carregados com sucesso!");
      } else {
        const data = await response.json();

        setFormData((prev) => ({
          ...prev,
          nome: data.name || "",
          endereco: `${data.street || ""}`,
          numero: data.number || "",
          bairro: data.neighborhood || "",
          cidade: data.city || "",
          estado: data.state || "SP",
          telefone: data.phone || "",
          email: data.email || "",
          cep: data.zip_code?.replace(/\D/g, "") || "",
        }));

        toast.success("Dados do CNPJ carregados com sucesso!");
      }
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      toast.error("Erro ao buscar dados do CNPJ");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca dados do CEP via ViaCEP
   */
  const handleCEPBlur = async () => {
    const cep = formData.cep.replace(/\D/g, "");

    // Validar se é CEP válido (8 dígitos)
    if (cep.length !== 8) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);

      if (!response.ok) {
        toast.error("CEP não encontrado");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.erro) {
        toast.error("CEP não encontrado");
        setLoading(false);
        return;
      }

      setFormData((prev) => ({
        ...prev,
        endereco: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: data.uf || "SP",
      }));

      toast.success("Endereço carregado com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar dados do CEP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Lógica de envio aqui
    console.log("Cliente salvo:", formData);
    navigate("/clients");
  };

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Novo Cliente
          </h1>
          <p className="text-muted-foreground">
            Preencha os campos abaixo para criar um novo cliente
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Informações Básicas */}
          <Card className="card-float p-8 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Informações Básicas
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Nome/Razão Social *
                </label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  placeholder="Nome do cliente"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  CNPJ/CPF * 
                  <span className="text-xs text-accent ml-2">(Auto-preenche ao sair do campo)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="cnpjCpf"
                    value={formData.cnpjCpf}
                    onChange={handleChange}
                    onBlur={handleCNPJBlur}
                    placeholder="00.000.000/0000-00"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  />
                  {loading && (
                    <Loader2 className="absolute right-3 top-3 w-5 h-5 text-accent animate-spin" />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  E-mail *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@exemplo.com"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="telefone"
                  value={formData.telefone}
                  onChange={handleChange}
                  placeholder="(17) 99999-9999"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Contato (Responsável)
                </label>
                <input
                  type="text"
                  name="contato"
                  value={formData.contato}
                  onChange={handleChange}
                  placeholder="Nome do responsável"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          </Card>

          {/* Endereço */}
          <Card className="card-float p-8 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Endereço
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  CEP *
                  <span className="text-xs text-accent ml-2">(Auto-preenche ao sair do campo)</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="cep"
                    value={formData.cep}
                    onChange={handleChange}
                    onBlur={handleCEPBlur}
                    placeholder="00000-000"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  />
                  {loading && (
                    <Loader2 className="absolute right-3 top-3 w-5 h-5 text-accent animate-spin" />
                  )}
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Rua/Avenida *
                </label>
                <input
                  type="text"
                  name="endereco"
                  value={formData.endereco}
                  onChange={handleChange}
                  placeholder="Rua, Avenida, etc"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Número *
                </label>
                <input
                  type="text"
                  name="numero"
                  value={formData.numero}
                  onChange={handleChange}
                  placeholder="123"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Complemento
                </label>
                <input
                  type="text"
                  name="complemento"
                  value={formData.complemento}
                  onChange={handleChange}
                  placeholder="Apto, Sala, etc"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Bairro *
                </label>
                <input
                  type="text"
                  name="bairro"
                  value={formData.bairro}
                  onChange={handleChange}
                  placeholder="Bairro"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Cidade *
                </label>
                <input
                  type="text"
                  name="cidade"
                  value={formData.cidade}
                  onChange={handleChange}
                  placeholder="Cidade"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Estado *
                </label>
                <input
                  type="text"
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  placeholder="SP"
                  maxLength={2}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  required
                />
              </div>
            </div>
          </Card>

          {/* Observações */}
          <Card className="card-float p-8 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">
              Observações
            </h2>
            <textarea
              name="observacoes"
              value={formData.observacoes}
              onChange={handleChange}
              placeholder="Observações gerais sobre o cliente"
              rows={5}
              className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => navigate("/clients")}
              variant="outline"
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button type="submit" className="btn-glow flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Carregando...
                </>
              ) : (
                "Salvar Cliente"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
