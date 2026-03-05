import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * ServiceForm - Formulário de cadastro/edição de Serviço
 * Design: Dark Tech Professional com integração tRPC
 */
export default function ServiceForm() {
  const [location, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [serviceId, setServiceId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    category: "MANUTENCAO",
    description: "",
    price: "",
    estimatedTime: "1 hora",
    status: "active",
    notes: "",
  });

  // Extrair ID da URL (ex: /services/edit/1)
  useEffect(() => {
    const pathParts = location.split("/");
    const id = pathParts[pathParts.length - 1];
    
    if (id && id !== "new" && !isNaN(Number(id))) {
      setIsEditing(true);
      setServiceId(Number(id));
    }
  }, [location]);

  // Query para carregar dados do serviço (se editando)
  const { data: serviceData, isLoading: isLoadingService } = trpc.services.get.useQuery(
    serviceId!,
    { enabled: isEditing && serviceId !== null }
  );

  // Preencher formulário com dados do serviço quando carregar
  useEffect(() => {
    if (serviceData) {
      setFormData({
        name: serviceData.name || "",
        category: serviceData.category || "MANUTENCAO",
        description: serviceData.description || "",
        price: serviceData.price?.toString() || "",
        estimatedTime: serviceData.estimatedTime || "1 hora",
        status: serviceData.status || "active",
        notes: serviceData.notes || "",
      });
    }
  }, [serviceData]);

  // Mutation para criar serviço
  const createServiceMutation = trpc.services.create.useMutation({
    onSuccess: () => {
      toast.success("Serviço salvo com sucesso!");
      navigate("/services");
    },
    onError: (error) => {
      toast.error(`Erro ao salvar serviço: ${error.message}`);
    },
  });

  // Mutation para atualizar serviço
  const updateServiceMutation = trpc.services.update.useMutation({
    onSuccess: () => {
      toast.success("Serviço atualizado com sucesso!");
      navigate("/services");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar serviço: ${error.message}`);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!formData.name || !formData.price) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const servicePayload = {
      name: formData.name,
      category: formData.category,
      description: formData.description,
      price: formData.price,
      estimatedTime: formData.estimatedTime,
      status: formData.status as "active" | "inactive",
      notes: formData.notes,
    };

    if (isEditing && serviceId) {
      // Atualizar serviço existente
      updateServiceMutation.mutate({
        id: serviceId,
        data: servicePayload,
      });
    } else {
      // Criar novo serviço
      createServiceMutation.mutate(servicePayload);
    }
  };

  const isSubmitting = loading || createServiceMutation.isPending || updateServiceMutation.isPending || isLoadingService;
  const pageTitle = isEditing ? "Editar Serviço" : "Novo Serviço";
  const pageDescription = isEditing 
    ? "Atualize os dados do serviço abaixo" 
    : "Preencha os campos abaixo para criar um novo serviço";

  const categorias = [
    { value: "MANUTENCAO", label: "Manutenção" },
    { value: "SOFTWARE", label: "Software" },
    { value: "HARDWARE", label: "Hardware" },
    { value: "RECUPERACAO", label: "Recuperação" },
    { value: "INSTALACAO", label: "Instalação" },
    { value: "SUPORTE", label: "Suporte" },
  ];

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

        {isLoadingService ? (
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
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Nome do Serviço *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Ex: Manutenção de Notebook"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Categoria
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  >
                    {categorias.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Tempo Estimado
                  </label>
                  <input
                    type="text"
                    name="estimatedTime"
                    value={formData.estimatedTime}
                    onChange={handleChange}
                    placeholder="Ex: 2 horas"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descreva o serviço em detalhes"
                    rows={4}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </Card>

            {/* Preço e Status */}
            <Card className="card-float p-8 mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Preço e Status
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Preço *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  >
                    <option value="active">Ativo</option>
                    <option value="inactive">Inativo</option>
                  </select>
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
                placeholder="Observações gerais sobre o serviço"
                rows={5}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => navigate("/services")}
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
                  isEditing ? "Atualizar Serviço" : "Salvar Serviço"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
