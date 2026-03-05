import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * ClientForm - Formulário de cadastro/edição de Cliente
 * Design: Dark Tech Professional com campos organizados
 * Integrações: Receita.ws (CNPJ), ViaCEP (CEP) e tRPC (salvar no banco)
 */
export default function ClientForm() {
  const [location, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [clientId, setClientId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    cnpjCpf: "",
    email: "",
    phone: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    zipCode: "",
    city: "",
    state: "SP",
    contact: "",
    notes: "",
  });

  // Extrair ID da URL (ex: /clients/edit/1)
  useEffect(() => {
    const pathParts = location.split("/");
    const id = pathParts[pathParts.length - 1];
    
    if (id && id !== "new" && !isNaN(Number(id))) {
      setIsEditing(true);
      setClientId(Number(id));
    }
  }, [location]);

  // Query para carregar dados do cliente (se editando)
  const { data: clientData, isLoading: isLoadingClient } = trpc.clients.get.useQuery(
    clientId!,
    { enabled: isEditing && clientId !== null }
  );

  // Preencher formulário com dados do cliente quando carregar
  useEffect(() => {
    if (clientData) {
      setFormData({
        name: clientData.name || "",
        cnpjCpf: clientData.cnpjCpf || "",
        email: clientData.email || "",
        phone: clientData.phone || "",
        street: clientData.street || "",
        number: clientData.number || "",
        complement: clientData.complement || "",
        neighborhood: clientData.neighborhood || "",
        zipCode: clientData.zipCode || "",
        city: clientData.city || "",
        state: clientData.state || "SP",
        contact: clientData.contact || "",
        notes: clientData.notes || "",
      });
    }
  }, [clientData]);

  // Mutation para criar cliente
  const createClientMutation = trpc.clients.create.useMutation({
    onSuccess: () => {
      toast.success("Cliente salvo com sucesso!");
      navigate("/clients");
    },
    onError: (error) => {
      toast.error(`Erro ao salvar cliente: ${error.message}`);
    },
  });

  // Mutation para atualizar cliente
  const updateClientMutation = trpc.clients.update.useMutation({
    onSuccess: () => {
      toast.success("Cliente atualizado com sucesso!");
      navigate("/clients");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar cliente: ${error.message}`);
    },
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
   * Busca dados do CNPJ via Receita.ws
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
        `https://www.receitaws.com.br/v1/cnpj/${cnpj}`,
        {
          headers: {
            "Accept": "application/json",
          },
        }
      );

      if (!response.ok) {
        toast.error("Erro ao buscar CNPJ");
        setLoading(false);
        return;
      }

      const data = await response.json();

      if (data.status === "ERROR") {
        toast.error("CNPJ não encontrado ou inválido");
        setLoading(false);
        return;
      }

      // Mapear dados da API para o formulário
      setFormData((prev) => ({
        ...prev,
        name: data.nome || "",
        street: data.logradouro || "",
        number: data.numero || "",
        neighborhood: data.bairro || "",
        city: data.municipio || "",
        state: data.uf || "SP",
        phone: data.telefone || "",
        email: data.email || "",
        zipCode: data.cep?.replace(/\D/g, "") || "",
      }));

      toast.success("Dados do CNPJ carregados com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar CNPJ:", error);
      toast.error("Erro ao buscar dados do CNPJ. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Busca dados do CEP via ViaCEP
   */
  const handleCEPBlur = async () => {
    const cep = formData.zipCode.replace(/\D/g, "");

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
        street: data.logradouro || "",
        neighborhood: data.bairro || "",
        city: data.localidade || "",
        state: data.uf || "SP",
      }));

      toast.success("Endereço carregado com sucesso!");
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
      toast.error("Erro ao buscar dados do CEP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!formData.name || !formData.email || !formData.phone) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const clientPayload = {
      name: formData.name,
      cnpjCpf: formData.cnpjCpf,
      email: formData.email,
      phone: formData.phone,
      street: formData.street,
      number: formData.number,
      complement: formData.complement,
      neighborhood: formData.neighborhood,
      zipCode: formData.zipCode,
      city: formData.city,
      state: formData.state,
      contact: formData.contact,
      notes: formData.notes,
    };

    if (isEditing && clientId) {
      // Atualizar cliente existente
      updateClientMutation.mutate({
        id: clientId,
        data: clientPayload,
      });
    } else {
      // Criar novo cliente
      createClientMutation.mutate(clientPayload);
    }
  };

  const isSubmitting = loading || createClientMutation.isPending || updateClientMutation.isPending || isLoadingClient;
  const pageTitle = isEditing ? "Editar Cliente" : "Novo Cliente";
  const pageDescription = isEditing 
    ? "Atualize os dados do cliente abaixo" 
    : "Preencha os campos abaixo para criar um novo cliente";

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {pageTitle}
          </h1>
          <p className="text-muted-foreground">
            {pageDescription}
          </p>
        </div>

        {isLoadingClient ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-accent animate-spin" />
          </div>
        ) : (
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
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nome do cliente"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    CNPJ/CPF 
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
                    name="phone"
                    value={formData.phone}
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
                    name="contact"
                    value={formData.contact}
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
                    CEP
                    <span className="text-xs text-accent ml-2">(Auto-preenche ao sair do campo)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      onBlur={handleCEPBlur}
                      placeholder="00000-000"
                      className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                    {loading && (
                      <Loader2 className="absolute right-3 top-3 w-5 h-5 text-accent animate-spin" />
                    )}
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Rua/Avenida
                  </label>
                  <input
                    type="text"
                    name="street"
                    value={formData.street}
                    onChange={handleChange}
                    placeholder="Rua, Avenida, etc"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Número
                  </label>
                  <input
                    type="text"
                    name="number"
                    value={formData.number}
                    onChange={handleChange}
                    placeholder="123"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Complemento
                  </label>
                  <input
                    type="text"
                    name="complement"
                    value={formData.complement}
                    onChange={handleChange}
                    placeholder="Apto, Sala, etc"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Bairro
                  </label>
                  <input
                    type="text"
                    name="neighborhood"
                    value={formData.neighborhood}
                    onChange={handleChange}
                    placeholder="Bairro"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Cidade
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="Cidade"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Estado
                  </label>
                  <input
                    type="text"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="SP"
                    maxLength={2}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
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
                name="notes"
                value={formData.notes}
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
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" className="btn-glow flex-1" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isEditing ? "Atualizando..." : "Salvando..."}
                  </>
                ) : (
                  isEditing ? "Atualizar Cliente" : "Salvar Cliente"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
