import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * SalesForm - Formulário de cadastro/edição de Venda
 * Design: Dark Tech Professional com integração tRPC
 * Blocos separados: Serviços e Produtos (aparecem apenas quando adicionados)
 */
export default function SalesForm() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);

  // Buscar dados do banco
  const { data: clients = [] } = trpc.clients.list.useQuery();
  const { data: products = [] } = trpc.products.list.useQuery();
  const { data: services = [] } = trpc.services.list.useQuery();

  const [formData, setFormData] = useState({
    clientId: "",
    saleDate: new Date().toISOString().split("T")[0],
    seller: "",
    status: "completed",
    commissionPercentage: "10",
    notes: "",
  });

  const [saleServices, setSaleServices] = useState<any[]>([]);
  const [saleProducts, setSaleProducts] = useState<any[]>([]);

  // Mutation para criar venda
  const createSaleMutation = trpc.sales.create.useMutation({
    onSuccess: () => {
      toast.success("Venda salva com sucesso!");
      navigate("/sales");
    },
    onError: (error) => {
      toast.error(`Erro ao salvar venda: ${error.message}`);
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
    setSaleServices([
      ...saleServices,
      { id: Date.now(), serviceId: "", quantity: 1, unitPrice: 0, subtotal: 0 },
    ]);
  };

  const handleServiceChange = (index: number, field: string, value: any) => {
    const newServices = [...saleServices];
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

    setSaleServices(newServices);
  };

  const handleRemoveService = (index: number) => {
    setSaleServices(saleServices.filter((_, i) => i !== index));
  };

  // PRODUTOS
  const handleAddProduct = () => {
    setSaleProducts([
      ...saleProducts,
      { id: Date.now(), productId: "", quantity: 1, unitPrice: 0, subtotal: 0 },
    ]);
  };

  const handleProductChange = (index: number, field: string, value: any) => {
    const newProducts = [...saleProducts];
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

    setSaleProducts(newProducts);
  };

  const handleRemoveProduct = (index: number) => {
    setSaleProducts(saleProducts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      toast.error("Por favor, selecione um cliente");
      return;
    }

    if (!formData.seller) {
      toast.error("Por favor, preencha o vendedor");
      return;
    }

    if (saleServices.length === 0 && saleProducts.length === 0) {
      toast.error("Por favor, adicione pelo menos um serviço ou produto");
      return;
    }

    setLoading(true);

    try {
      const subtotal = totalServices + totalProducts;
      const commission = (subtotal * Number(formData.commissionPercentage)) / 100;

      await createSaleMutation.mutateAsync({
        saleNumber: `VND-${Date.now()}`,
        clientId: Number(formData.clientId),
        status: formData.status as "pending" | "completed" | "cancelled",
        seller: formData.seller,
        commission: commission.toString(),
        subtotal: subtotal.toString(),
        total: subtotal.toString(),
        notes: formData.notes,
        services: saleServices.map((s) => ({
          serviceId: Number(s.serviceId),
          quantity: s.quantity,
          unitPrice: s.unitPrice,
        })),
        products: saleProducts.map((p) => ({
          productId: Number(p.productId),
          quantity: p.quantity,
          unitPrice: p.unitPrice,
        })),
      });
    } finally {
      setLoading(false);
    }
  };

  const totalServices = saleServices.reduce((acc, item) => acc + item.subtotal, 0);
  const totalProducts = saleProducts.reduce((acc, item) => acc + item.subtotal, 0);
  const subtotal = totalServices + totalProducts;
  const commission = (subtotal * Number(formData.commissionPercentage)) / 100;
  const grandTotal = subtotal;

  return (
    <Layout>
      <div className="container py-8 max-w-5xl">
        {/* Page Title */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Nova Venda</h1>
          <p className="text-muted-foreground">
            Preencha os dados abaixo para registrar uma nova venda
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
                  Data da Venda
                </label>
                <input
                  type="date"
                  name="saleDate"
                  value={formData.saleDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Vendedor *
                </label>
                <input
                  type="text"
                  name="seller"
                  value={formData.seller}
                  onChange={handleChange}
                  placeholder="Nome do vendedor"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  required
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
                  <option value="completed">Concluída</option>
                  <option value="cancelled">Cancelada</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Comissão (%)
                </label>
                <input
                  type="number"
                  name="commissionPercentage"
                  value={formData.commissionPercentage}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-foreground mb-2">
                  Observações
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Observações gerais sobre a venda"
                  rows={3}
                  className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                />
              </div>
            </div>
          </Card>

          {/* SERVIÇOS */}
          {saleServices.length > 0 && (
            <Card className="card-float p-8 mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">🔧 Serviços</h2>
              <div className="space-y-4">
                {saleServices.map((service, index) => (
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
          {saleProducts.length > 0 && (
            <Card className="card-float p-8 mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">📦 Produtos</h2>
              <div className="space-y-4">
                {saleProducts.map((product, index) => (
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-muted-foreground text-sm">Total Serviços</p>
                <p className="text-xl font-bold text-foreground">
                  R$ {totalServices.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Produtos</p>
                <p className="text-xl font-bold text-foreground">
                  R$ {totalProducts.toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Comissão</p>
                <p className="text-xl font-bold text-foreground">
                  R$ {commission.toFixed(2)}
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
              onClick={() => navigate("/sales")}
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="btn-glow flex-1"
              disabled={loading || createSaleMutation.isPending}
            >
              {loading || createSaleMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                "Salvar Venda"
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
