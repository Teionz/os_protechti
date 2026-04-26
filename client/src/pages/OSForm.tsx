import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Save, Plus, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * OSForm - Formulário de cadastro/edição de Ordem de Serviço
 * Design: Dark Tech Professional com integração tRPC
 * Baseado no GestãoClick com seção de Equipamento expandida
 */
export default function OSForm() {
  const [, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    dadosGerais: true,
    cliente: true,
    equipamento: true,
    servicos: true,
    produtos: true,
    observacoes: true,
  });

  // Buscar dados do banco
  const { data: clients = [], isLoading: clientsLoading } = trpc.clients.list.useQuery();
  const { data: services = [], isLoading: servicesLoading } = trpc.services.list.useQuery();
  const { data: products = [], isLoading: productsLoading } = trpc.products.list.useQuery();

  const isLoadingData = clientsLoading || servicesLoading || productsLoading;

  const [formData, setFormData] = useState({
    clientId: "",
    orderNumber: `OS-${Date.now()}`,
    status: "budgeting",
    priority: "medium",
    channel: "PRESENCIAL",
    seller: "",
    technician: "",
    equipmentName: "",
    equipmentBrand: "",
    equipmentModel: "",
    equipmentSerial: "",
    equipmentCondition: "",
    reportedDefects: "",
    accessories: "",
    proposedSolution: "",
    technicalReport: "",
    terms: "",
    publicNotes: "",
    internalNotes: "",
  });

  const [osServices, setOsServices] = useState<any[]>([]);
  const [osProducts, setOsProducts] = useState<any[]>([]);
  const [clientSearch, setClientSearch] = useState("");
  const [serviceSearch, setServiceSearch] = useState("");
  const [productSearch, setProductSearch] = useState("");

  // Mutation para criar ordem
  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: () => {
      toast.success("Ordem de Serviço salva com sucesso!");
      navigate("/os/list");
    },
    onError: (error) => {
      toast.error(`Erro ao salvar ordem: ${error.message}`);
    },
  });

  const toggleSection = (section: string) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !(expandedSections[section] ?? false),
    });
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Filtrar clientes por busca
  const filteredClients = clients.filter((client: any) =>
    client.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.email?.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // SERVIÇOS
  const handleAddService = () => {
    setOsServices([
      ...osServices,
      { id: Date.now(), serviceId: "", quantity: 1, unitPrice: 0, subtotal: 0 },
    ]);
  };

  const handleServiceChange = (index: number, field: string, value: any) => {
    const newServices = [...osServices];
    newServices[index][field] = value;

    if (field === "serviceId" && value) {
      const selectedService = services.find((s: any) => s.id === Number(value));
      if (selectedService) {
        newServices[index].unitPrice = selectedService.price || 0;
      }
    }

    if (field === "quantity" || field === "unitPrice") {
      newServices[index].subtotal = newServices[index].quantity * newServices[index].unitPrice;
    }

    setOsServices(newServices);
  };

  const handleRemoveService = (index: number) => {
    setOsServices(osServices.filter((_, i) => i !== index));
  };

  const filteredServices = services.filter((service: any) =>
    service.name?.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  // PRODUTOS
  const handleAddProduct = () => {
    setOsProducts([
      ...osProducts,
      { id: Date.now(), productId: "", quantity: 1, unitPrice: 0, subtotal: 0 },
    ]);
  };

  const handleProductChange = (index: number, field: string, value: any) => {
    const newProducts = [...osProducts];
    newProducts[index][field] = value;

    if (field === "productId" && value) {
      const selectedProduct = products.find((p: any) => p.id === Number(value));
      if (selectedProduct) {
        newProducts[index].unitPrice = selectedProduct.price || 0;
      }
    }

    if (field === "quantity" || field === "unitPrice") {
      newProducts[index].subtotal = newProducts[index].quantity * newProducts[index].unitPrice;
    }

    setOsProducts(newProducts);
  };

  const handleRemoveProduct = (index: number) => {
    setOsProducts(osProducts.filter((_, i) => i !== index));
  };

  const filteredProducts = products.filter((product: any) =>
    product.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // Calcular total
  const totalServices = osServices.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const totalProducts = osProducts.reduce((sum, item) => sum + (item.subtotal || 0), 0);
  const total = totalServices + totalProducts;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      toast.error("Selecione um cliente!");
      return;
    }

    if (!formData.equipmentName) {
      toast.error("Preencha o nome do equipamento!");
      return;
    }

    setLoading(true);

    try {
      await createOrderMutation.mutateAsync({
        orderNumber: formData.orderNumber,
        clientId: Number(formData.clientId),
        status: formData.status as any,
        priority: formData.priority as any,
        channel: formData.channel,
        seller: formData.seller,
        technician: formData.technician,
        equipmentName: formData.equipmentName,
        equipmentBrand: formData.equipmentBrand,
        equipmentModel: formData.equipmentModel,
        equipmentSerial: formData.equipmentSerial,
        equipmentCondition: formData.equipmentCondition,
        reportedDefects: formData.reportedDefects,
        accessories: formData.accessories,
        proposedSolution: formData.proposedSolution,
        technicalReport: formData.technicalReport,
        terms: formData.terms,
        publicNotes: formData.publicNotes,
        internalNotes: formData.internalNotes,
        total: total.toString(),
      });
    } catch (error) {
      console.error("Erro ao salvar ordem:", error);
    } finally {
      setLoading(false);
    }
  };

  const SectionHeader = ({ title, section }: { title: string; section: string }) => (
    <button
      onClick={() => toggleSection(section)}
      className="w-full flex items-center justify-between p-4 bg-accent/10 border border-accent/30 rounded-lg hover:border-accent/50 transition-all"
    >
      <h3 className="text-lg font-bold text-accent">{title}</h3>
      {expandedSections[section as keyof typeof expandedSections] ? (
        <ChevronUp className="w-5 h-5 text-accent" />
      ) : (
        <ChevronDown className="w-5 h-5 text-accent" />
      )}
    </button>
  );

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
      <div className="container py-8 max-w-5xl">
        <h1 className="text-3xl font-bold text-foreground mb-8">Nova Ordem de Serviço</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DADOS GERAIS */}
          <div>
            <SectionHeader title="📋 Dados Gerais" section="dadosGerais" />
            {expandedSections.dadosGerais && (
              <Card className="mt-4 p-6 bg-background border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">Número da OS</Label>
                    <Input
                      value={formData.orderNumber}
                      disabled
                      className="bg-background/50 border-border text-foreground"
                    />
                  </div>

                  <div>
                    <Label className="text-foreground">Status</Label>
                    <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border">
                        <SelectItem value="budgeting">Orçando</SelectItem>
                        <SelectItem value="awaiting_approval">Aguardando Aprovação</SelectItem>
                        <SelectItem value="in_progress">Em Andamento</SelectItem>
                        <SelectItem value="awaiting_pickup">Aguardando Retirada</SelectItem>
                        <SelectItem value="completed">Finalizada</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-foreground">Prioridade</Label>
                    <Select value={formData.priority} onValueChange={(v) => handleChange("priority", v)}>
                      <SelectTrigger className="bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-background border-border">
                        <SelectItem value="low">Baixa</SelectItem>
                        <SelectItem value="medium">Média</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-foreground">Canal</Label>
                    <Input
                      value={formData.channel}
                      onChange={(e) => handleChange("channel", e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>

                  <div>
                    <Label className="text-foreground">Vendedor</Label>
                    <Input
                      value={formData.seller}
                      onChange={(e) => handleChange("seller", e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>

                  <div>
                    <Label className="text-foreground">Técnico</Label>
                    <Input
                      value={formData.technician}
                      onChange={(e) => handleChange("technician", e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* CLIENTE */}
          <div>
            <SectionHeader title="👤 Cliente" section="cliente" />
            {expandedSections.cliente && (
              <Card className="mt-4 p-6 bg-background border-border">
                <div>
                  <Label className="text-foreground mb-2 block">Cliente *</Label>
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
              </Card>
            )}
          </div>

          {/* EQUIPAMENTO */}
          <div>
            <SectionHeader title="🖥️ Equipamento" section="equipamento" />
            {expandedSections.equipamento && (
              <Card className="mt-4 p-6 bg-background border-border">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground">Nome do Equipamento *</Label>
                    <Input
                      value={formData.equipmentName}
                      onChange={(e) => handleChange("equipmentName", e.target.value)}
                      placeholder="Ex: Notebook, Desktop, Impressora"
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Marca</Label>
                    <Input
                      value={formData.equipmentBrand}
                      onChange={(e) => handleChange("equipmentBrand", e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Modelo</Label>
                    <Input
                      value={formData.equipmentModel}
                      onChange={(e) => handleChange("equipmentModel", e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground">Série</Label>
                    <Input
                      value={formData.equipmentSerial}
                      onChange={(e) => handleChange("equipmentSerial", e.target.value)}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-foreground">Condições do Equipamento</Label>
                    <Textarea
                      value={formData.equipmentCondition}
                      onChange={(e) => handleChange("equipmentCondition", e.target.value)}
                      rows={2}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-foreground">Defeitos Relatados</Label>
                    <Textarea
                      value={formData.reportedDefects}
                      onChange={(e) => handleChange("reportedDefects", e.target.value)}
                      rows={2}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-foreground">Acessórios</Label>
                    <Textarea
                      value={formData.accessories}
                      onChange={(e) => handleChange("accessories", e.target.value)}
                      rows={2}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                </div>
              </Card>
            )}
          </div>

          {/* SERVIÇOS */}
          {osServices.length > 0 && (
            <div>
              <SectionHeader title="🔧 Serviços" section="servicos" />
              {expandedSections.servicos && (
                <Card className="mt-4 p-6 bg-background border-border">
                  <div className="space-y-4">
                    {osServices.map((service, index) => (
                      <div key={service.id} className="flex gap-4 items-end p-4 bg-background/50 rounded-lg">
                        <div className="flex-1">
                          <Label className="text-sm font-medium text-foreground mb-2 block">Serviço</Label>
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
                          <Label className="text-sm font-medium text-foreground mb-2 block">Qtd</Label>
                          <Input
                            type="number"
                            min="1"
                            value={service.quantity}
                            onChange={(e) => handleServiceChange(index, "quantity", Number(e.target.value))}
                            className="bg-background border-border text-foreground"
                          />
                        </div>

                        <div className="w-24">
                          <Label className="text-sm font-medium text-foreground mb-2 block">Valor</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={service.unitPrice}
                            onChange={(e) => handleServiceChange(index, "unitPrice", Number(e.target.value))}
                            className="bg-background border-border text-foreground"
                          />
                        </div>

                        <div className="w-24">
                          <Label className="text-sm font-medium text-foreground mb-2 block">Subtotal</Label>
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
                </Card>
              )}
            </div>
          )}

          {/* PRODUTOS */}
          {osProducts.length > 0 && (
            <div>
              <SectionHeader title="📦 Produtos" section="produtos" />
              {expandedSections.produtos && (
                <Card className="mt-4 p-6 bg-background border-border">
                  <div className="space-y-4">
                    {osProducts.map((product, index) => (
                      <div key={product.id} className="flex gap-4 items-end p-4 bg-background/50 rounded-lg">
                        <div className="flex-1">
                          <Label className="text-sm font-medium text-foreground mb-2 block">Produto</Label>
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
                          <Label className="text-sm font-medium text-foreground mb-2 block">Qtd</Label>
                          <Input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) => handleProductChange(index, "quantity", Number(e.target.value))}
                            className="bg-background border-border text-foreground"
                          />
                        </div>

                        <div className="w-24">
                          <Label className="text-sm font-medium text-foreground mb-2 block">Valor</Label>
                          <Input
                            type="number"
                            step="0.01"
                            value={product.unitPrice}
                            onChange={(e) => handleProductChange(index, "unitPrice", Number(e.target.value))}
                            className="bg-background border-border text-foreground"
                          />
                        </div>

                        <div className="w-24">
                          <Label className="text-sm font-medium text-foreground mb-2 block">Subtotal</Label>
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
                </Card>
              )}
            </div>
          )}

          {/* BOTÕES PARA ADICIONAR */}
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
          <Card className="p-6 bg-background border-border space-y-2">
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
          </Card>

          {/* OBSERVAÇÕES */}
          <div>
            <SectionHeader title="📝 Observações" section="observacoes" />
            {expandedSections.observacoes && (
              <Card className="mt-4 p-6 bg-background border-border space-y-4">
                <div>
                  <Label className="text-foreground">Solução Proposta</Label>
                  <Textarea
                    value={formData.proposedSolution}
                    onChange={(e) => handleChange("proposedSolution", e.target.value)}
                    rows={3}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-foreground">Laudo Técnico</Label>
                  <Textarea
                    value={formData.technicalReport}
                    onChange={(e) => handleChange("technicalReport", e.target.value)}
                    rows={3}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-foreground">Termos e Condições</Label>
                  <Textarea
                    value={formData.terms}
                    onChange={(e) => handleChange("terms", e.target.value)}
                    rows={3}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-foreground">Observações Públicas</Label>
                  <Textarea
                    value={formData.publicNotes}
                    onChange={(e) => handleChange("publicNotes", e.target.value)}
                    rows={2}
                    className="bg-background border-border text-foreground"
                  />
                </div>

                <div>
                  <Label className="text-foreground">Observações Internas</Label>
                  <Textarea
                    value={formData.internalNotes}
                    onChange={(e) => handleChange("internalNotes", e.target.value)}
                    rows={2}
                    className="bg-background border-border text-foreground"
                  />
                </div>
              </Card>
            )}
          </div>

          {/* BOTÕES DE AÇÃO */}
          <div className="flex gap-4">
            <button
              type="button"
              onClick={() => navigate("/os/list")}
              className="flex-1 px-6 py-2 bg-background border border-border text-foreground rounded-lg hover:bg-background/80 transition font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2 bg-accent text-background rounded-lg hover:bg-accent/90 transition font-medium disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Salvar Ordem
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
