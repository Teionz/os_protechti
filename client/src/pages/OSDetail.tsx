import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Edit, Printer, Download, Loader2 } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { useRef } from "react";

/**
 * OSDetail - Visualização detalhada de uma Ordem de Serviço
 * Design: Dark Tech Professional com layout de impressão
 */
export default function OSDetail() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/os/:id");
  const osId = params?.id ? parseInt(params.id) : null;
  const printRef = useRef<HTMLDivElement>(null);

  // Buscar dados da OS do banco
  const { data: ordem, isLoading, error } = trpc.orders.get.useQuery(osId!, {
    enabled: !!osId,
  });

  // Buscar itens da OS
  const { data: orderItems = [] } = trpc.orderItems.getByOrderId.useQuery(osId!, {
    enabled: !!osId,
  });

  // Se não encontrou a OS
  if (!match) {
    return (
      <Layout>
        <div className="container py-8 max-w-4xl">
          <p className="text-red-500">OS não encontrada</p>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container py-8 max-w-4xl flex items-center justify-center min-h-96">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
          <span className="ml-2 text-foreground">Carregando...</span>
        </div>
      </Layout>
    );
  }

  if (error || !ordem) {
    return (
      <Layout>
        <div className="container py-8 max-w-4xl">
          <p className="text-red-500">Erro ao carregar OS: {error?.message || "OS não encontrada"}</p>
        </div>
      </Layout>
    );
  }

  // Formatar dados para exibição
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "-";
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR");
  };

  const formatDateTime = (date: Date | string | null | undefined) => {
    if (!date) return "-";
    const d = new Date(date);
    return `${d.toLocaleDateString("pt-BR")} - ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const handlePrint = () => {
    const element = document.querySelector('[class*="container"]');
    if (!element) {
      alert('Conteúdo não encontrado para impressão');
      return;
    }
    const printWindow = window.open("", "", "height=600,width=800");
    if (!printWindow) return;
    printWindow.document.write("<html><head><title>OS #" + ordem?.id + "</title>");
    printWindow.document.write(`<style>
      body { font-family: Arial, sans-serif; margin: 20px; background: white; color: black; }
      h1, h2 { color: #333; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
    </style>`);
    printWindow.document.write("</head><body>");
    printWindow.document.write(element.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.querySelector('[class*="container"]');
    if (!element) {
      alert('Conteúdo não encontrado para PDF');
      return;
    }
    try {
      const html2pdf = (await import("html2pdf.js")).default;
      const opt = {
        margin: 10,
        filename: `OS_${ordem?.id}.pdf`,
        image: { type: "png" as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { orientation: "portrait" as const, unit: "mm", format: "a4" },
      };
      (html2pdf() as any).set(opt).from(element).save();
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    }
  };

  // Separar serviços e produtos
  const servicos = orderItems.filter((item) => item.type === "service");
  const produtos = orderItems.filter((item) => item.type === "product");

  // Calcular totais
  const toNumber = (val: any) => {
    if (typeof val === 'string') return parseFloat(val);
    return val || 0;
  };
  
  const totalServicos = servicos.reduce((sum, item) => sum + toNumber(item.total), 0);
  const totalProdutos = produtos.reduce((sum, item) => sum + toNumber(item.total), 0);
  const subtotal = totalServicos + totalProdutos;
  const total = subtotal + toNumber(ordem.laborCost) + toNumber(ordem.shippingCost) + toNumber(ordem.otherCosts) - toNumber(ordem.discount);

  return (
    <Layout>
      <div className="container py-8 max-w-4xl" ref={printRef}>
        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Ordem de Serviço #{ordem.id}
            </h1>
            <p className="text-muted-foreground">Visualize e gerencie os detalhes da OS</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(`/os/edit/${ordem.id}`)}
              variant="outline"
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar
            </Button>
            <Button onClick={handlePrint} className="btn-glow gap-2">
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${
              ordem.status === "completed" ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" :
              ordem.status === "in_progress" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
              ordem.status === "budgeting" ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" :
              "bg-gray-500/20 text-gray-400 border-gray-500/30"
            }`}>
              {ordem.status === "completed" ? "Concluído" :
               ordem.status === "in_progress" ? "Em Andamento" :
               ordem.status === "budgeting" ? "Orçando" :
               ordem.status === "awaiting_approval" ? "Aguardando Aprovação" :
               ordem.status === "awaiting_pickup" ? "Aguardando Retirada" :
               ordem.status}
            </span>
          </div>
          <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Baixar PDF
          </Button>
        </div>
        {/* Cabeçalho */}
        <Card className="card-float p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Número da OS</h3>
              <p className="text-3xl font-bold text-accent">{ordem.id}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Data de Emissão</h3>
              <p className="text-2xl font-semibold text-foreground">{formatDate(ordem.createdAt)}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border">
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Entrada</h3>
              <p className="text-foreground">{formatDateTime(ordem.createdAt)}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Saída</h3>
              <p className="text-foreground">{ordem.updatedAt ? formatDateTime(ordem.updatedAt) : "-"}</p>
            </div>
          </div>
        </Card>

        {/* Dados do Cliente */}
        {ordem.client && (
          <Card className="card-float p-8 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Dados do Cliente</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm text-muted-foreground mb-2">Nome/Razão Social</h3>
                <p className="text-foreground font-semibold">{ordem.client.name}</p>
              </div>
              <div>
                <h3 className="text-sm text-muted-foreground mb-2">CNPJ/CPF</h3>
                <p className="text-foreground">{ordem.client.cnpjCpf || "-"}</p>
              </div>
              <div>
                <h3 className="text-sm text-muted-foreground mb-2">Telefone</h3>
                <p className="text-foreground">{ordem.client.phone || "-"}</p>
              </div>
              <div>
                <h3 className="text-sm text-muted-foreground mb-2">E-mail</h3>
                <p className="text-foreground">{ordem.client.email || "-"}</p>
              </div>
              <div className="md:col-span-2">
                <h3 className="text-sm text-muted-foreground mb-2">Endereço</h3>
                <p className="text-foreground">
                  {ordem.client.street} {ordem.client.number}, {ordem.client.neighborhood}, {ordem.client.zipCode}
                </p>
                <p className="text-foreground">
                  {ordem.client.city} - {ordem.client.state}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Equipamento */}
        <Card className="card-float p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Equipamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Nome</h3>
              <p className="text-foreground font-semibold">{ordem.equipmentName}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Marca</h3>
              <p className="text-foreground">{ordem.equipmentBrand || "-"}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Modelo</h3>
              <p className="text-foreground">{ordem.equipmentModel || "-"}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Série</h3>
              <p className="text-foreground">{ordem.equipmentSerial || "-"}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Etiqueta de Controle</h3>
              <p className="text-foreground">{ordem.equipmentTag || "-"}</p>
            </div>
          </div>
          {ordem.equipmentCondition && (
            <div className="pt-6 border-t border-border">
              <h3 className="text-sm text-muted-foreground mb-2">Condição do Equipamento</h3>
              <p className="text-foreground whitespace-pre-wrap">{ordem.equipmentCondition}</p>
            </div>
          )}
          {ordem.reportedDefects && (
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-sm text-muted-foreground mb-2">Defeitos Relatados</h3>
              <p className="text-foreground whitespace-pre-wrap">{ordem.reportedDefects}</p>
            </div>
          )}
          {ordem.proposedSolution && (
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-sm text-muted-foreground mb-2">Solução Proposta</h3>
              <p className="text-foreground whitespace-pre-wrap">{ordem.proposedSolution}</p>
            </div>
          )}
          {ordem.technicalReport && (
            <div className="mt-4 pt-4 border-t border-border">
              <h3 className="text-sm text-muted-foreground mb-2">Laudo Técnico</h3>
              <p className="text-foreground whitespace-pre-wrap">{ordem.technicalReport}</p>
            </div>
          )}
        </Card>

        {/* Serviços */}
        {servicos.length > 0 && (
          <Card className="card-float p-8 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Serviços</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-semibold text-foreground">Nome</th>
                    <th className="text-left py-3 text-sm font-semibold text-foreground">Detalhes</th>
                    <th className="text-right py-3 text-sm font-semibold text-foreground">Quantidade</th>
                    <th className="text-right py-3 text-sm font-semibold text-foreground">Valor Unitário</th>
                    <th className="text-right py-3 text-sm font-semibold text-foreground">Desconto (%)</th>
                    <th className="text-right py-3 text-sm font-semibold text-foreground">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {servicos.map((servico) => (
                    <tr key={servico.id} className="border-b border-border/50">
                    <td className="py-3 text-foreground">{servico.description}</td>
                    <td className="py-3 text-foreground text-sm">{servico.details || "-"}</td>
                    <td className="text-right py-3 text-foreground">{servico.quantity}</td>
                    <td className="text-right py-3 text-foreground">
                        R$ {toNumber(servico.unitPrice).toFixed(2)}
                      </td>
                      <td className="text-right py-3 text-foreground">{toNumber(servico.discount)}%</td>
                      <td className="text-right py-3 text-accent font-semibold">
                        R$ {toNumber(servico.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-right text-foreground font-semibold">
                Total: <span className="text-accent">R$ {totalServicos.toFixed(2)}</span>
              </p>
            </div>
          </Card>
        )}

        {/* Produtos */}
        {produtos.length > 0 && (
          <Card className="card-float p-8 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Produtos</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 text-sm font-semibold text-foreground">Nome</th>
                    <th className="text-left py-3 text-sm font-semibold text-foreground">Detalhes</th>
                    <th className="text-right py-3 text-sm font-semibold text-foreground">Quantidade</th>
                    <th className="text-right py-3 text-sm font-semibold text-foreground">Valor Unitário</th>
                    <th className="text-right py-3 text-sm font-semibold text-foreground">Desconto (%)</th>
                    <th className="text-right py-3 text-sm font-semibold text-foreground">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((produto) => (
                    <tr key={produto.id} className="border-b border-border/50">
                    <td className="py-3 text-foreground">{produto.description}</td>
                    <td className="py-3 text-foreground text-sm">{produto.details || "-"}</td>
                    <td className="text-right py-3 text-foreground">{produto.quantity}</td>
                    <td className="text-right py-3 text-foreground">
                        R$ {toNumber(produto.unitPrice).toFixed(2)}
                      </td>
                      <td className="text-right py-3 text-foreground">{toNumber(produto.discount)}%</td>
                      <td className="text-right py-3 text-accent font-semibold">
                        R$ {toNumber(produto.total).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-right text-foreground font-semibold">
                Total: <span className="text-accent">R$ {totalProdutos.toFixed(2)}</span>
              </p>
            </div>
          </Card>
        )}

        {/* Resumo Financeiro */}
        <Card className="card-float p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Resumo Financeiro</h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-foreground">Serviços</span>
              <span className="text-foreground font-semibold">R$ {totalServicos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-foreground">Produtos</span>
              <span className="text-foreground font-semibold">R$ {totalProdutos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-foreground">Mão de Obra</span>
              <span className="text-foreground font-semibold">R$ {toNumber(ordem.laborCost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-foreground">Frete</span>
              <span className="text-foreground font-semibold">R$ {toNumber(ordem.shippingCost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-foreground">Outros</span>
              <span className="text-foreground font-semibold">R$ {toNumber(ordem.otherCosts).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-foreground">Subtotal</span>
              <span className="text-foreground font-semibold">R$ {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/30">
              <span className="text-foreground">Desconto</span>
              <span className="text-red-400 font-semibold">-R$ {toNumber(ordem.discount).toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center py-3 bg-accent/10 px-4 rounded-lg border border-accent/20">
              <span className="text-foreground font-bold">Total</span>
              <span className="text-accent font-bold text-2xl">R$ {total.toFixed(2)}</span>
            </div>
          </div>
        </Card>

        {/* Observações */}
        {(ordem.publicNotes || ordem.internalNotes) && (
          <Card className="card-float p-8 mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-6">Observações</h2>
            {ordem.publicNotes && (
              <div className="mb-6">
                <h3 className="text-sm text-muted-foreground mb-2">Observações Públicas</h3>
                <p className="text-foreground whitespace-pre-wrap">{ordem.publicNotes}</p>
              </div>
            )}
            {ordem.internalNotes && (
              <div>
                <h3 className="text-sm text-muted-foreground mb-2">Observações Internas</h3>
                <p className="text-foreground whitespace-pre-wrap">{ordem.internalNotes}</p>
              </div>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
}