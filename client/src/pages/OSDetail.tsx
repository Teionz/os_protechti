import { Edit, Printer, Download, Loader2 } from "lucide-react";
import { useLocation, useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";

/**
 * OSDetail - Visualização detalhada de uma Ordem de Serviço
 * Design: Layout branco com separações em linhas pretas para impressão
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

  const formatCurrency = (value: string | number | null | undefined) => {
    if (!value) return "R$ 0,00";
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(num);
  };

  const handlePrint = () => {
    const element = document.getElementById("os-print-content");
    if (!element) {
      alert("Conteúdo não encontrado para impressão");
      return;
    }
    const printWindow = window.open("", "", "height=600,width=800");
    if (!printWindow) return;
    printWindow.document.write("<html><head><title>OS #" + ordem?.id + "</title>");
    printWindow.document.write(`<style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { font-family: Arial, sans-serif; background: white; color: black; padding: 20px; }
      h1 { font-size: 24px; margin-bottom: 20px; border-bottom: 2px solid black; padding-bottom: 10px; }
      h2 { font-size: 16px; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid black; padding-bottom: 8px; }
      .section { margin-bottom: 20px; }
      .row { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 10px; }
      .row.full { grid-template-columns: 1fr; }
      .field { }
      .label { font-weight: bold; font-size: 12px; color: #666; margin-bottom: 4px; }
      .value { font-size: 14px; color: black; }
      table { width: 100%; border-collapse: collapse; margin: 15px 0; }
      th { background-color: white; border: 1px solid black; padding: 10px; text-align: left; font-weight: bold; font-size: 12px; }
      td { border: 1px solid black; padding: 10px; font-size: 12px; }
      .total-row { font-weight: bold; background-color: #f5f5f5; }
      .summary { margin-top: 20px; border-top: 2px solid black; padding-top: 15px; }
      .summary-row { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; margin-bottom: 10px; }
      .summary-label { font-weight: bold; }
      .summary-value { text-align: right; }
      @media print { body { padding: 0; } }
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
      alert("Conteúdo não encontrado para PDF");
      return;
    }

    try {
      const { jsPDF } = await import("jspdf");
      const html2canvas = (await import("html2canvas")).default;

      setTimeout(async () => {
        const canvas = await html2canvas(element, {
          backgroundColor: "#ffffff",
          scale: 2,
          logging: false,
        });

        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF({
          orientation: "portrait",
          unit: "mm",
          format: "a4",
        });

        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= 297;

        while (heightLeft >= 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= 297;
        }

        pdf.save(`OS_${ordem.id}.pdf`);
      }, 100);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Erro ao gerar PDF");
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

        {/* Conteúdo para impressão/PDF - Fundo branco */}
        <div id="os-print-content" className="bg-white text-black p-8 space-y-6 rounded-lg">
          {/* Cabeçalho da OS */}
          <div className="border-b-2 border-black pb-4">
            <h1 className="text-2xl font-bold">ORDEM DE SERVIÇO #{ordem.id}</h1>
            <p className="text-sm text-gray-700 mt-2">Data: {formatDate(ordem.createdAt)}</p>
          </div>

          {/* Status e Informações Gerais */}
          <div className="border-b border-black pb-4">
            <h2 className="text-lg font-bold mb-4">Informações Gerais</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-600">Status</p>
                <p className="text-sm font-semibold">{ordem.status || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600">Prioridade</p>
                <p className="text-sm font-semibold">{ordem.priority || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600">Origem</p>
                <p className="text-sm font-semibold">{ordem.origin || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600">Técnico</p>
                <p className="text-sm font-semibold">{ordem.technician || "-"}</p>
              </div>
            </div>
          </div>

          {/* Cliente */}
          <div className="border-b border-black pb-4">
            <h2 className="text-lg font-bold mb-4">Cliente</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-600">Nome</p>
                <p className="text-sm">{ordem.client?.name || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600">CNPJ/CPF</p>
                <p className="text-sm">{ordem.client?.cnpjCpf || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600">Telefone</p>
                <p className="text-sm">{ordem.client?.phone || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600">E-mail</p>
                <p className="text-sm">{ordem.client?.email || "-"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-xs font-bold text-gray-600">Endereço</p>
                <p className="text-sm">
                  {ordem.client?.street ? `${ordem.client.street}, ${ordem.client.neighborhood} - ${ordem.client.city}` : "-"}
                </p>
              </div>
            </div>
          </div>

          {/* Informações Adicionais */}
          <div className="border-b border-black pb-4">
            <h2 className="text-lg font-bold mb-4">Informações Adicionais</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-bold text-gray-600">Teclado Faltando</p>
                <p className="text-sm">{ordem.missingKeyboard === "yes" ? "Sim" : "Não"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600">Tela Trincada</p>
                <p className="text-sm">{ordem.crackedScreen === "yes" ? "Sim" : "Não"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600">Carregador</p>
                <p className="text-sm">{ordem.missingCharger === "yes" ? "Sim" : "Não"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600">Bolsa</p>
                <p className="text-sm">{ordem.missingBag === "yes" ? "Sim" : "Não"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600">Ligando</p>
                <p className="text-sm">{ordem.poweringOn === "yes" ? "Sim" : "Não"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600">Cabo de Energia</p>
                <p className="text-sm">{ordem.missingPowerCable === "yes" ? "Sim" : "Não"}</p>
              </div>
            </div>
            {ordem.password && (
              <div className="mt-4">
                <p className="text-xs font-bold text-gray-600">Senha</p>
                <p className="text-sm">{ordem.password}</p>
              </div>
            )}
          </div>

          {/* Equipamento */}
          <div className="border-b border-black pb-4">
            <h2 className="text-lg font-bold mb-4">Equipamento</h2>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p className="text-xs font-bold text-gray-600">Nome</p>
                <p className="text-sm">{ordem.equipmentName || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600">Série</p>
                <p className="text-sm">{ordem.equipmentSerial || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600">Etiqueta</p>
                <p className="text-sm">{ordem.equipmentTag || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-gray-600">Marca/Modelo</p>
                <p className="text-sm">{ordem.equipmentBrand && ordem.equipmentModel ? `${ordem.equipmentBrand} ${ordem.equipmentModel}` : "-"}</p>
              </div>
            </div>
            {ordem.reportedDefects && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-600">Defeitos Relatados</p>
                <p className="text-sm whitespace-pre-wrap">{ordem.reportedDefects}</p>
              </div>
            )}
            {ordem.proposedSolution && (
              <div className="mb-4">
                <p className="text-xs font-bold text-gray-600">Solução Proposta</p>
                <p className="text-sm whitespace-pre-wrap">{ordem.proposedSolution}</p>
              </div>
            )}
            {ordem.technicalReport && (
              <div>
                <p className="text-xs font-bold text-gray-600">Laudo Técnico</p>
                <p className="text-sm whitespace-pre-wrap">{ordem.technicalReport}</p>
              </div>
            )}
          </div>

          {/* Serviços */}
          {servicos.length > 0 && (
            <div className="border-b border-black pb-4">
              <h2 className="text-lg font-bold mb-4">Serviços</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-black px-3 py-2 text-left text-xs font-bold">Serviço</th>
                    <th className="border border-black px-3 py-2 text-left text-xs font-bold">Detalhes</th>
                    <th className="border border-black px-3 py-2 text-center text-xs font-bold">Qtd</th>
                    <th className="border border-black px-3 py-2 text-right text-xs font-bold">Valor</th>
                    <th className="border border-black px-3 py-2 text-right text-xs font-bold">Desc %</th>
                    <th className="border border-black px-3 py-2 text-right text-xs font-bold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {servicos.map((item) => (
                    <tr key={item.id}>
                      <td className="border border-black px-3 py-2 text-sm">{item.description}</td>
                      <td className="border border-black px-3 py-2 text-sm">{item.details || "-"}</td>
                      <td className="border border-black px-3 py-2 text-center text-sm">{item.quantity || 1}</td>
                      <td className="border border-black px-3 py-2 text-right text-sm">{formatCurrency(item.unitPrice)}</td>
                      <td className="border border-black px-3 py-2 text-right text-sm">{item.discount || "0"}%</td>
                      <td className="border border-black px-3 py-2 text-right text-sm font-semibold">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100">
                    <td colSpan={5} className="border border-black px-3 py-2 text-right font-bold text-sm">
                      Total Serviços:
                    </td>
                    <td className="border border-black px-3 py-2 text-right font-bold text-sm">{formatCurrency(totalServicos)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Produtos */}
          {produtos.length > 0 && (
            <div className="border-b border-black pb-4">
              <h2 className="text-lg font-bold mb-4">Produtos</h2>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-black px-3 py-2 text-left text-xs font-bold">Produto</th>
                    <th className="border border-black px-3 py-2 text-left text-xs font-bold">Detalhes</th>
                    <th className="border border-black px-3 py-2 text-center text-xs font-bold">Qtd</th>
                    <th className="border border-black px-3 py-2 text-right text-xs font-bold">Valor</th>
                    <th className="border border-black px-3 py-2 text-right text-xs font-bold">Desc %</th>
                    <th className="border border-black px-3 py-2 text-right text-xs font-bold">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {produtos.map((item) => (
                    <tr key={item.id}>
                      <td className="border border-black px-3 py-2 text-sm">{item.description}</td>
                      <td className="border border-black px-3 py-2 text-sm">{item.details || "-"}</td>
                      <td className="border border-black px-3 py-2 text-center text-sm">{item.quantity || 1}</td>
                      <td className="border border-black px-3 py-2 text-right text-sm">{formatCurrency(item.unitPrice)}</td>
                      <td className="border border-black px-3 py-2 text-right text-sm">{item.discount || "0"}%</td>
                      <td className="border border-black px-3 py-2 text-right text-sm font-semibold">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                  <tr className="bg-gray-100">
                    <td colSpan={5} className="border border-black px-3 py-2 text-right font-bold text-sm">
                      Total Produtos:
                    </td>
                    <td className="border border-black px-3 py-2 text-right font-bold text-sm">{formatCurrency(totalProdutos)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}

          {/* Resumo Financeiro */}
          <div className="border-b-2 border-black pb-4">
            <h2 className="text-lg font-bold mb-4">Resumo Financeiro</h2>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Serviços:</span>
                <span className="font-semibold">{formatCurrency(totalServicos)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Produtos:</span>
                <span className="font-semibold">{formatCurrency(totalProdutos)}</span>
              </div>
              {Number(ordem.laborCost) > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Mão de Obra:</span>
                  <span className="font-semibold">{formatCurrency(ordem.laborCost)}</span>
                </div>
              )}
              {Number(ordem.shippingCost) > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Frete:</span>
                  <span className="font-semibold">{formatCurrency(ordem.shippingCost)}</span>
                </div>
              )}
              {Number(ordem.otherCosts) > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Outros:</span>
                  <span className="font-semibold">{formatCurrency(ordem.otherCosts)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm border-t border-black pt-2">
                <span>Subtotal:</span>
                <span className="font-semibold">{formatCurrency(subtotal)}</span>
              </div>
              {Number(ordem.discount) > 0 && (
                <div className="flex justify-between text-sm">
                  <span>Desconto:</span>
                  <span className="font-semibold">-{formatCurrency(ordem.discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg border-t-2 border-black pt-2 mt-2">
                <span className="font-bold">TOTAL:</span>
                <span className="font-bold">{formatCurrency(total)}</span>
              </div>
            </div>
          </div>

          {/* Observações */}
          {(ordem.publicNotes || ordem.internalNotes) && (
            <div>
              <h2 className="text-lg font-bold mb-4">Observações</h2>
              {ordem.publicNotes && (
                <div className="mb-4">
                  <p className="text-xs font-bold text-gray-600">Observações Públicas</p>
                  <p className="text-sm whitespace-pre-wrap">{ordem.publicNotes}</p>
                </div>
              )}
              {ordem.internalNotes && (
                <div>
                  <p className="text-xs font-bold text-gray-600">Observações Internas</p>
                  <p className="text-sm whitespace-pre-wrap">{ordem.internalNotes}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
