import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Layout from "@/components/Layout";
import { useLocation } from "wouter";
import { useState, useEffect } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";

/**
 * ProductForm - Formulário de cadastro/edição de Produto
 * Design: Dark Tech Professional com campos organizados
 * Integrações: tRPC (salvar no banco), geração de código de barras, seleção de fornecedor
 */
export default function ProductForm() {
  const [location, navigate] = useLocation();
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [productId, setProductId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    sku: "",
    category: "",
    description: "",
    unit: "UN",
    price: "",
    stock: "",
    minStock: "",
    supplierId: "",
    supplierCode: "",
    notes: "",
  });

  // Extrair ID da URL (ex: /products/edit/1)
  useEffect(() => {
    const pathParts = location.split("/");
    const id = pathParts[pathParts.length - 1];
    
    if (id && id !== "new" && !isNaN(Number(id))) {
      setIsEditing(true);
      setProductId(Number(id));
    }
  }, [location]);

  // Query para carregar dados do produto (se editando)
  const { data: productData, isLoading: isLoadingProduct } = trpc.products.get.useQuery(
    productId!,
    { enabled: isEditing && productId !== null }
  );

  // Query para carregar fornecedores
  const { data: suppliers = [] } = trpc.suppliers.list.useQuery();

  // Preencher formulário com dados do produto quando carregar
  useEffect(() => {
    if (productData) {
      setFormData({
        name: productData.name || "",
        sku: productData.sku || "",
        category: productData.category || "",
        description: productData.description || "",
        unit: productData.unit || "UN",
        price: productData.price?.toString() || "",
        stock: productData.stock?.toString() || "",
        minStock: productData.minStock?.toString() || "",
        supplierId: productData.supplier || "",
        supplierCode: productData.supplierCode || "",
        notes: productData.notes || "",
      });
    }
  }, [productData]);

  // Mutation para criar produto
  const createProductMutation = trpc.products.create.useMutation({
    onSuccess: () => {
      toast.success("Produto salvo com sucesso!");
      navigate("/products");
    },
    onError: (error) => {
      toast.error(`Erro ao salvar produto: ${error.message}`);
    },
  });

  // Mutation para atualizar produto
  const updateProductMutation = trpc.products.update.useMutation({
    onSuccess: () => {
      toast.success("Produto atualizado com sucesso!");
      navigate("/products");
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar produto: ${error.message}`);
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
   * Gera um código de barras aleatório (EAN-13)
   */
  const generateBarcode = () => {
    // Gerar 12 dígitos aleatórios
    let barcode = "";
    for (let i = 0; i < 12; i++) {
      barcode += Math.floor(Math.random() * 10);
    }
    
    // Calcular dígito verificador
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(barcode[i]) * (i % 2 === 0 ? 1 : 3);
    }
    const checkDigit = (10 - (sum % 10)) % 10;
    barcode += checkDigit;
    
    // Formatar como EAN-13
    const formattedBarcode = barcode.slice(0, 1) + barcode.slice(1, 7) + barcode.slice(7);
    
    setFormData((prev) => ({
      ...prev,
      sku: formattedBarcode,
    }));
    
    toast.success("Código de barras gerado!");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validar campos obrigatórios
    if (!formData.name || !formData.price) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    const productPayload = {
      name: formData.name,
      sku: formData.sku,
      category: formData.category,
      description: formData.description,
      unit: formData.unit,
      price: formData.price,
      stock: formData.stock ? parseInt(formData.stock) : 0,
      minStock: formData.minStock ? parseInt(formData.minStock) : 0,
      supplier: formData.supplierId,
      supplierCode: formData.supplierCode,
      notes: formData.notes,
    };

    if (isEditing && productId) {
      // Atualizar produto existente
      updateProductMutation.mutate({
        id: productId,
        data: productPayload,
      });
    } else {
      // Criar novo produto
      createProductMutation.mutate(productPayload);
    }
  };

  const isSubmitting = loading || createProductMutation.isPending || updateProductMutation.isPending || isLoadingProduct;
  const pageTitle = isEditing ? "Editar Produto" : "Novo Produto";
  const pageDescription = isEditing 
    ? "Atualize os dados do produto abaixo" 
    : "Preencha os campos abaixo para criar um novo produto";

  const categorias = [
    "Periféricos",
    "Armazenamento",
    "Memória",
    "Baterias",
    "Cabos",
    "Acessórios",
    "Componentes",
    "Outro",
  ];

  const unidades = ["UN", "KG", "M", "CX", "LOTE"];

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

        {isLoadingProduct ? (
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
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Nome do produto"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Código de Barras (SKU)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      name="sku"
                      value={formData.sku}
                      onChange={handleChange}
                      placeholder="Código de barras"
                      className="flex-1 px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                    />
                    <Button
                      type="button"
                      onClick={generateBarcode}
                      variant="outline"
                      size="sm"
                      title="Gerar código de barras aleatório"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
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
                    <option value="">Selecione uma categoria</option>
                    {categorias.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Descrição do produto"
                    rows={3}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </Card>

            {/* Preço e Estoque */}
            <Card className="card-float p-8 mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Preço e Estoque
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Unidade
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  >
                    {unidades.map((unit) => (
                      <option key={unit} value={unit}>
                        {unit}
                      </option>
                    ))}
                  </select>
                </div>
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
                    Estoque Atual
                  </label>
                  <input
                    type="number"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Estoque Mínimo
                  </label>
                  <input
                    type="number"
                    name="minStock"
                    value={formData.minStock}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  />
                </div>
              </div>
            </Card>

            {/* Fornecedor */}
            <Card className="card-float p-8 mb-6">
              <h2 className="text-2xl font-bold text-foreground mb-6">
                Informações do Fornecedor
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Fornecedor
                  </label>
                  <select
                    name="supplierId"
                    value={formData.supplierId}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                  >
                    <option value="">Selecione um fornecedor</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.name}>
                        {supplier.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Código do Fornecedor
                  </label>
                  <input
                    type="text"
                    name="supplierCode"
                    value={formData.supplierCode}
                    onChange={handleChange}
                    placeholder="Código do fornecedor"
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
                placeholder="Observações gerais sobre o produto"
                rows={5}
                className="w-full px-4 py-3 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
              />
            </Card>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                type="button"
                onClick={() => navigate("/products")}
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
                  isEditing ? "Atualizar Produto" : "Salvar Produto"
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Layout>
  );
}
