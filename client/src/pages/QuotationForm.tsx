import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * QuotationForm - Formulário de cadastro/edição de Orçamento
 * Design: Dark Tech Professional com integração tRPC
 * Blocos separados: Serviços e Produtos (aparecem apenas quando adicionados)
 */
export default function QuotationForm() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);

  // Buscar dados do banco
  const { data: clients = [], isLoading: clientsLoading } = trpc.clients.list.useQuery();
  const { data: products = [], isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: services = [], isLoading: servicesLoading } = trpc.services.list.useQuery();

  const isLoadingData = clientsLoading || productsLoading || servicesLoading;

  const [formData, setFormData] = useState({
    clientId: "",
    quotationDate: new Date().toISOString().split("T")[0],
    validityDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    status: "pending",
    notes: "",
  });

  const [quotationServices, setQuotationServices] = useState<any[]>([]);
  const [quotationProducts, setQuotationProducts] = useState<any[]>([]);

  // Mutation para criar orçamento
  const createQuotationMutation = trpc.quotations.create.useMutation({
    onSuccess: () => {
      toast.success("Orçamento salvo com sucesso!");
      navigate("/quotations");
    },
    onError: (error) => {
      toast.error(`Erro ao salvar orçamento: ${error.message}`);
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

  // SERVIÇOS
  const handleAddService = () => {
    setQuotationServices([
      ...quotationServices,
      { id: Date.now(), serviceId: "", quantity: 1, unitPrice: 0, subtotal: 0 },
    ]);
  };

  const handleServiceChange = (index: number, field: string, value: any) => {
    const newServices = [...quotationServices];
    newServices[index][field] = value;

    // Se selecionou um serviço, preencher o preço
    if (field === "serviceId" && value) {
      const selectedService = services.find((s: any) => s.id === Number(value));
      if (selectedService) {
        newServices[index].unitPrice = selectedService.price;
      }
    }

    if (field === "quantity" || field === "unitPrice") {
      newServices[index].subtotal = newServices[index].quantity * newServices[index].unitPrice;
    }

    setQuotationServices(newServices);
  };

  const handleRemoveService = (index: number) => {
    setQuotationServices(quotationServices.filter((_, i) => i !== index));
  };

  // PRODUTOS
  const handleAddProduct = () => {
    setQuotationProducts([
      ...quotationProducts,
      { id: Date.now(), productId: "", quantity: 1, unitPrice: 0, subtotal: 0 },
    ]);
  };

  const handleProductChange = (index: number, field: string, value: any) => {
    const newProducts = [...quotationProducts];
    newProducts[index][field] = value;

    // Se selecionou um produto, preencher o preço
    if (field === "productId" && value) {
      const selectedProduct = products.find((p: any) => p.id === Number(value));
      if (selectedProduct) {
        newProducts[index].unitPrice = selectedProduct.price;
      }
    }

    if (field === "quantity" || field === "unitPrice") {
      newProducts[index].subtotal = newProducts[index].quantity * newProducts[index].unitPrice;
    }

    setQuotationProducts(newProducts);
  };

  const handleRemoveProduct = (index: number) => {
    setQuotationProducts(quotationProducts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      toast.error("Por favor, selecione um cliente");
      return;
    }

    if (quotationServices.length === 0 && quotationProducts.length === 0) {
      toast.error("Por favor, adicione pelo menos um serviço ou produto");
      return;
    }

    setLoading(true);

    try {
      await createQuotationMutation.mutateAsync({
        quotationNumber: `ORC-${Date.now()}`,
        clientId: Number(formData.clientId),
        status: formData.status as "pending" | "approved" | "rejected",
        notes: formData.notes,
        services: quotationServices.map((s) => ({
          serviceId: Number(s.serviceId),
          quantity: s.quantity,
          unitPrice: s.unitPrice,
        })),
        products: quotationProducts.map((p) => ({
          productId: Number(p.productId),
          quantity: p.quantity,
          unitPrice: p.unitPrice,
        })),
      });
    } finally {
      setLoading(false);
    }
  };

  const totalServices = quotationServices.reduce((acc, item) => acc + item.subtotal, 0);
  const totalProducts = quotationProducts.reduce((acc, item) => acc + item.subtotal, 0);
  const grandTotal = totalServices + totalProducts;

  return (
    <Layout>
      <div className="container py-8 max-w-5xl">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Novo Orçamento</h1>
          <p className="text-muted-foreground">
            Preencha os dados abaixo para criar um novo orçamento
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Informações Gerais */}
          <Card className="card-float p-8 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Informações Gerais</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Cliente *
                </label>
                <select
                  name="clientId"
                  value={formData.clientId}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  required
                >
                  <option value="">Selecione um cliente</option>
                  {clients.map((client: any) => (
                    <option key={client.id} value={client.id}>
                      {client.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Data do Orçamento
                </label>
                <input
                  type="date"
                  name="quotationDate"
                  value={formData.quotationDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Validade
                </label>
                <input
                  type="date"
                  name="validityDate"
                  value={formData.validityDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                >
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Observações
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Observações gerais sobre o orçamento"
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          </Card>

          {/* SERVIÇOS */}
          {quotationServices.length > 0 && (
            <Card className="card-float p-8 mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">🔧 Serviços</h2>
              <div className="space-y-4">
                {quotationServices.map((service, index) => (
                  <div key={service.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Serviço
                      </label>
                      <select
                        value={service.serviceId}
                        onChange={(e) => handleServiceChange(index, "serviceId", e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                      >
                        <option value="">Selecione</option>
                        {services.map((svc: any) => (
                          <option key={svc.id} value={svc.id}>
                            {svc.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        value={service.quantity}
                        onChange={(e) =>
                          handleServiceChange(index, "quantity", Number(e.target.value))
                        }
                        min="1"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Valor Unit.
                      </label>
                      <input
                        type="number"
                        value={service.unitPrice}
                        onChange={(e) =>
                          handleServiceChange(index, "unitPrice", Number(e.target.value))
                        }
                        step="0.01"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Subtotal
                      </label>
                      <div className="px-4 py-3 bg-background border border-border rounded-lg text-foreground">
                        R$ {service.subtotal.toFixed(2)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveService(index)}
                      className="px-4 py-3 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* PRODUTOS */}
          {quotationProducts.length > 0 && (
            <Card className="card-float p-8 mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">📦 Produtos</h2>
              <div className="space-y-4">
                {quotationProducts.map((product, index) => (
                  <div key={product.id} className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Produto
                      </label>
                      <select
                        value={product.productId}
                        onChange={(e) => handleProductChange(index, "productId", e.target.value)}
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                      >
                        <option value="">Selecione</option>
                        {products.map((prod: any) => (
                          <option key={prod.id} value={prod.id}>
                            {prod.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Quantidade
                      </label>
                      <input
                        type="number"
                        value={product.quantity}
                        onChange={(e) =>
                          handleProductChange(index, "quantity", Number(e.target.value))
                        }
                        min="1"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Valor Unit.
                      </label>
                      <input
                        type="number"
                        value={product.unitPrice}
                        onChange={(e) =>
                          handleProductChange(index, "unitPrice", Number(e.target.value))
                        }
                        step="0.01"
                        className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-foreground mb-2">
                        Subtotal
                      </label>
                      <div className="px-4 py-3 bg-background border border-border rounded-lg text-foreground">
                        R$ {product.subtotal.toFixed(2)}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(index)}
                      className="px-4 py-3 bg-destructive/20 text-destructive rounded-lg hover:bg-destructive/30 transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Botões para adicionar */}
          <div className="flex gap-4 mb-6">
            <Button
              type="button"
              onClick={handleAddService}
              variant="outline"
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Serviço
            </Button>
            <Button
              type="button"
              onClick={handleAddProduct}
              variant="outline"
              className="flex-1"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Produto
            </Button>
          </div>

          {/* Totalizações */}
          <Card className="card-float p-8 mb-6 bg-accent/5 border-accent/20">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Total Serviços</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {totalServices.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Produtos</p>
                <p className="text-2xl font-bold text-foreground">
                  R$ {totalProducts.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Geral</p>
                <p className="text-2xl font-bold text-accent">
                  R$ {grandTotal.toFixed(2)}
                </p>
              </div>
            </div>
          </Card>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              type="button"
              onClick={() => navigate("/quotations")}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="btn-glow flex-1"
              disabled={loading || createQuotationMutation.isPending}
            >
              {loading || createQuotationMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Orçamento"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
