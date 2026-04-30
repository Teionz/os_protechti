import { useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { useRef } from "react";
import html2pdf from "html2pdf.js";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { trpc } from "@/lib/trpc";

export default function OSDetail() {
  const [, params] = useRoute("/os/:id");
  const orderId = params?.id ? parseInt(params.id) : null;
  const printRef = useRef<HTMLDivElement>(null);

  const { data: order } = trpc.orders.get.useQuery(
    orderId!,
    { enabled: !!orderId }
  );

  const { data: orderItems } = trpc.orderItems.getByOrderId.useQuery(
    orderId!,
    { enabled: !!orderId }
  );

  const handlePrint = () => {
    const printContent = document.querySelector("[data-print-content]");
    if (!printContent) {
      alert("Conteúdo para impressão não encontrado");
      return;
    }
    const printWindow = window.open("", "", "height=600,width=800");
    if (printWindow) {
      printWindow.document.write(
        "<html><head><title>Imprimir OS</title><style>" +
          "body { font-family: Arial, sans-serif; margin: 20px; }" +
          "table { width: 100%; border-collapse: collapse; margin: 10px 0; }" +
          "td, th { border: 1px solid #000; padding: 8px; text-align: left; }" +
          "th { background-color: #f0f0f0; }" +
          ".section-title { font-weight: bold; margin-top: 15px; border-bottom: 2px solid #000; padding-bottom: 5px; }" +
          ".row { display: flex; gap: 20px; margin: 10px 0; }" +
          ".col { flex: 1; }" +
          ".label { font-weight: bold; font-size: 12px; }" +
          ".value { font-size: 13px; }" +
          "</style></head><body>"
      );
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.write("</body></html>");
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadPDF = () => {
    const printContent = document.querySelector("[data-print-content]");
    if (!printContent) {
      alert("Conteúdo para PDF não encontrado");
      return;
    }

    setTimeout(() => {
      html2canvas(printContent as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
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

        pdf.save(`OS-${order?.id}.pdf`);
      });
    }, 100);
  };

  if (!order) {
    return <div className="p-8">OS não encontrada</div>;
  }

  const services = orderItems?.filter((item) => item.type === "service") || [];
  const products = orderItems?.filter((item) => item.type === "product") || [];

  const servicesTotalValue = services.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  );
  const productsTotalValue = products.reduce(
    (sum, item) => sum + Number(item.total || 0),
    0
  );
  const subtotal = servicesTotalValue + productsTotalValue;
  const laborCost = Number(order.laborCost || 0);
  const shippingCost = Number(order.shippingCost || 0);
  const otherCost = Number(order.otherCosts || 0);
  const totalDiscount = Number(order.discount || 0);
  const total =
    subtotal + laborCost + shippingCost + otherCost - totalDiscount;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "-";
    return new Date(date).toLocaleDateString("pt-BR");
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <div className="mb-6 flex gap-3">
        <Button onClick={handlePrint} variant="default">
          Imprimir
        </Button>
        <Button onClick={handleDownloadPDF} variant="default">
          Baixar PDF
        </Button>
        <Button variant="outline">Editar</Button>
      </div>

      <div
        ref={printRef}
        data-print-content
        className="bg-white p-12 shadow-lg max-w-4xl mx-auto"
      >
        {/* Cabeçalho */}
        <div className="text-center mb-8 pb-4 border-b-2 border-black">
          <h1 className="text-2xl font-bold">ORDEM DE SERVIÇO Nº {order.id}</h1>
          <p className="text-sm mt-2">{formatDate(order.createdAt)}</p>
        </div>

        {/* PERÍODO DE EXECUÇÃO */}
        <div className="mb-6">
          <h2 className="text-sm font-bold border-b-2 border-black pb-2 mb-3">
            PERÍODO DE EXECUÇÃO
          </h2>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <span className="font-bold">Entrada:</span>
              <span className="ml-2">{formatDate(order.createdAt)}</span>
            </div>
            <div>
              <span className="font-bold">Saída:</span>
              <span className="ml-2">__/__/____</span>
            </div>
          </div>
        </div>

        {/* INFORMAÇÕES GERAIS */}
        <div className="mb-6">
          <h2 className="text-sm font-bold border-b-2 border-black pb-2 mb-3">
            INFORMAÇÕES GERAIS
          </h2>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-bold block">Status</span>
              <span>{order.status || "-"}</span>
            </div>
            <div>
              <span className="font-bold block">Prioridade</span>
              <span>{order.priority || "-"}</span>
            </div>
            <div>
              <span className="font-bold block">Origem</span>
              <span>{order.origin || "-"}</span>
            </div>
            <div>
              <span className="font-bold block">Técnico</span>
              <span>{order.technician || "-"}</span>
            </div>
          </div>
        </div>

        {/* DADOS DO CLIENTE */}
        <div className="mb-6">
          <h2 className="text-sm font-bold border-b-2 border-black pb-2 mb-3">
            DADOS DO CLIENTE
          </h2>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <div className="mb-2">
                <span className="font-bold block">Razão Social:</span>
                <span>{order.client?.name || "-"}</span>
              </div>
              <div className="mb-2">
                <span className="font-bold block">CNPJ/CPF:</span>
                <span>{order.client?.cnpjCpf || "-"}</span>
              </div>
              <div>
                <span className="font-bold block">Telefone:</span>
                <span>{order.client?.phone || "-"}</span>
              </div>
            </div>
            <div>
              <div className="mb-2">
                <span className="font-bold block">Nome Fantasia:</span>
                <span>{order.client?.name || "-"}</span>
              </div>
              <div className="mb-2">
                <span className="font-bold block">Cidade/UF:</span>
                <span>{order.client?.neighborhood || "-"}</span>
              </div>
              <div>
                <span className="font-bold block">E-mail:</span>
                <span>{order.client?.email || "-"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* EQUIPAMENTO */}
        <div className="mb-6">
          <h2 className="text-sm font-bold border-b-2 border-black pb-2 mb-3">
            EQUIPAMENTO
          </h2>
          <div className="grid grid-cols-2 gap-8 text-sm mb-4">
            <div>
              <div className="mb-2">
                <span className="font-bold block">Nome do Equipamento:</span>
                <span>{order.equipmentName || "-"}</span>
              </div>
              <div>
                <span className="font-bold block">Defeitos Relatados:</span>
                <span>{order.reportedDefects || "-"}</span>
              </div>
            </div>
            <div>
              <div className="mb-2">
                <span className="font-bold block">Marca/Modelo:</span>
                <span>{order.equipmentBrand} {order.equipmentModel || "-"}</span>
              </div>
              <div>
                <span className="font-bold block">Série:</span>
                <span>{order.equipmentSerial || "-"}</span>
              </div>
            </div>
          </div>

          {/* INFORMAÇÕES ADICIONAIS */}
          <div className="bg-gray-100 p-4 rounded mb-4 text-sm">
            <h3 className="font-bold mb-2">Informações Adicionais:</h3>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <span className="font-bold block">Teclado Faltando:</span>
                <span>{order.missingKeyboard ? "Sim" : "Não"}</span>
              </div>
              <div>
                <span className="font-bold block">Tela Trincada:</span>
                <span>{order.crackedScreen ? "Sim" : "Não"}</span>
              </div>
              <div>
                <span className="font-bold block">Carregador:</span>
                <span>{order.missingCharger ? "Sim" : "Não"}</span>
              </div>
              <div>
                <span className="font-bold block">Bolsa:</span>
                <span>{order.missingBag ? "Sim" : "Não"}</span>
              </div>
              <div>
                <span className="font-bold block">Ligando:</span>
                <span>{order.poweringOn ? "Sim" : "Não"}</span>
              </div>
              <div>
                <span className="font-bold block">Cabo de Energia:</span>
                <span>{order.missingPowerCable ? "Sim" : "Não"}</span>
              </div>
              {order.password && (
                <div>
                  <span className="font-bold block">Senha:</span>
                  <span>{order.password}</span>
                </div>
              )}
            </div>
          </div>

          {/* LAUDO E SOLUÇÃO */}
          {(order.technicalReport || order.proposedSolution) && (
            <div className="grid grid-cols-2 gap-8 text-sm">
              {order.technicalReport && (
                <div>
                  <span className="font-bold block">Laudo Técnico:</span>
                  <span>{order.technicalReport}</span>
                </div>
              )}
              {order.proposedSolution && (
                <div>
                  <span className="font-bold block">Solução Proposta:</span>
                  <span>{order.proposedSolution}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* SERVIÇOS */}
        {services.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold border-b-2 border-black pb-2 mb-3">
              SERVIÇOS
            </h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-2 px-2">ITEM</th>
                  <th className="text-left py-2 px-2">NOME</th>
                  <th className="text-left py-2 px-2">DETALHES</th>
                  <th className="text-right py-2 px-2">QTD</th>
                  <th className="text-right py-2 px-2">VL. UNIT.</th>
                  <th className="text-right py-2 px-2">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                {services.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-300">
                    <td className="py-2 px-2">{idx + 1}</td>
                    <td className="py-2 px-2">{item.description}</td>
                    <td className="py-2 px-2">{item.details || "-"}</td>
                    <td className="text-right py-2 px-2">{item.quantity}</td>
                    <td className="text-right py-2 px-2">
                      {formatCurrency(Number(item.unitPrice || 0))}
                    </td>
                    <td className="text-right py-2 px-2 font-bold">
                      {formatCurrency(Number(item.total || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right mt-2 text-sm font-bold">
              Total Serviços: {formatCurrency(servicesTotalValue)}
            </div>
          </div>
        )}

        {/* PRODUTOS */}
        {products.length > 0 && (
          <div className="mb-6">
            <h2 className="text-sm font-bold border-b-2 border-black pb-2 mb-3">
              PRODUTOS
            </h2>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b-2 border-black">
                  <th className="text-left py-2 px-2">ITEM</th>
                  <th className="text-left py-2 px-2">NOME</th>
                  <th className="text-left py-2 px-2">DETALHES</th>
                  <th className="text-right py-2 px-2">QTD</th>
                  <th className="text-right py-2 px-2">VL. UNIT.</th>
                  <th className="text-right py-2 px-2">SUBTOTAL</th>
                </tr>
              </thead>
              <tbody>
                {products.map((item, idx) => (
                  <tr key={item.id} className="border-b border-gray-300">
                    <td className="py-2 px-2">{idx + 1}</td>
                    <td className="py-2 px-2">{item.description}</td>
                    <td className="py-2 px-2">{item.details || "-"}</td>
                    <td className="text-right py-2 px-2">{item.quantity}</td>
                    <td className="text-right py-2 px-2">
                      {formatCurrency(Number(item.unitPrice || 0))}
                    </td>
                    <td className="text-right py-2 px-2 font-bold">
                      {formatCurrency(Number(item.total || 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="text-right mt-2 text-sm font-bold">
              Total Produtos: {formatCurrency(productsTotalValue)}
            </div>
          </div>
        )}

        {/* RESUMO FINANCEIRO */}
        <div className="mb-6">
          <h2 className="text-sm font-bold border-b-2 border-black pb-2 mb-3">
            RESUMO FINANCEIRO
          </h2>
          <div className="grid grid-cols-2 gap-8 text-sm">
            <div>
              <div className="mb-2">
                <span className="font-bold">Serviços:</span>
                <span className="float-right">
                  {formatCurrency(servicesTotalValue)}
                </span>
              </div>
              <div className="mb-2">
                <span className="font-bold">Produtos:</span>
                <span className="float-right">
                  {formatCurrency(productsTotalValue)}
                </span>
              </div>
              <div className="mb-2">
                <span className="font-bold">Mão de Obra:</span>
                <span className="float-right">
                  {formatCurrency(laborCost)}
                </span>
              </div>
            </div>
            <div>
              <div className="mb-2">
                <span className="font-bold">Frete:</span>
                <span className="float-right">
                  {formatCurrency(shippingCost)}
                </span>
              </div>
              <div className="mb-2">
                <span className="font-bold">Outros:</span>
                <span className="float-right">
                  {formatCurrency(otherCost)}
                </span>
              </div>
              <div className="mb-2">
                <span className="font-bold">Desconto:</span>
                <span className="float-right">
                  {formatCurrency(totalDiscount)}
                </span>
              </div>
            </div>
          </div>
          <div className="border-t-2 border-black mt-4 pt-4 text-right text-lg font-bold">
            TOTAL: {formatCurrency(total)}
          </div>
        </div>

        {/* OBSERVAÇÕES */}
        {(order.publicNotes || order.internalNotes) && (
          <div className="mb-6">
            <h2 className="text-sm font-bold border-b-2 border-black pb-2 mb-3">
              OBSERVAÇÕES
            </h2>
            {order.publicNotes && (
              <div className="text-sm mb-2">
                <span className="font-bold">Públicas:</span>
                <p>{order.publicNotes}</p>
              </div>
            )}
            {order.internalNotes && (
              <div className="text-sm">
                <span className="font-bold">Internas:</span>
                <p>{order.internalNotes}</p>
              </div>
            )}
          </div>
        )}

        {/* ASSINATURAS */}
        <div className="mt-12 pt-8 border-t-2 border-black">
          <div className="grid grid-cols-2 gap-12 text-sm">
            <div className="text-center">
              <div className="border-t border-black h-12 mb-2"></div>
              <span>Assinatura do Cliente</span>
            </div>
            <div className="text-center">
              <div className="border-t border-black h-12 mb-2"></div>
              <span>Assinatura do Técnico</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
