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
 * Autocomplete para clientes, produtos e serviços
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
  
  // Estados para busca/filtro
  const [clientSearch, setClientSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

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

  // Filtrar clientes por busca
  const filteredClients = clients.filter((client: any) =>
    client.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.email?.toLowerCase().includes(clientSearch.toLowerCase())
  );

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
        newServices[index].unitPrice = selectedService.price || 0;
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

  // Filtrar serviços por busca
  const filteredServices = services.filter((service: any) =>
    service.name?.toLowerCase().includes(serviceSearch.toLowerCase())
  );

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
        newProducts[index].unitPrice = selectedProduct.price || 0;
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

  // Filtrar produtos por busca
  const filteredProducts = products.filter((product: any) =>
    product.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Calcular totalizações
  const totalServices = quotationServices.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const totalProducts = quotationProducts.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const total = totalServices + totalProducts;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      toast.error("Selecione um cliente!");
      return;
    }

    if (quotationServices.length === 0 && quotationProducts.length === 0) {
      toast.error("Adicione pelo menos um serviço ou produto!");
      return;
    }

    setLoading(true);

    try {
      await createQuotationMutation.mutateAsync({
        quotationNumber: `ORC-${Date.now()}`,
        clientId: Number(formData.clientId),
        status: formData.status as "pending" | "approved" | "rejected",
        total: total.toString(),
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
    } catch (error) {
      console.error("Erro ao salvar orçamento:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isLoadingData) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Novo Orçamento</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* SEÇÃO: DADOS GERAIS */}
          <div className="card-float p-6">
            <h2 className="text-xl font-semibold text-foreground mb-4">Dados Gerais</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cliente com Autocomplete */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Cliente *
                </label>
                <input
                  type="text"
                  placeholder="Buscar cliente..."
                  value={clientSearch}
                  onChange={(e) => setClientSearch(e.target.value)}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
                {clientSearch && filteredClients.length > 0 && (
                  <div className="mt-2 border border-border rounded-lg bg-background max-h-48 overflow-y-auto">
                    {filteredClients.map((client: any) => (
                      <button
                        key={client.id}
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, clientId: client.id.toString() }));
                          setClientSearch(client.name);
                        }}
                        className="w-full text-left px-4 py-2 hover:bg-accent/10 text-foreground transition"
                      >
                        <div className="font-medium">{client.name}</div>
                        <div className="text-xs text-muted-foreground">{client.email}</div>
                      </button>
                    ))}
                  </div>
                )}
                {formData.clientId && (
                  <div className="mt-2 p-2 bg-accent/10 rounded text-sm text-foreground">
                    ✓ Cliente selecionado: {clients.find((c: any) => c.id === Number(formData.clientId))?.name}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Data do Orçamento
                </label>
                <input
                  type="date"
                  name="quotationDate"
                  value={formData.quotationDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Validade
                </label>
                <input
                  type="date"
                  name="validityDate"
                  value={formData.validityDate}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                >
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovado</option>
                  <option value="rejected">Rejeitado</option>
                </select>
              </div>
            </div>
          </div>

          {/* SEÇÃO: SERVIÇOS */}
          {quotationServices.length > 0 && (
            <div className="card-float p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">🔧 Serviços</h2>

              <div className="space-y-4">
                {quotationServices.map((service, index) => (
                  <div key={service.id} className="flex gap-4 items-end p-4 bg-background/50 rounded-lg">
                    {/* Serviço com Autocomplete */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Serviço
                      </label>
                      <input
                        type="text"
                        placeholder="Buscar serviço..."
                        value={serviceSearch}
                        onChange={(e) => setServiceSearch(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      {serviceSearch && filteredServices.length > 0 && (
                        <div className="mt-2 border border-border rounded-lg bg-background max-h-32 overflow-y-auto">
                          {filteredServices.map((svc: any) => (
                            <button
                              key={svc.id}
                              type="button"
                              onClick={() => {
                                handleServiceChange(index, "serviceId", svc.id);
                                setServiceSearch("");
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-accent/10 text-foreground transition"
                            >
                              {svc.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="w-20">
                      <label className="block text-sm font-medium text-foreground mb-2">Qtd</label>
                      <input
                        type="number"
                        min="1"
                        value={service.quantity}
                        onChange={(e) =>
                          handleServiceChange(index, "quantity", Number(e.target.value))
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div className="w-24">
                      <label className="block text-sm font-medium text-foreground mb-2">Valor</label>
                      <input
                        type="number"
                        step="0.01"
                        value={service.unitPrice}
                        onChange={(e) =>
                          handleServiceChange(index, "unitPrice", Number(e.target.value))
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div className="w-24">
                      <label className="block text-sm font-medium text-foreground mb-2">Subtotal</label>
                      <div className="px-4 py-2 bg-accent/10 rounded-lg text-foreground font-semibold">
                        R$ {service.subtotal.toFixed(2)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveService(index)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SEÇÃO: PRODUTOS */}
          {quotationProducts.length > 0 && (
            <div className="card-float p-6">
              <h2 className="text-xl font-semibold text-foreground mb-4">📦 Produtos</h2>

              <div className="space-y-4">
                {quotationProducts.map((product, index) => (
                  <div key={product.id} className="flex gap-4 items-end p-4 bg-background/50 rounded-lg">
                    {/* Produto com Autocomplete */}
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Produto
                      </label>
                      <input
                        type="text"
                        placeholder="Buscar produto..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                      {productSearch && filteredProducts.length > 0 && (
                        <div className="mt-2 border border-border rounded-lg bg-background max-h-32 overflow-y-auto">
                          {filteredProducts.map((prod: any) => (
                            <button
                              key={prod.id}
                              type="button"
                              onClick={() => {
                                handleProductChange(index, "productId", prod.id);
                                setProductSearch("");
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-accent/10 text-foreground transition"
                            >
                              {prod.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="w-20">
                      <label className="block text-sm font-medium text-foreground mb-2">Qtd</label>
                      <input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) =>
                          handleProductChange(index, "quantity", Number(e.target.value))
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div className="w-24">
                      <label className="block text-sm font-medium text-foreground mb-2">Valor</label>
                      <input
                        type="number"
                        step="0.01"
                        value={product.unitPrice}
                        onChange={(e) =>
                          handleProductChange(index, "unitPrice", Number(e.target.value))
                        }
                        className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-accent"
                      />
                    </div>

                    <div className="w-24">
                      <label className="block text-sm font-medium text-foreground mb-2">Subtotal</label>
                      <div className="px-4 py-2 bg-accent/10 rounded-lg text-foreground font-semibold">
                        R$ {product.subtotal.toFixed(2)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveProduct(index)}
                      className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BOTÕES PARA ADICIONAR SERVIÇOS E PRODUTOS */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={handleAddService}
              className="flex items-center gap-2 px-6 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              Adicionar Serviço
            </button>

            <button
              type="button"
              onClick={handleAddProduct}
              className="flex items-center gap-2 px-6 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition font-medium"
            >
              <Plus className="w-5 h-5" />
              Adicionar Produto
            </button>
          </div>

          {/* TOTALIZAÇÕES */}
          <div className="card-float p-6 space-y-2">
            <div className="flex justify-between text-foreground">
              <span>Total Serviços:</span>
              <span className="font-semibold">R$ {totalServices.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-foreground">
              <span>Total Produtos:</span>
              <span className="font-semibold">R$ {totalProducts.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between text-lg text-accent font-bold">
              <span>Total Geral:</span>
              <span>R$ {total.toFixed(2)}</span>
            </div>
          </div>

          {/* OBSERVAÇÕES */}
          <div className="card-float p-6">
            <label className="block text-sm font-medium text-foreground mb-2">Observações</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent"
              placeholder="Adicione observações sobre o orçamento..."
            />
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/quotations")}
              className="flex-1 px-6 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-background/80 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition font-medium disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                  Salvando...
                </>
              ) : (
                "Salvar Orçamento"
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
