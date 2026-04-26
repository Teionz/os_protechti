import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewClientModal } from "@/components/NewClientModal";
import Layout from "@/components/Layout";
import { Save, Plus, Trash2, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * OSForm - Formulário de cadastro/edição de Ordem de Serviço
 * Design: Dark Tech Professional com integração tRPC
 * Salva cliente, equipamento e serviços/produtos
 */
export default function OSForm() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/os/edit/:id");
  const isEditing = match && params?.id;
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
  const { data: clients = [], isLoading: clientsLoading, refetch: refetchClients } = trpc.clients.list.useQuery();
  const { data: services = [], isLoading: servicesLoading } = trpc.services.list.useQuery();
  const { data: products = [], isLoading: productsLoading } = trpc.products.list.useQuery();
  const { data: existingOrder, isLoading: orderLoading } = trpc.orders.get.useQuery(
    isEditing ? parseInt(params?.id as string) : undefined as any,
    { enabled: !!isEditing }
  );

  const isLoadingData = clientsLoading || servicesLoading || productsLoading || (isEditing && orderLoading);

  // Gerar orderNumber uma única vez (ou usar existente se editando)
  const orderNumber = useMemo(() => {
    if (isEditing && existingOrder?.orderNumber) {
      return existingOrder.orderNumber;
    }
    return `OS-${Date.now()}`;
  }, [isEditing, existingOrder?.orderNumber]);

  const [formData, setFormData] = useState({
    clientId: "",
    orderNumber: orderNumber,
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

  // Mutations - declaradas no topo do componente
  const createOrderMutation = trpc.orders.create.useMutation();
  const updateOrderMutation = trpc.orders.update.useMutation();
  const createOrderItemMutation = trpc.orderItems.create.useMutation();
  const createEquipmentMutation = trpc.equipments.create.useMutation();

  // Carregar dados da OS se estiver editando
  useEffect(() => {
    if (isEditing && existingOrder) {
      setFormData({
        clientId: existingOrder.clientId?.toString() || "",
        orderNumber: existingOrder.orderNumber,
        status: (existingOrder.status as any) || "budgeting",
        priority: (existingOrder.priority as any) || "medium",
        channel: existingOrder.channel,
        seller: existingOrder.seller || "",
        technician: existingOrder.technician || "",
        equipmentName: existingOrder.equipmentName || "",
        equipmentBrand: existingOrder.equipmentBrand || "",
        equipmentModel: existingOrder.equipmentModel || "",
        equipmentSerial: existingOrder.equipmentSerial || "",
        equipmentCondition: existingOrder.equipmentCondition || "",
        reportedDefects: existingOrder.reportedDefects || "",
        accessories: existingOrder.accessories || "",
        proposedSolution: existingOrder.proposedSolution || "",
        technicalReport: existingOrder.technicalReport || "",
        terms: existingOrder.terms || "",
        publicNotes: existingOrder.publicNotes || "",
        internalNotes: existingOrder.internalNotes || "",
      } as any);
    }
  }, [isEditing, existingOrder]);

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

  // Filtrar serviços por busca
  const filteredServices = services.filter((service: any) =>
    service.name?.toLowerCase().includes(serviceSearch.toLowerCase())
  );

  // Filtrar produtos por busca
  const filteredProducts = products.filter((product: any) =>
    product.name?.toLowerCase().includes(productSearch.toLowerCase())
  );

  // SERVIÇOS
  const handleAddService = () => {
    if (!serviceSearch) {
      toast.error("Selecione um serviço");
      return;
    }
    const selectedService = filteredServices[0];
    if (!selectedService) {
      toast.error("Serviço não encontrado");
      return;
    }
    setOsServices([
      ...osServices,
      {
        id: Date.now(),
        name: selectedService.name,
        price: parseFloat(selectedService.price),
        quantity: 1,
      },
    ]);
    setServiceSearch("");
  };

  const handleRemoveService = (id: number) => {
    setOsServices(osServices.filter((s) => s.id !== id));
  };

  const handleUpdateService = (id: number, field: string, value: any) => {
    setOsServices(
      osServices.map((s) =>
        s.id === id ? { ...s, [field]: value } : s
      )
    );
  };

  // PRODUTOS
  const handleAddProduct = () => {
    if (!productSearch) {
      toast.error("Selecione um produto");
      return;
    }
    const selectedProduct = filteredProducts[0];
    if (!selectedProduct) {
      toast.error("Produto não encontrado");
      return;
    }
    setOsProducts([
      ...osProducts,
      {
        id: Date.now(),
        name: selectedProduct.name,
        price: parseFloat(selectedProduct.price),
        quantity: 1,
      },
    ]);
    setProductSearch("");
  };

  const handleRemoveProduct = (id: number) => {
    setOsProducts(osProducts.filter((p) => p.id !== id));
  };

  const handleUpdateProduct = (id: number, field: string, value: any) => {
    setOsProducts(
      osProducts.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    );
  };

  // Calcular totais
  const totalServices = osServices.reduce((sum, s) => sum + s.price * s.quantity, 0);
  const totalProducts = osProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const total = totalServices + totalProducts;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      toast.error("Selecione um cliente");
      return;
    }

    setLoading(true);

    try {
      // 1. Criar ou Atualizar Ordem de Serviço
      let order;
      if (isEditing && existingOrder?.id) {
        // Editar
        await updateOrderMutation.mutateAsync({
          id: existingOrder.id,
          data: {
            clientId: parseInt(formData.clientId),
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
          },
        });
        order = { id: existingOrder.id };
        toast.success("Ordem de Serviço atualizada com sucesso!");
      } else {
        // Criar
        order = await createOrderMutation.mutateAsync({
          orderNumber: formData.orderNumber,
          clientId: parseInt(formData.clientId),
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
        toast.success("Ordem de Serviço criada com sucesso!");
      }

      if (!order?.id) {
        throw new Error("Falha ao salvar ordem de serviço");
      }

      // 2. Salvar itens de serviço
      for (const service of osServices) {
        await createOrderItemMutation.mutateAsync({
          orderId: order.id,
          type: "service",
          description: service.name,
          quantity: service.quantity,
          unitPrice: service.price.toString(),
          total: (service.quantity * service.price).toString(),
        });
      }

      // 3. Salvar itens de produto
      for (const product of osProducts) {
        await createOrderItemMutation.mutateAsync({
          orderId: order.id,
          type: "product",
          description: product.name,
          quantity: product.quantity,
          unitPrice: product.price.toString(),
          total: (product.quantity * product.price).toString(),
        });
      }

      // 4. Salvar equipamento se houver dados
      if (formData.equipmentName) {
        await createEquipmentMutation.mutateAsync({
          clientId: parseInt(formData.clientId),
          name: formData.equipmentName,
          brand: formData.equipmentBrand,
          model: formData.equipmentModel,
          serial: formData.equipmentSerial,
          category: "Equipamento de Serviço",
          description: formData.equipmentCondition,
        });
      }

      navigate("/os/list");
    } catch (error: any) {
      console.error("Erro ao salvar:", error);
      toast.error(`Erro ao salvar ordem: ${error.message}`);
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
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Nova Ordem de Serviço</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* DADOS GERAIS */}
          <Card className="card-float p-6">
            <div
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => toggleSection("dadosGerais")}
            >
              <h2 className="text-xl font-bold text-foreground">Dados Gerais</h2>
              {expandedSections.dadosGerais ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
            {expandedSections.dadosGerais && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-foreground">Número da OS</Label>
                  <Input
                    type="text"
                    value={formData.orderNumber}
                    disabled
                    className="mt-1 bg-background/50 border-border"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Status</Label>
                  <Select value={formData.status} onValueChange={(v) => handleChange("status", v)}>
                    <SelectTrigger className="mt-1 bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                    <SelectTrigger className="mt-1 bg-background border-border">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
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
                    type="text"
                    value={formData.channel}
                    onChange={(e) => handleChange("channel", e.target.value)}
                    className="mt-1 bg-background border-border"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* CLIENTE */}
          <Card className="card-float p-6">
            <div
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => toggleSection("cliente")}
            >
              <h2 className="text-xl font-bold text-foreground">Cliente</h2>
              {expandedSections.cliente ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
            {expandedSections.cliente && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label className="text-foreground">Selecionar Cliente</Label>
                    <div className="relative mt-1">
                      <Input
                        type="text"
                        placeholder="Buscar cliente..."
                        value={clientSearch}
                        onChange={(e) => setClientSearch(e.target.value)}
                        className="bg-background border-border"
                      />
                      {clientSearch && filteredClients.length > 0 && (
                        <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-lg mt-1 max-h-40 overflow-y-auto z-10">
                          {filteredClients.map((client: any) => (
                            <button
                              key={client.id}
                              type="button"
                              onClick={() => {
                                handleChange("clientId", client.id.toString());
                                setClientSearch("");
                              }}
                              className="w-full text-left px-4 py-2 hover:bg-accent/10 text-foreground"
                            >
                              {client.name} ({client.email})
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-end">
                    <NewClientModal onClientCreated={(clientId) => {
                      handleChange("clientId", clientId.toString());
                      refetchClients();
                    }} />
                  </div>
                </div>
                {formData.clientId && (
                  <div className="p-3 bg-accent/10 border border-accent/30 rounded-lg">
                    <p className="text-sm text-foreground">
                      Cliente selecionado: <strong>{clients.find((c: any) => c.id === parseInt(formData.clientId))?.name}</strong>
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* EQUIPAMENTO */}
          <Card className="card-float p-6">
            <div
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => toggleSection("equipamento")}
            >
              <h2 className="text-xl font-bold text-foreground">Equipamento</h2>
              {expandedSections.equipamento ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
            {expandedSections.equipamento && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-foreground">Nome do Equipamento</Label>
                  <Input
                    type="text"
                    placeholder="Ex: Notebook, Desktop, Impressora"
                    value={formData.equipmentName}
                    onChange={(e) => handleChange("equipmentName", e.target.value)}
                    className="mt-1 bg-background border-border"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Marca</Label>
                  <Input
                    type="text"
                    placeholder="Ex: Dell, HP, Lenovo"
                    value={formData.equipmentBrand}
                    onChange={(e) => handleChange("equipmentBrand", e.target.value)}
                    className="mt-1 bg-background border-border"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Modelo</Label>
                  <Input
                    type="text"
                    placeholder="Ex: XPS 13, ProBook 450"
                    value={formData.equipmentModel}
                    onChange={(e) => handleChange("equipmentModel", e.target.value)}
                    className="mt-1 bg-background border-border"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Número de Série</Label>
                  <Input
                    type="text"
                    placeholder="Número de série"
                    value={formData.equipmentSerial}
                    onChange={(e) => handleChange("equipmentSerial", e.target.value)}
                    className="mt-1 bg-background border-border"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-foreground">Condição do Equipamento</Label>
                  <Textarea
                    placeholder="Descreva o estado do equipamento..."
                    value={formData.equipmentCondition}
                    onChange={(e) => handleChange("equipmentCondition", e.target.value)}
                    className="mt-1 bg-background border-border"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-foreground">Defeitos Relatados</Label>
                  <Textarea
                    placeholder="Descreva os defeitos relatados pelo cliente..."
                    value={formData.reportedDefects}
                    onChange={(e) => handleChange("reportedDefects", e.target.value)}
                    className="mt-1 bg-background border-border"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* SERVIÇOS */}
          <Card className="card-float p-6">
            <div
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => toggleSection("servicos")}
            >
              <h2 className="text-xl font-bold text-foreground">Serviços</h2>
              {expandedSections.servicos ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
            {expandedSections.servicos && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Label className="text-foreground">Adicionar Serviço</Label>
                    <Input
                      type="text"
                      placeholder="Buscar serviço..."
                      value={serviceSearch}
                      onChange={(e) => setServiceSearch(e.target.value)}
                      className="mt-1 bg-background border-border"
                    />
                    {serviceSearch && filteredServices.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-lg mt-1 max-h-40 overflow-y-auto z-10">
                        {filteredServices.map((service: any) => (
                          <button
                            key={service.id}
                            type="button"
                            onClick={() => {
                              setServiceSearch(service.name);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-accent/10 text-foreground"
                          >
                            {service.name} - R$ {parseFloat(service.price).toFixed(2)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleAddService}
                      className="bg-accent text-background hover:bg-accent/90 gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {osServices.length > 0 && (
                  <div className="space-y-2">
                    {osServices.map((service) => (
                      <div key={service.id} className="flex gap-2 items-center p-3 bg-background/50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{service.name}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            min="1"
                            value={service.quantity}
                            onChange={(e) =>
                              handleUpdateService(service.id, "quantity", parseInt(e.target.value))
                            }
                            className="w-16 bg-background border-border text-center"
                          />
                          <span className="text-sm text-muted-foreground">×</span>
                          <span className="text-sm font-medium text-accent">
                            R$ {service.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground">=</span>
                          <span className="text-sm font-bold text-accent">
                            R$ {(service.quantity * service.price).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveService(service.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* PRODUTOS */}
          <Card className="card-float p-6">
            <div
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => toggleSection("produtos")}
            >
              <h2 className="text-xl font-bold text-foreground">Produtos</h2>
              {expandedSections.produtos ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
            {expandedSections.produtos && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <div className="flex-1 relative">
                    <Label className="text-foreground">Adicionar Produto</Label>
                    <Input
                      type="text"
                      placeholder="Buscar produto..."
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      className="mt-1 bg-background border-border"
                    />
                    {productSearch && filteredProducts.length > 0 && (
                      <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-lg mt-1 max-h-40 overflow-y-auto z-10">
                        {filteredProducts.map((product: any) => (
                          <button
                            key={product.id}
                            type="button"
                            onClick={() => {
                              setProductSearch(product.name);
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-accent/10 text-foreground"
                          >
                            {product.name} - R$ {parseFloat(product.price).toFixed(2)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      onClick={handleAddProduct}
                      className="bg-accent text-background hover:bg-accent/90 gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Adicionar
                    </Button>
                  </div>
                </div>

                {osProducts.length > 0 && (
                  <div className="space-y-2">
                    {osProducts.map((product) => (
                      <div key={product.id} className="flex gap-2 items-center p-3 bg-background/50 rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-foreground">{product.name}</p>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Input
                            type="number"
                            min="1"
                            value={product.quantity}
                            onChange={(e) =>
                              handleUpdateProduct(product.id, "quantity", parseInt(e.target.value))
                            }
                            className="w-16 bg-background border-border text-center"
                          />
                          <span className="text-sm text-muted-foreground">×</span>
                          <span className="text-sm font-medium text-accent">
                            R$ {product.price.toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground">=</span>
                          <span className="text-sm font-bold text-accent">
                            R$ {(product.quantity * product.price).toFixed(2)}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleRemoveProduct(product.id)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* RESUMO */}
          <Card className="card-float p-6 bg-accent/5 border-accent/30">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Serviços</p>
                <p className="text-2xl font-bold text-accent">R$ {totalServices.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Produtos</p>
                <p className="text-2xl font-bold text-accent">R$ {totalProducts.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-bold text-accent">R$ {total.toFixed(2)}</p>
              </div>
            </div>
          </Card>

          {/* OBSERVAÇÕES */}
          <Card className="card-float p-6">
            <div
              className="flex items-center justify-between cursor-pointer mb-4"
              onClick={() => toggleSection("observacoes")}
            >
              <h2 className="text-xl font-bold text-foreground">Observações</h2>
              {expandedSections.observacoes ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </div>
            {expandedSections.observacoes && (
              <div className="space-y-4">
                <div>
                  <Label className="text-foreground">Observações Públicas</Label>
                  <Textarea
                    placeholder="Observações que podem ser vistas pelo cliente..."
                    value={formData.publicNotes}
                    onChange={(e) => handleChange("publicNotes", e.target.value)}
                    className="mt-1 bg-background border-border"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Observações Internas</Label>
                  <Textarea
                    placeholder="Observações internas da empresa..."
                    value={formData.internalNotes}
                    onChange={(e) => handleChange("internalNotes", e.target.value)}
                    className="mt-1 bg-background border-border"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* BOTÕES */}
          <div className="flex gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/os/list")}
              className="border-border"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="bg-accent text-background hover:bg-accent/90 gap-2"
              disabled={loading || !formData.clientId}
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
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
