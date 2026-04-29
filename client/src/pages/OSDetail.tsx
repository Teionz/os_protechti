import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Edit, Printer, Download, Loader2 } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";

/**
 * OSDetail - Visualização detalhada de uma Ordem de Serviço
 * Design: Dark Tech Professional com layout de impressão
 */
export default function OSDetail() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/os/:id");
  const osId = params?.id ? parseInt(params.id) : null;

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
    const element = document.getElementById("os-print-content");
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
      .section { margin-bottom: 20px; }
      .section-title { font-weight: bold; font-size: 14px; margin-bottom: 10px; }
    </style>`);
    printWindow.document.write("</head><body>");
    printWindow.document.write(element.innerHTML);
    printWindow.document.write("</body></html>");
    printWindow.document.close();
    printWindow.print();
  };

  const handleDownloadPDF = async () => {
    const element = document.getElementById("os-print-content");
    if (!element) {
      alert('Conteúdo não encontrado para PDF');
      return;
    }
    
    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;
      
      // Usar setTimeout para não congelar a UI
      setTimeout(async () => {
        try {
          const canvas = await html2canvas(element, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
          });
          
          const imgData = canvas.toDataURL('image/png');
          const pdf = new jsPDF({
            orientation: 'portrait',
            unit: 'mm',
            format: 'a4',
          });
          
          const imgWidth = 190;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;
          let heightLeft = imgHeight;
          let position = 0;
          
          pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
          heightLeft -= 277;
          
          while (heightLeft >= 0) {
            position = heightLeft - imgHeight;
            pdf.addPage();
            pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
            heightLeft -= 277;
          }
          
          pdf.save(`OS_${ordem?.id}.pdf`);
        } catch (canvasError) {
          console.error("Erro ao processar canvas:", canvasError);
          alert("Erro ao processar conteúdo para PDF.");
        }
      }, 100);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF. Tente novamente.");
    }
  };

  // Separar serviços e produtos
  const servicos = orderItems.filter((item) => item.type === "service");
  const produtos = orderItems.filter((item) => item.type === "product");

  // Calcular totais
  const totalServicos = servicos.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const totalProdutos = produtos.reduce((sum, item) => sum + (Number(item.total) || 0), 0);
  const subtotal = totalServicos + totalProdutos + (Number(ordem.laborCost) || 0) + (Number(ordem.shippingCost) || 0) + (Number(ordem.otherCosts) || 0);
  const total = subtotal - (Number(ordem.discount) || 0);

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* Cabeçalho com botões */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-foreground">OS #{ordem.id}</h1>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition"
            >
              <Printer className="w-4 h-4" />
              Imprimir
            </button>
            <button
              onClick={handleDownloadPDF}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition"
            >
              <Download className="w-4 h-4" />
              Baixar PDF
            </button>
            <button
              onClick={() => navigate(`/os/${osId}/edit`)}
              className="flex items-center gap-2 px-4 py-2 bg-accent text-accent-foreground rounded-lg hover:bg-accent/90 transition"
            >
              <Edit className="w-4 h-4" />
              Editar
            </button>
          </div>
        </div>

        {/* Conteúdo para impressão/PDF */}
        <div id="os-print-content" className="space-y-6">
          {/* Status */}
          <Card className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="text-foreground font-semibold">{ordem.status || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Prioridade</p>
                <p className="text-foreground font-semibold">{ordem.priority || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Data de Criação</p>
                <p className="text-foreground font-semibold">{formatDate(ordem.createdAt)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Origem</p>
                <p className="text-foreground font-semibold">{ordem.origin || "-"}</p>
              </div>
            </div>
          </Card>

          {/* Cliente */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Cliente</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="text-foreground font-semibold">{ordem.client?.name || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CNPJ/CPF</p>
                <p className="text-foreground font-semibold">{ordem.client?.cnpjCpf || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Telefone</p>
                <p className="text-foreground font-semibold">{ordem.client?.phone || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">E-mail</p>
                <p className="text-foreground font-semibold">{ordem.client?.email || "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Endereço</p>
                <p className="text-foreground font-semibold">
                  {ordem.client?.street ? `${ordem.client.street}, ${ordem.client.neighborhood} - ${ordem.client.city}` : "-"}
                </p>
              </div>
            </div>
          </Card>

          {/* Informações Adicionais */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Informações Adicionais</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Teclado Faltando</p>
                <p className="text-foreground font-semibold">{ordem.missingKeyboard ? "Sim" : "Não"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Tela Trincada</p>
                <p className="text-foreground font-semibold">{ordem.crackedScreen ? "Sim" : "Não"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Carregador</p>
                <p className="text-foreground font-semibold">{ordem.missingCharger === "yes" ? "Sim" : "Não"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Bolsa</p>
                <p className="text-foreground font-semibold">{ordem.missingBag === "yes" ? "Sim" : "Não"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ligando</p>
                <p className="text-foreground font-semibold">{ordem.poweringOn === "yes" ? "Sim" : "Não"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Cabo de Energia</p>
                <p className="text-foreground font-semibold">{ordem.missingPowerCable === "yes" ? "Sim" : "Não"}</p>
              </div>
            </div>
            {ordem.password && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Senha</p>
                <p className="text-foreground font-semibold">{ordem.password}</p>
              </div>
            )}
          </Card>

          {/* Equipamento */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Equipamento</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nome</p>
                <p className="text-foreground font-semibold">{ordem.equipmentName || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Série</p>
                <p className="text-foreground font-semibold">{ordem.equipmentSerial || "-"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Etiqueta</p>
                <p className="text-foreground font-semibold">{ordem.equipmentTag || "-"}</p>
              </div>
            </div>
            {ordem.reportedDefects && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Defeitos Relatados</p>
                <p className="text-foreground whitespace-pre-wrap">{ordem.reportedDefects}</p>
              </div>
            )}
            {ordem.proposedSolution && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Solução Proposta</p>
                <p className="text-foreground whitespace-pre-wrap">{ordem.proposedSolution}</p>
              </div>
            )}
            {ordem.technicalReport && (
              <div className="mt-4">
                <p className="text-sm text-muted-foreground">Laudo Técnico</p>
                <p className="text-foreground whitespace-pre-wrap">{ordem.technicalReport}</p>
              </div>
            )}
          </Card>

          {/* Serviços */}
          {servicos.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Serviços</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-sm font-semibold text-foreground">Serviço</th>
                    <th className="text-left py-2 px-2 text-sm font-semibold text-foreground">Detalhes</th>
                    <th className="text-right py-2 px-2 text-sm font-semibold text-foreground">Qtd</th>
                    <th className="text-right py-2 px-2 text-sm font-semibold text-foreground">Valor</th>
                    <th className="text-right py-2 px-2 text-sm font-semibold text-foreground">Desc %</th>
                    <th className="text-right py-2 px-2 text-sm font-semibold text-foreground">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {servicos.map((item, idx) => (
                    <tr key={idx} className="border-b border-border">
                      <td className="py-2 px-2 text-foreground">{item.description}</td>
                      <td className="py-2 px-2 text-foreground">{item.details || "-"}</td>
                      <td className="text-right py-2 px-2 text-foreground">{item.quantity}</td>
                      <td className="text-right py-2 px-2 text-foreground">R$ {Number(item.unitPrice || 0).toFixed(2)}</td>
                      <td className="text-right py-2 px-2 text-foreground">{Number(item.discount || 0).toFixed(0)}%</td>
                      <td className="text-right py-2 px-2 text-foreground font-semibold">R$ {Number(item.total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-right">
                <p className="text-foreground font-semibold">Total Serviços: R$ {totalServicos.toFixed(2)}</p>
              </div>
            </Card>
          )}

          {/* Produtos */}
          {produtos.length > 0 && (
            <Card className="p-6">
              <h2 className="text-xl font-bold text-foreground mb-4">Produtos</h2>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-2 text-sm font-semibold text-foreground">Produto</th>
                    <th className="text-left py-2 px-2 text-sm font-semibold text-foreground">Detalhes</th>
                    <th className="text-right py-2 px-2 text-sm font-semibold text-foreground">Qtd</th>
                    <th className="text-right py-2 px-2 text-sm font-semibold text-foreground">Valor</th>
                    <th className="text-right py-2 px-2 text-sm font-semibold text-foreground">Desc %</th>
                    <th className="text-right py-2 px-2 text-sm font-semibold text-foreground">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((item, idx) => (
                    <tr key={idx} className="border-b border-border">
                      <td className="py-2 px-2 text-foreground">{item.description}</td>
                      <td className="py-2 px-2 text-foreground">{item.details || "-"}</td>
                      <td className="text-right py-2 px-2 text-foreground">{item.quantity}</td>
                      <td className="text-right py-2 px-2 text-foreground">R$ {Number(item.unitPrice || 0).toFixed(2)}</td>
                      <td className="text-right py-2 px-2 text-foreground">{Number(item.discount || 0).toFixed(0)}%</td>
                      <td className="text-right py-2 px-2 text-foreground font-semibold">R$ {Number(item.total || 0).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="mt-4 text-right">
                <p className="text-foreground font-semibold">Total Produtos: R$ {totalProdutos.toFixed(2)}</p>
              </div>
            </Card>
          )}

          {/* Resumo Financeiro */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Resumo Financeiro</h2>
            <div className="space-y-2 text-right">
              <div className="flex justify-between">
                <span className="text-foreground">Serviços:</span>
                <span className="text-foreground">R$ {totalServicos.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground">Produtos:</span>
                <span className="text-foreground">R$ {totalProdutos.toFixed(2)}</span>
              </div>
              {Number(ordem.laborCost) > 0 && (
                <div className="flex justify-between">
                  <span className="text-foreground">Mão de Obra:</span>
                  <span className="text-foreground">R$ {Number(ordem.laborCost).toFixed(2)}</span>
                </div>
              )}
              {Number(ordem.shippingCost) > 0 && (
                <div className="flex justify-between">
                  <span className="text-foreground">Frete:</span>
                  <span className="text-foreground">R$ {Number(ordem.shippingCost).toFixed(2)}</span>
                </div>
              )}
              {Number(ordem.otherCosts) > 0 && (
                <div className="flex justify-between">
                  <span className="text-foreground">Outros:</span>
                  <span className="text-foreground">R$ {Number(ordem.otherCosts).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-foreground">Subtotal:</span>
                  <span className="text-foreground">R$ {subtotal.toFixed(2)}</span>
                </div>
              </div>
              {Number(ordem.discount) > 0 && (
                <div className="flex justify-between text-red-500">
                  <span>Desconto:</span>
                  <span>-R$ {Number(ordem.discount).toFixed(2)}</span>
                </div>
              )}
              <div className="border-t border-border pt-2 mt-2 flex justify-between text-lg font-bold text-accent">
                <span>Total:</span>
                <span>R$ {total.toFixed(2)}</span>
              </div>
            </div>
          </Card>

          {/* Observações */}
          <Card className="p-6">
            <h2 className="text-xl font-bold text-foreground mb-4">Observações</h2>
            {ordem.publicNotes && (
              <div>
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
            {!ordem.publicNotes && !ordem.internalNotes && (
              <p className="text-muted-foreground">Nenhuma observação registrada</p>
            )}
          </Card>
        </div>
      </div>
    </Layout>
  );
}
