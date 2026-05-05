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
    camposExtras: true,
    servicos: true,
    produtos: true,
    resumo: true,
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
  const { data: existingOrderItems = [], isLoading: orderItemsLoading } = trpc.orderItems.getByOrderId.useQuery(
    isEditing ? parseInt(params?.id as string) : undefined as any,
    { enabled: !!isEditing }
  );

  const isLoadingData = clientsLoading || servicesLoading || productsLoading || (isEditing && orderLoading) || (isEditing && orderItemsLoading);

  // Gerar orderNumber uma única vez
  const orderNumber = useMemo(() => {
    if (isEditing && existingOrder?.orderNumber) {
      return existingOrder.orderNumber;
    }
    return `${Date.now()}`;
  }, [isEditing, existingOrder?.orderNumber]);

  const [formData, setFormData] = useState({
    clientId: "",
    orderNumber: orderNumber,
    status: "budgeting",
    priority: "medium",

    seller: "",
    technician: "",
    // Equipamento
    equipmentName: "",
    equipmentBrand: "",
    equipmentModel: "",
    equipmentSerial: "",
    equipmentTag: "",
    equipmentCondition: "",
    reportedDefects: "",
    accessories: "",
    // Campos extras
    origin: "",
    missingKeyboard: "",
    crackedScreen: "",
    missingCharger: "",
    missingBag: "",
    poweringOn: "",
    missingPowerCable: "",
    password: "",
    // Solução e relatório
    proposedSolution: "",
    technicalReport: "",
    terms: "",
    publicNotes: "",
    internalNotes: "",
    // Financeiro
    laborCost: "0",
    partsCost: "0",
    shippingCost: "0",
    otherCosts: "0",
    discount: "0",
  });

  // Itens de serviço e produto com campos manuais
  const [osServices, setOsServices] = useState<Array<{
    id: number;
    name: string;
    details: string;
    quantity: number;
    price: number;
    discount: number;
    discountType: 'percent' | 'fixed';
  }>>([]);

  const [osProducts, setOsProducts] = useState<Array<{
    id: number;
    name: string;
    details: string;
    quantity: number;
    price: number;
    discount: number;
    discountType: 'percent' | 'fixed';
  }>>([]);

  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [showEquipmentSuggestions, setShowEquipmentSuggestions] = useState(false);
  const [clientSearch, setClientSearch] = useState("");
  const [serviceDropdownOpen, setServiceDropdownOpen] = useState<Record<number, boolean>>({});
  const [productDropdownOpen, setProductDropdownOpen] = useState<Record<number, boolean>>({});
  const [equipmentTagError, setEquipmentTagError] = useState("");
  const [checkingTag, setCheckingTag] = useState(false);
  // Rastreia se o equipamento foi selecionado de um já cadastrado (não deve validar etiqueta)
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<number | null>(null);
  // Tipo de desconto: 'percent' = % sobre subtotal, 'fixed' = valor fixo em R$
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('fixed');

  // Buscar equipamentos do cliente
  const { data: clientEquipments = [] } = trpc.equipments.searchByClientId.useQuery(
    formData.clientId ? { clientId: parseInt(formData.clientId), query: equipmentSearch } : undefined as any,
    { enabled: !!formData.clientId }
  );

  // Mutations
  const utils = trpc.useUtils();
  const createOrderMutation = trpc.orders.create.useMutation();
  const updateOrderMutation = trpc.orders.update.useMutation();
  const createOrderItemMutation = trpc.orderItems.create.useMutation();
  const deleteOrderItemMutation = trpc.orderItems.delete.useMutation();
  const deleteOrderItemsByOrderIdMutation = trpc.orderItems.deleteByOrderId.useMutation();
  const createEquipmentMutation = trpc.equipments.create.useMutation();

  // Validar etiqueta em tempo real
  const validateEquipmentTag = async (tag: string, excludeId?: number) => {
    if (!tag) { setEquipmentTagError(""); return true; }
    setCheckingTag(true);
    try {
      const input = { equipmentTag: tag, excludeId };
      const response = await fetch(`/api/trpc/equipments.checkTagExists?input=${encodeURIComponent(JSON.stringify(input))}`, {
        method: 'GET', credentials: 'include',
      });
      const result = await response.json();
      const exists = result.result?.data ?? false;
      if (exists) {
        setEquipmentTagError(`Etiqueta "${tag}" já existe no sistema`);
        return false;
      } else {
        setEquipmentTagError("");
        return true;
      }
    } catch { return true; }
    finally { setCheckingTag(false); }
  };

  // Carregar dados da OS se estiver editando
  useEffect(() => {
    if (isEditing && existingOrder) {
      const o = existingOrder as any;
      // Ao editar, marcar o equipamento como já existente para evitar validação de etiqueta duplicada
      // Usamos -1 como sentinela para indicar "equipamento já existe, não validar"
      setSelectedEquipmentId(-1);
      setFormData({
        clientId: o.clientId?.toString() || "",
        orderNumber: o.orderNumber,
        status: o.status || "budgeting",
        priority: o.priority || "medium",

        seller: o.seller || "",
        technician: o.technician || "",
        equipmentName: o.equipmentName || "",
        equipmentBrand: o.equipmentBrand || "",
        equipmentModel: o.equipmentModel || "",
        equipmentSerial: o.equipmentSerial || "",
        equipmentTag: o.equipmentTag || "",
        equipmentCondition: o.equipmentCondition || "",
        reportedDefects: o.reportedDefects || "",
        accessories: o.accessories || "",
        origin: o.origin || "",
        missingKeyboard: o.missingKeyboard || "",
        crackedScreen: o.crackedScreen || "",
        missingCharger: o.missingCharger || "",
        missingBag: o.missingBag || "",
        poweringOn: o.poweringOn || "",
        missingPowerCable: o.missingPowerCable || "",
        password: o.password || "",
        proposedSolution: o.proposedSolution || "",
        technicalReport: o.technicalReport || "",
        terms: o.terms || "",
        publicNotes: o.publicNotes || "",
        internalNotes: o.internalNotes || "",
        laborCost: o.laborCost || "",
        partsCost: o.partsCost || "",
        shippingCost: o.shippingCost || "",
        otherCosts: o.otherCosts || "",
        discount: o.discount || "",
      });
      // Restaurar tipo de desconto salvo
      if (o.discountType) setDiscountType(o.discountType as 'fixed' | 'percent');

      if (existingOrderItems && existingOrderItems.length > 0) {
        const svc = existingOrderItems
          .filter((item: any) => item.type === "service")
          .map((item: any) => ({
            id: item.id,
            name: item.description,
            details: item.details || "",
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.unitPrice) || 0,
            discount: parseFloat(item.discount) || 0,
            discountType: (item.discountType as 'percent' | 'fixed') || 'percent',
          }));
        const prd = existingOrderItems
          .filter((item: any) => item.type === "product")
          .map((item: any) => ({
            id: item.id,
            name: item.description,
            details: item.details || "",
            quantity: parseInt(item.quantity) || 1,
            price: parseFloat(item.unitPrice) || 0,
            discount: parseFloat(item.discount) || 0,
            discountType: (item.discountType as 'percent' | 'fixed') || 'percent',
          }));
        setOsServices(svc);
        setOsProducts(prd);
      }
    }
  }, [isEditing, existingOrder, existingOrderItems]);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectEquipment = (equipment: any) => {
    setFormData(prev => ({
      ...prev,
      equipmentName: equipment.name || "",
      equipmentBrand: equipment.brand || "",
      equipmentModel: equipment.model || "",
      equipmentSerial: equipment.serial || "",
      equipmentTag: equipment.equipmentTag || "",
    }));
    setEquipmentSearch(equipment.name);
    setShowEquipmentSuggestions(false);
    // Marcar que este equipamento já existe no sistema - não validar etiqueta
    setSelectedEquipmentId(equipment.id || null);
    setEquipmentTagError("");
  };

  const filteredClients = clients.filter((client: any) =>
    client.name?.toLowerCase().includes(clientSearch.toLowerCase()) ||
    client.email?.toLowerCase().includes(clientSearch.toLowerCase())
  );

  // Serviços - adicionar linha manual
  const handleAddServiceRow = () => {
    setOsServices(prev => [...prev, { id: Date.now(), name: "", details: "", quantity: 1, price: 0, discount: 0, discountType: 'percent' as const }]);
  };

  const handleRemoveService = async (id: number) => {
    if (isEditing && id < 1000000000000) {
      try { await deleteOrderItemMutation.mutateAsync(id); } catch {}
    }
    setOsServices(prev => prev.filter(s => s.id !== id));
  };

  const handleUpdateService = (id: number, field: string, value: any) => {
    setOsServices(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Produtos - adicionar linha manual
  const handleAddProductRow = () => {
    setOsProducts(prev => [...prev, { id: Date.now(), name: "", details: "", quantity: 1, price: 0, discount: 0, discountType: 'percent' as const }]);
  };

  const handleRemoveProduct = async (id: number) => {
    if (isEditing && id < 1000000000000) {
      try { await deleteOrderItemMutation.mutateAsync(id); } catch {}
    }
    setOsProducts(prev => prev.filter(p => p.id !== id));
  };

  const handleUpdateProduct = (id: number, field: string, value: any) => {
    setOsProducts(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  // Calcular subtotais
  const calcSubtotal = (item: { quantity: number; price: number; discount: number; discountType?: 'percent' | 'fixed' }) => {
    const sub = item.quantity * item.price;
    const dtype = item.discountType ?? 'percent';
    if (dtype === 'fixed') return Math.max(0, sub - item.discount);
    return sub - (sub * (item.discount / 100));
  };

  const totalServices = osServices.reduce((sum, s) => sum + calcSubtotal(s), 0);
  const totalProducts = osProducts.reduce((sum, p) => sum + calcSubtotal(p), 0);
  const laborCostNum = parseFloat(formData.laborCost) || 0;
  const shippingCostNum = parseFloat(formData.shippingCost) || 0;
  const otherCostsNum = parseFloat(formData.otherCosts) || 0;
  const discountValue = parseFloat(formData.discount) || 0;
  const subtotalGeral = totalServices + totalProducts + laborCostNum + shippingCostNum + otherCostsNum;
  const discountNum = discountType === 'percent' ? (subtotalGeral * discountValue / 100) : discountValue;
  const totalGeral = subtotalGeral - discountNum;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.clientId) { toast.error("Selecione um cliente"); return; }

    // Só valida etiqueta se o equipamento não foi selecionado de um já cadastrado
    if (formData.equipmentTag && !selectedEquipmentId) {
      const isTagValid = await validateEquipmentTag(formData.equipmentTag, isEditing ? parseInt(params?.id as string) : undefined);
      if (!isTagValid) { toast.error("Etiqueta de controle duplicada. Escolha outra etiqueta."); return; }
    }

    setLoading(true);
    try {
      // 0. Salvar equipamento primeiro
      // Se selectedEquipmentId estiver definido, o equipamento já existe - não criar novamente
      const hasEquipmentData = formData.equipmentName || formData.equipmentBrand || formData.equipmentModel || formData.equipmentSerial || formData.equipmentTag;
      if (hasEquipmentData && !selectedEquipmentId) {
        // Equipamento novo: verificar se etiqueta já existe por nome/tag para evitar duplicata
        let equipmentExists = false;
        if (formData.equipmentTag) {
          const existing = await utils.equipments.searchByClientId.fetch({ clientId: parseInt(formData.clientId), query: formData.equipmentTag });
          equipmentExists = existing.some((e: any) => e.equipmentTag === formData.equipmentTag);
        }
        if (!equipmentExists) {
          const result = await createEquipmentMutation.mutateAsync({
            clientId: parseInt(formData.clientId),
            name: formData.equipmentName,
            brand: formData.equipmentBrand,
            model: formData.equipmentModel,
            serial: formData.equipmentSerial,
            equipmentTag: formData.equipmentTag,
            category: "Equipamento de Serviço",
            description: formData.equipmentCondition,
          });
          if (result?.id) toast.success("Equipamento salvo com sucesso!");
        }
      }

      // 1. Criar ou atualizar OS
      const orderData = {
        clientId: parseInt(formData.clientId),
        status: formData.status as any,
        priority: formData.priority as any,

        seller: formData.seller,
        technician: formData.technician,
        equipmentName: formData.equipmentName,
        equipmentBrand: formData.equipmentBrand,
        equipmentModel: formData.equipmentModel,
        equipmentSerial: formData.equipmentSerial,
        equipmentTag: formData.equipmentTag,
        equipmentCondition: formData.equipmentCondition,
        reportedDefects: formData.reportedDefects,
        accessories: formData.accessories,
        origin: (formData.origin as "advertisement" | "client" | "referral" | "bni" | "new_client") || null,
        missingKeyboard: (formData.missingKeyboard as "yes" | "no") || null,
        crackedScreen: (formData.crackedScreen as "yes" | "no") || null,
        missingCharger: (formData.missingCharger as "yes" | "no") || null,
        missingBag: (formData.missingBag as "yes" | "no") || null,
        poweringOn: (formData.poweringOn as "yes" | "no") || null,
        missingPowerCable: (formData.missingPowerCable as "yes" | "no") || null,
        password: formData.password,
        proposedSolution: formData.proposedSolution,
        technicalReport: formData.technicalReport,
        terms: formData.terms,
        publicNotes: formData.publicNotes,
        internalNotes: formData.internalNotes,
        laborCost: formData.laborCost,
        partsCost: formData.partsCost,
        shippingCost: formData.shippingCost,
        otherCosts: formData.otherCosts,
        discount: discountNum.toString(),
        discountType: discountType,
        total: totalGeral.toString(),
      };

      let order: any;
      if (isEditing && existingOrder?.id) {
        await updateOrderMutation.mutateAsync({ id: existingOrder.id, data: orderData });
        order = { id: existingOrder.id };
        toast.success("Ordem de Serviço atualizada com sucesso!");
      } else {
        order = await createOrderMutation.mutateAsync({ orderNumber: formData.orderNumber, ...orderData });
        toast.success("Ordem de Serviço criada com sucesso!");
      }

      if (!order?.id) throw new Error("Falha ao salvar ordem de serviço");

      // 2. Deletar itens antigos e recriar
      if (isEditing && order.id) {
        try { await deleteOrderItemsByOrderIdMutation.mutateAsync(order.id); } catch {}
      }

      for (const service of osServices) {
        if (!service.name) continue;
        await createOrderItemMutation.mutateAsync({
          orderId: order.id,
          type: "service",
          description: service.name,
          details: service.details || undefined,
          quantity: service.quantity,
          unitPrice: service.price.toString(),
          discount: service.discount ? service.discount.toString() : undefined,
          discountType: service.discountType,
          total: calcSubtotal(service).toString(),
        });
      }

      for (const product of osProducts) {
        if (!product.name) continue;
        await createOrderItemMutation.mutateAsync({
          orderId: order.id,
          type: "product",
          description: product.name,
          details: product.details || undefined,
          quantity: product.quantity,
          unitPrice: product.price.toString(),
          discount: product.discount ? product.discount.toString() : undefined,
          discountType: product.discountType,
          total: calcSubtotal(product).toString(),
        });
      }

      await utils.orders.list.invalidate();
      await utils.orders.get.invalidate(order.id);
      await utils.equipments.list.invalidate();

      navigate("/os/list");
    } catch (error: any) {
      toast.error(`Erro ao salvar: ${error?.message || "Erro desconhecido"}`);
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

  const SectionHeader = ({ title, section }: { title: string; section: string }) => (
    <div
      className="flex items-center justify-between cursor-pointer mb-4"
      onClick={() => toggleSection(section)}
    >
      <h2 className="text-xl font-bold text-foreground">{title}</h2>
      {expandedSections[section] ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
    </div>
  );

  const YesNoSelect = ({ field, label }: { field: string; label: string }) => (
    <div>
      <Label className="text-foreground">{label}</Label>
      <Select value={(formData as any)[field]} onValueChange={(v) => handleChange(field, v)}>
        <SelectTrigger className="mt-1 bg-background border-border">
          <SelectValue placeholder="Selecione..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="yes">Sim</SelectItem>
          <SelectItem value="no">Não</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <Layout>
      <div className="container py-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          {isEditing ? "Editar Ordem de Serviço" : "Nova Ordem de Serviço"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* DADOS GERAIS */}
          <Card className="card-float p-6">
            <SectionHeader title="Dados Gerais" section="dadosGerais" />
            {expandedSections.dadosGerais && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-foreground">Ordem de Serviço</Label>
                  <Input
                    type="text"
                    value={formData.orderNumber}
                    disabled
                    className="mt-1 bg-background/50 border-border font-mono"
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
                  <Label className="text-foreground">Origem</Label>
                  <Select value={formData.origin} onValueChange={(v) => handleChange("origin", v)}>
                    <SelectTrigger className="mt-1 bg-background border-border">
                      <SelectValue placeholder="Selecione a origem..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="advertisement">Anúncio</SelectItem>
                      <SelectItem value="client">Cliente</SelectItem>
                      <SelectItem value="referral">Indicação</SelectItem>
                      <SelectItem value="bni">BNI</SelectItem>
                      <SelectItem value="new_client">Cliente Novo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-foreground">Técnico</Label>
                  <Input
                    type="text"
                    value={formData.technician}
                    onChange={(e) => handleChange("technician", e.target.value)}
                    className="mt-1 bg-background border-border"
                    placeholder="Nome do técnico"
                  />
                </div>
                <div>
                  <Label className="text-foreground">Vendedor</Label>
                  <Input
                    type="text"
                    value={formData.seller}
                    onChange={(e) => handleChange("seller", e.target.value)}
                    className="mt-1 bg-background border-border"
                    placeholder="Nome do vendedor"
                  />
                </div>

              </div>
            )}
          </Card>

          {/* CLIENTE */}
          <Card className="card-float p-6">
            <SectionHeader title="Cliente" section="cliente" />
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

          {/* CAMPOS EXTRAS */}
          <Card className="card-float p-6">
            <SectionHeader title="Informações Adicionais" section="camposExtras" />
            {expandedSections.camposExtras && (
              <div className="space-y-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <YesNoSelect field="missingKeyboard" label="Teclado faltando" />
                  <YesNoSelect field="crackedScreen" label="Tela trincada" />
                  <YesNoSelect field="missingCharger" label="Carregador" />
                  <YesNoSelect field="missingBag" label="Bolsa" />
                  <YesNoSelect field="poweringOn" label="Ligando" />
                  <YesNoSelect field="missingPowerCable" label="Cabo de energia" />
                </div>
                <div className="max-w-sm">
                  <Label className="text-foreground">Senha</Label>
                  <Input
                    type="text"
                    placeholder="Senha do dispositivo (se houver)"
                    value={formData.password}
                    onChange={(e) => handleChange("password", e.target.value)}
                    className="mt-1 bg-background border-border"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* EQUIPAMENTO */}
          <Card className="card-float p-6">
            <SectionHeader title="Equipamento" section="equipamento" />
            {expandedSections.equipamento && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Label className="text-foreground">Nome do Equipamento</Label>
                  <Input
                    type="text"
                    placeholder="Ex: Notebook, Desktop, Impressora"
                    value={formData.equipmentName}
                    onChange={(e) => {
                      handleChange("equipmentName", e.target.value);
                      setEquipmentSearch(e.target.value);
                      setShowEquipmentSuggestions(true);
                    }}
                    onFocus={() => setShowEquipmentSuggestions(true)}
                    className="mt-1 bg-background border-border"
                  />
                  {showEquipmentSuggestions && equipmentSearch && clientEquipments.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-lg mt-1 max-h-40 overflow-y-auto z-10">
                      {clientEquipments.map((equipment: any) => (
                        <button
                          key={equipment.id}
                          type="button"
                          onClick={() => handleSelectEquipment(equipment)}
                          className="w-full text-left px-4 py-2 hover:bg-accent/10 text-foreground border-b border-border/50 last:border-b-0"
                        >
                          <div className="text-sm font-medium">{equipment.name}</div>
                          <div className="text-xs text-muted-foreground">{equipment.brand} {equipment.model} - SN: {equipment.serial}</div>
                        </button>
                      ))}
                    </div>
                  )}
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
                <div>
                  <Label className="text-foreground">Etiqueta de Controle</Label>
                  <Input
                    type="text"
                    placeholder="Ex: EQUIP-001, TAG-2024-001"
                    value={formData.equipmentTag}
                    onChange={(e) => {
                      handleChange("equipmentTag", e.target.value);
                      // Se o usuário editar manualmente, resetar o equipamento selecionado
                      setSelectedEquipmentId(null);
                      if (e.target.value) {
                        validateEquipmentTag(e.target.value, isEditing ? parseInt(params?.id as string) : undefined);
                      } else {
                        setEquipmentTagError("");
                      }
                    }}
                    className={`mt-1 bg-background border-border ${equipmentTagError ? "border-red-500" : ""}`}
                    disabled={checkingTag}
                  />
                  {equipmentTagError && <p className="text-red-500 text-sm mt-1">⚠️ {equipmentTagError}</p>}
                  {checkingTag && <p className="text-yellow-500 text-sm mt-1">Verificando disponibilidade...</p>}
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
                <div className="md:col-span-2">
                  <Label className="text-foreground">Solução Proposta</Label>
                  <Textarea
                    placeholder="Descreva a solução proposta..."
                    value={formData.proposedSolution}
                    onChange={(e) => handleChange("proposedSolution", e.target.value)}
                    className="mt-1 bg-background border-border"
                  />
                </div>
                <div className="md:col-span-2">
                  <Label className="text-foreground">Laudo Técnico</Label>
                  <Textarea
                    placeholder="Laudo técnico..."
                    value={formData.technicalReport}
                    onChange={(e) => handleChange("technicalReport", e.target.value)}
                    className="mt-1 bg-background border-border"
                  />
                </div>
              </div>
            )}
          </Card>

          {/* SERVIÇOS */}
          <Card className="card-float p-6">
            <SectionHeader title="Serviços" section="servicos" />
            {expandedSections.servicos && (
              <div className="space-y-3">
                {/* Cabeçalho da tabela */}
                <div className="hidden md:grid grid-cols-12 gap-2 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  <div className="col-span-3">Serviço</div>
                  <div className="col-span-3">Detalhes</div>
                  <div className="col-span-1 text-center">Qtd</div>
                  <div className="col-span-2 text-right">Valor (R$)</div>
                  <div className="col-span-2 text-right">Desc</div>
                  <div className="col-span-1 text-right">Subtotal</div>
                  <div className="col-span-1"></div>
                </div>

                {osServices.map((service) => (
                  <div key={service.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-background/50 rounded-lg border border-border/30">
                    <div className="col-span-12 md:col-span-3 relative">
                      <Input
                        type="text"
                        placeholder="Nome do serviço"
                        value={service.name}
                        onChange={(e) => {
                          handleUpdateService(service.id, "name", e.target.value);
                          setServiceDropdownOpen(prev => ({ ...prev, [service.id]: true }));
                        }}
                        onFocus={() => setServiceDropdownOpen(prev => ({ ...prev, [service.id]: true }))}
                        onBlur={() => setTimeout(() => setServiceDropdownOpen(prev => ({ ...prev, [service.id]: false })), 150)}
                        className="bg-background border-border text-sm"
                        autoComplete="off"
                      />
                      {serviceDropdownOpen[service.id] && service.name && (() => {
                        const filtered = (services as any[]).filter((s: any) =>
                          s.name?.toLowerCase().includes(service.name.toLowerCase()) && s.status === "active"
                        );
                        return filtered.length > 0 ? (
                          <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-lg mt-1 max-h-40 overflow-y-auto z-20 shadow-lg">
                            {filtered.map((s: any) => (
                              <button
                                key={s.id}
                                type="button"
                                onMouseDown={() => {
                                  handleUpdateService(service.id, "name", s.name);
                                  handleUpdateService(service.id, "price", parseFloat(s.price) || 0);
                                  handleUpdateService(service.id, "details", s.description || "");
                                  setServiceDropdownOpen(prev => ({ ...prev, [service.id]: false }));
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-accent/10 text-foreground border-b border-border/30 last:border-b-0"
                              >
                                <div className="text-sm font-medium">{s.name}</div>
                                <div className="text-xs text-muted-foreground">R$ {parseFloat(s.price).toFixed(2)}{s.description ? ` · ${s.description.substring(0, 40)}` : ""}</div>
                              </button>
                            ))}
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <div className="col-span-12 md:col-span-3">
                      <Input
                        type="text"
                        placeholder="Detalhes"
                        value={service.details}
                        onChange={(e) => handleUpdateService(service.id, "details", e.target.value)}
                        className="bg-background border-border text-sm"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-1">
                      <Input
                        type="number"
                        min="1"
                        value={service.quantity}
                        onChange={(e) => handleUpdateService(service.id, "quantity", parseInt(e.target.value) || 1)}
                        className="bg-background border-border text-center text-sm"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        value={service.price || ""}
                        onChange={(e) => handleUpdateService(service.id, "price", parseFloat(e.target.value) || 0)}
                        className="bg-background border-border text-right text-sm"
                      />
                    </div>
                    <div className="col-span-3 md:col-span-2 flex gap-1">
                      <Select
                        value={service.discountType}
                        onValueChange={(v) => handleUpdateService(service.id, "discountType", v)}
                      >
                        <SelectTrigger className="w-14 bg-background border-border text-xs px-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">%</SelectItem>
                          <SelectItem value="fixed">R$</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={service.discount || ""}
                        onChange={(e) => handleUpdateService(service.id, "discount", parseFloat(e.target.value) || 0)}
                        className="bg-background border-border text-right text-sm"
                      />
                    </div>
                    <div className="col-span-10 md:col-span-1 text-right">
                      <span className="text-sm font-bold text-accent">
                        R$ {calcSubtotal(service).toFixed(2)}
                      </span>
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveService(service.id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddServiceRow}
                  className="w-full border-dashed border-border/50 text-muted-foreground hover:text-foreground gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Serviço
                </Button>

                {osServices.length > 0 && (
                  <div className="flex justify-end pt-2 border-t border-border/30">
                    <p className="text-sm text-muted-foreground">
                      Total Serviços: <span className="text-accent font-bold text-base ml-2">R$ {totalServices.toFixed(2)}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* PRODUTOS */}
          <Card className="card-float p-6">
            <SectionHeader title="Produtos" section="produtos" />
            {expandedSections.produtos && (
              <div className="space-y-3">
                {/* Cabeçalho da tabela */}
                <div className="hidden md:grid grid-cols-12 gap-2 px-2 text-xs text-muted-foreground font-medium uppercase tracking-wide">
                  <div className="col-span-3">Produto</div>
                  <div className="col-span-3">Detalhes</div>
                  <div className="col-span-1 text-center">Qtd</div>
                  <div className="col-span-2 text-right">Valor (R$)</div>
                  <div className="col-span-2 text-right">Desc</div>
                  <div className="col-span-1 text-right">Subtotal</div>
                  <div className="col-span-1"></div>
                </div>

                {osProducts.map((product) => (
                  <div key={product.id} className="grid grid-cols-12 gap-2 items-center p-2 bg-background/50 rounded-lg border border-border/30">
                    <div className="col-span-12 md:col-span-3 relative">
                      <Input
                        type="text"
                        placeholder="Nome do produto"
                        value={product.name}
                        onChange={(e) => {
                          handleUpdateProduct(product.id, "name", e.target.value);
                          setProductDropdownOpen(prev => ({ ...prev, [product.id]: true }));
                        }}
                        onFocus={() => setProductDropdownOpen(prev => ({ ...prev, [product.id]: true }))}
                        onBlur={() => setTimeout(() => setProductDropdownOpen(prev => ({ ...prev, [product.id]: false })), 150)}
                        className="bg-background border-border text-sm"
                        autoComplete="off"
                      />
                      {productDropdownOpen[product.id] && product.name && (() => {
                        const filtered = (products as any[]).filter((p: any) =>
                          p.name?.toLowerCase().includes(product.name.toLowerCase())
                        );
                        return filtered.length > 0 ? (
                          <div className="absolute top-full left-0 right-0 bg-background border border-border rounded-lg mt-1 max-h-40 overflow-y-auto z-20 shadow-lg">
                            {filtered.map((p: any) => (
                              <button
                                key={p.id}
                                type="button"
                                onMouseDown={() => {
                                  handleUpdateProduct(product.id, "name", p.name);
                                  handleUpdateProduct(product.id, "price", parseFloat(p.price) || 0);
                                  handleUpdateProduct(product.id, "details", p.description || "");
                                  setProductDropdownOpen(prev => ({ ...prev, [product.id]: false }));
                                }}
                                className="w-full text-left px-3 py-2 hover:bg-accent/10 text-foreground border-b border-border/30 last:border-b-0"
                              >
                                <div className="text-sm font-medium">{p.name}</div>
                                <div className="text-xs text-muted-foreground">R$ {parseFloat(p.price).toFixed(2)}{p.description ? ` · ${p.description.substring(0, 40)}` : ""}{p.stock != null ? ` · Estoque: ${p.stock}` : ""}</div>
                              </button>
                            ))}
                          </div>
                        ) : null;
                      })()}
                    </div>
                    <div className="col-span-12 md:col-span-3">
                      <Input
                        type="text"
                        placeholder="Detalhes"
                        value={product.details}
                        onChange={(e) => handleUpdateProduct(product.id, "details", e.target.value)}
                        className="bg-background border-border text-sm"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-1">
                      <Input
                        type="number"
                        min="1"
                        value={product.quantity}
                        onChange={(e) => handleUpdateProduct(product.id, "quantity", parseInt(e.target.value) || 1)}
                        className="bg-background border-border text-center text-sm"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        value={product.price || ""}
                        onChange={(e) => handleUpdateProduct(product.id, "price", parseFloat(e.target.value) || 0)}
                        className="bg-background border-border text-right text-sm"
                      />
                    </div>
                    <div className="col-span-3 md:col-span-2 flex gap-1">
                      <Select
                        value={product.discountType}
                        onValueChange={(v) => handleUpdateProduct(product.id, "discountType", v)}
                      >
                        <SelectTrigger className="w-14 bg-background border-border text-xs px-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="percent">%</SelectItem>
                          <SelectItem value="fixed">R$</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        value={product.discount || ""}
                        onChange={(e) => handleUpdateProduct(product.id, "discount", parseFloat(e.target.value) || 0)}
                        className="bg-background border-border text-right text-sm"
                      />
                    </div>
                    <div className="col-span-10 md:col-span-1 text-right">
                      <span className="text-sm font-bold text-accent">
                        R$ {calcSubtotal(product).toFixed(2)}
                      </span>
                    </div>
                    <div className="col-span-2 md:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleRemoveProduct(product.id)}
                        className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddProductRow}
                  className="w-full border-dashed border-border/50 text-muted-foreground hover:text-foreground gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Adicionar Produto
                </Button>

                {osProducts.length > 0 && (
                  <div className="flex justify-end pt-2 border-t border-border/30">
                    <p className="text-sm text-muted-foreground">
                      Total Produtos: <span className="text-accent font-bold text-base ml-2">R$ {totalProducts.toFixed(2)}</span>
                    </p>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* RESUMO FINANCEIRO */}
          <Card className="card-float p-6 bg-accent/5 border-accent/30">
            <SectionHeader title="Resumo Financeiro" section="resumo" />
            {expandedSections.resumo && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-foreground text-sm">Mão de Obra (R$)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.laborCost}
                      onChange={(e) => handleChange("laborCost", e.target.value)}
                      className="mt-1 bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground text-sm">Frete (R$)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.shippingCost}
                      onChange={(e) => handleChange("shippingCost", e.target.value)}
                      className="mt-1 bg-background border-border"
                    />
                  </div>
                  <div>
                    <Label className="text-foreground text-sm">Outros (R$)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0,00"
                      value={formData.otherCosts}
                      onChange={(e) => handleChange("otherCosts", e.target.value)}
                      className="mt-1 bg-background border-border"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-foreground text-sm">Desconto</Label>
                    <div className="flex gap-2 mt-1">
                      <Select value={discountType} onValueChange={(v) => setDiscountType(v as 'percent' | 'fixed')}>
                        <SelectTrigger className="w-28 bg-background border-border">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fixed">R$ (fixo)</SelectItem>
                          <SelectItem value="percent">% (percentual)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        placeholder="0,00"
                        value={formData.discount}
                        onChange={(e) => handleChange("discount", e.target.value)}
                        className="bg-background border-border"
                      />
                    </div>
                    {discountType === 'percent' && parseFloat(formData.discount) > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        = R$ {discountNum.toFixed(2)} de desconto sobre o subtotal
                      </p>
                    )}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-accent/20">
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Serviços</p>
                    <p className="text-xl font-bold text-accent">R$ {totalServices.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Produtos</p>
                    <p className="text-xl font-bold text-accent">R$ {totalProducts.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Subtotal</p>
                    <p className="text-xl font-bold text-foreground">R$ {subtotalGeral.toFixed(2)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                    <p className="text-2xl font-bold text-accent">R$ {totalGeral.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            )}
          </Card>

          {/* OBSERVAÇÕES */}
          <Card className="card-float p-6">
            <SectionHeader title="Observações" section="observacoes" />
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
                <><Loader2 className="w-4 h-4 animate-spin" />Salvando...</>
              ) : (
                <><Save className="w-4 h-4" />Salvar Ordem</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
}
