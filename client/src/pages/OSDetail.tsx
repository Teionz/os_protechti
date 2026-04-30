import { useRoute, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { trpc } from "@/lib/trpc";
import { Printer, Download, ArrowLeft, Pencil } from "lucide-react";

const STATUS_LABELS: Record<string, string> = {
  budgeting: "Orçando",
  awaiting_approval: "Aguardando Aprovação",
  in_progress: "Em Andamento",
  awaiting_pickup: "Aguardando Retirada",
  completed: "Concluída",
};

const STATUS_COLORS: Record<string, string> = {
  budgeting: "bg-yellow-500",
  awaiting_approval: "bg-blue-500",
  in_progress: "bg-orange-500",
  awaiting_pickup: "bg-purple-500",
  completed: "bg-green-500",
};

const PRIORITY_LABELS: Record<string, string> = {
  low: "Baixa",
  medium: "Média",
  high: "Alta",
  urgent: "Urgente",
};

const ORIGIN_LABELS: Record<string, string> = {
  advertisement: "Anúncio",
  client: "Cliente",
  referral: "Indicação",
  bni: "BNI",
  new_client: "Cliente Novo",
};

export default function OSDetail() {
  const [, params] = useRoute("/os/:id");
  const [, navigate] = useLocation();
  const orderId = params?.id ? parseInt(params.id) : null;
  const printRef = useRef<HTMLDivElement>(null);

  const { data: order } = trpc.orders.get.useQuery(orderId!, {
    enabled: !!orderId,
  });

  const { data: orderItems } = trpc.orderItems.getByOrderId.useQuery(
    orderId!,
    { enabled: !!orderId }
  );

  const handlePrint = () => {
    const printContent = document.querySelector("[data-print-content]");
    if (!printContent) return;
    const printWindow = window.open("", "", "height=800,width=900");
    if (printWindow) {
      printWindow.document.write(
        `<html><head><title>OS ${order?.id}</title><style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body { font-family: Arial, sans-serif; font-size: 12px; color: #000; background: #fff; }
          .doc { padding: 24px; }
          table { width: 100%; border-collapse: collapse; }
          td, th { border: 1px solid #ccc; padding: 6px 8px; }
          th { background: #f0f0f0; font-weight: bold; }
          .section-title { font-weight: bold; font-size: 13px; background: #e8e8e8; padding: 6px 8px; margin: 12px 0 6px; border-left: 4px solid #333; }
          .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin: 6px 0; }
          .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin: 6px 0; }
          .field label { font-weight: bold; font-size: 11px; color: #555; display: block; }
          .field span { font-size: 12px; }
          .total-row { font-weight: bold; background: #f0f0f0; }
          .grand-total { font-size: 15px; font-weight: bold; text-align: right; padding: 8px; border-top: 2px solid #000; margin-top: 8px; }
          .signatures { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 40px; }
          .sig-line { border-top: 1px solid #000; padding-top: 6px; text-align: center; font-size: 11px; }
          .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px; border-bottom: 2px solid #000; padding-bottom: 12px; }
          .os-number { font-size: 18px; font-weight: bold; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold; }
        </style></head><body><div class="doc">`
      );
      printWindow.document.write(printContent.innerHTML);
      printWindow.document.write("</div></body></html>");
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadPDF = () => {
    const printContent = document.querySelector("[data-print-content]");
    if (!printContent) return;
    setTimeout(() => {
      html2canvas(printContent as HTMLElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      }).then((canvas) => {
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save(`OS-${order?.id}.pdf`);
      });
    }, 100);
  };

  if (!order) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-muted-foreground">Carregando OS...</div>
      </div>
    );
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
  const total = subtotal + laborCost + shippingCost + otherCost - totalDiscount;

  const fmt = (value: number) =>
    new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

  const fmtDate = (date: Date | null | undefined) =>
    date ? new Date(date).toLocaleDateString("pt-BR") : "-";

  const yesNo = (val: string | null | undefined) =>
    val === "yes" ? "Sim" : val === "no" ? "Não" : "-";

  const statusKey = order.status || "budgeting";
  const priorityKey = order.priority || "medium";

  return (
    <div className="min-h-screen bg-background">
      {/* Barra de ações - fundo escuro do sistema */}
      <div className="sticky top-0 z-10 bg-card border-b border-border px-6 py-3 flex items-center gap-3 shadow-sm">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/os/list")}
          className="mr-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Voltar
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-foreground">
            Ordem de Serviço #{order.id}
          </h1>
          <p className="text-xs text-muted-foreground">
            Criada em {fmtDate(order.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-semibold px-3 py-1 rounded-full text-white ${STATUS_COLORS[statusKey] || "bg-gray-500"}`}
          >
            {STATUS_LABELS[statusKey] || statusKey}
          </span>
          <Button variant="outline" size="sm" onClick={() => navigate(`/os/${order.id}/edit`)}>
            <Pencil className="w-4 h-4 mr-1" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" />
            Imprimir
          </Button>
          <Button variant="default" size="sm" onClick={handleDownloadPDF}>
            <Download className="w-4 h-4 mr-1" />
            Baixar PDF
          </Button>
        </div>
      </div>

      {/* Documento branco para impressão */}
      <div className="py-8 px-4 bg-gray-100">
        <div
          ref={printRef}
          data-print-content
          className="bg-white shadow-xl max-w-4xl mx-auto rounded-sm text-gray-900"
          style={{ fontFamily: "Arial, sans-serif", color: "#111" }}
        >
          {/* Cabeçalho do documento */}
          <div className="px-10 pt-8 pb-4 border-b-2 border-gray-800">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 tracking-wide">
                  ORDEM DE SERVIÇO
                </h1>
                <p className="text-3xl font-bold text-gray-700 mt-1">
                  Nº {order.id}
                </p>
              </div>
              <div className="text-right text-sm text-gray-600">
                <p className="font-bold text-gray-800">ProTech TI</p>
                <p>sistema.protechti.com.br</p>
                <p className="mt-2">Data: {fmtDate(order.createdAt)}</p>
                <p>
                  Status:{" "}
                  <strong>{STATUS_LABELS[statusKey] || statusKey}</strong>
                </p>
              </div>
            </div>
          </div>

          <div className="px-10 py-6 space-y-6">
            {/* PERÍODO DE EXECUÇÃO */}
            <section>
              <div className="bg-gray-800 text-white text-xs font-bold uppercase px-3 py-1.5 mb-3 tracking-wider">
                Período de Execução
              </div>
              <table className="w-full text-sm border border-gray-300">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold w-1/4">
                      Entrada
                    </td>
                    <td className="border border-gray-300 px-3 py-2 w-1/4">
                      {fmtDate(order.entryDate || order.createdAt)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold w-1/4">
                      Saída Prevista
                    </td>
                    <td className="border border-gray-300 px-3 py-2 w-1/4">
                      {fmtDate(order.exitDate)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* DADOS DO CLIENTE */}
            <section>
              <div className="bg-gray-800 text-white text-xs font-bold uppercase px-3 py-1.5 mb-3 tracking-wider">
                Dados do Cliente
              </div>
              <table className="w-full text-sm border border-gray-300">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold w-1/4">
                      Razão Social
                    </td>
                    <td className="border border-gray-300 px-3 py-2 w-1/4">
                      {order.client?.name || "-"}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold w-1/4">
                      CNPJ/CPF
                    </td>
                    <td className="border border-gray-300 px-3 py-2 w-1/4">
                      {order.client?.cnpjCpf || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                      Telefone
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {order.client?.phone || "-"}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                      E-mail
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {order.client?.email || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                      Endereço
                    </td>
                    <td className="border border-gray-300 px-3 py-2" colSpan={3}>
                      {[order.client?.street, order.client?.number, order.client?.neighborhood, order.client?.city]
                        .filter(Boolean)
                        .join(", ") || "-"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* INFORMAÇÕES ADICIONAIS */}
            <section>
              <div className="bg-gray-800 text-white text-xs font-bold uppercase px-3 py-1.5 mb-3 tracking-wider">
                Informações Adicionais
              </div>
              <table className="w-full text-sm border border-gray-300">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold w-1/6">
                      Teclado Faltando
                    </td>
                    <td className="border border-gray-300 px-3 py-2 w-1/6">
                      {yesNo(order.missingKeyboard)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold w-1/6">
                      Tela Trincada
                    </td>
                    <td className="border border-gray-300 px-3 py-2 w-1/6">
                      {yesNo(order.crackedScreen)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold w-1/6">
                      Carregador
                    </td>
                    <td className="border border-gray-300 px-3 py-2 w-1/6">
                      {yesNo(order.missingCharger)}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                      Bolsa
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {yesNo(order.missingBag)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                      Ligando
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {yesNo(order.poweringOn)}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                      Cabo de Energia
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {yesNo(order.missingPowerCable)}
                    </td>
                  </tr>
                  {order.password && (
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                        Senha
                      </td>
                      <td className="border border-gray-300 px-3 py-2" colSpan={5}>
                        {order.password}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            {/* EQUIPAMENTO */}
            <section>
              <div className="bg-gray-800 text-white text-xs font-bold uppercase px-3 py-1.5 mb-3 tracking-wider">
                Equipamento
              </div>
              <table className="w-full text-sm border border-gray-300">
                <tbody>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold w-1/4">
                      Nome do Equipamento
                    </td>
                    <td className="border border-gray-300 px-3 py-2 w-1/4">
                      {order.equipmentName || "-"}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold w-1/4">
                      Marca
                    </td>
                    <td className="border border-gray-300 px-3 py-2 w-1/4">
                      {order.equipmentBrand || "-"}
                    </td>
                  </tr>
                  <tr>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                      Modelo
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {order.equipmentModel || "-"}
                    </td>
                    <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                      Série / Etiqueta
                    </td>
                    <td className="border border-gray-300 px-3 py-2">
                      {order.equipmentSerial || "-"} / {order.equipmentTag || "-"}
                    </td>
                  </tr>
                  {order.reportedDefects && (
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                        Defeitos Relatados
                      </td>
                      <td className="border border-gray-300 px-3 py-2" colSpan={3}>
                        {order.reportedDefects}
                      </td>
                    </tr>
                  )}
                  {order.technicalReport && (
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                        Laudo Técnico
                      </td>
                      <td className="border border-gray-300 px-3 py-2" colSpan={3}>
                        {order.technicalReport}
                      </td>
                    </tr>
                  )}
                  {order.proposedSolution && (
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                        Solução Proposta
                      </td>
                      <td className="border border-gray-300 px-3 py-2" colSpan={3}>
                        {order.proposedSolution}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </section>

            {/* SERVIÇOS */}
            {services.length > 0 && (
              <section>
                <div className="bg-gray-800 text-white text-xs font-bold uppercase px-3 py-1.5 mb-3 tracking-wider">
                  Serviços
                </div>
                <table className="w-full text-sm border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-8">
                        #
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                        Serviço
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                        Detalhes
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold w-16">
                        Qtd
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-right font-semibold w-28">
                        Vl. Unit.
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-right font-semibold w-28">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {services.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {idx + 1}
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {item.description}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-gray-600">
                          {item.details || "-"}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {item.quantity}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right">
                          {fmt(Number(item.unitPrice || 0))}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                          {fmt(Number(item.total || 0))}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-bold">
                      <td
                        className="border border-gray-300 px-3 py-2 text-right"
                        colSpan={5}
                      >
                        Total Serviços:
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        {fmt(servicesTotalValue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>
            )}

            {/* PRODUTOS */}
            {products.length > 0 && (
              <section>
                <div className="bg-gray-800 text-white text-xs font-bold uppercase px-3 py-1.5 mb-3 tracking-wider">
                  Produtos
                </div>
                <table className="w-full text-sm border border-gray-300">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold w-8">
                        #
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                        Produto
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-left font-semibold">
                        Detalhes
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-center font-semibold w-16">
                        Qtd
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-right font-semibold w-28">
                        Vl. Unit.
                      </th>
                      <th className="border border-gray-300 px-3 py-2 text-right font-semibold w-28">
                        Subtotal
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((item, idx) => (
                      <tr key={item.id} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {idx + 1}
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {item.description}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-gray-600">
                          {item.details || "-"}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-center">
                          {item.quantity}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right">
                          {fmt(Number(item.unitPrice || 0))}
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right font-semibold">
                          {fmt(Number(item.total || 0))}
                        </td>
                      </tr>
                    ))}
                    <tr className="bg-gray-100 font-bold">
                      <td
                        className="border border-gray-300 px-3 py-2 text-right"
                        colSpan={5}
                      >
                        Total Produtos:
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        {fmt(productsTotalValue)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </section>
            )}

            {/* RESUMO FINANCEIRO */}
            <section>
              <div className="bg-gray-800 text-white text-xs font-bold uppercase px-3 py-1.5 mb-3 tracking-wider">
                Resumo Financeiro
              </div>
              <div className="flex justify-end">
                <table className="text-sm border border-gray-300 w-72">
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                        Serviços
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        {fmt(servicesTotalValue)}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                        Produtos
                      </td>
                      <td className="border border-gray-300 px-3 py-2 text-right">
                        {fmt(productsTotalValue)}
                      </td>
                    </tr>
                    {laborCost > 0 && (
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                          Mão de Obra
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right">
                          {fmt(laborCost)}
                        </td>
                      </tr>
                    )}
                    {shippingCost > 0 && (
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                          Frete
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right">
                          {fmt(shippingCost)}
                        </td>
                      </tr>
                    )}
                    {otherCost > 0 && (
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold">
                          Outros
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right">
                          {fmt(otherCost)}
                        </td>
                      </tr>
                    )}
                    {totalDiscount > 0 && (
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold text-red-700">
                          Desconto
                        </td>
                        <td className="border border-gray-300 px-3 py-2 text-right text-red-700">
                          - {fmt(totalDiscount)}
                        </td>
                      </tr>
                    )}
                    <tr className="bg-gray-800 text-white">
                      <td className="border border-gray-700 px-3 py-3 font-bold text-base">
                        TOTAL
                      </td>
                      <td className="border border-gray-700 px-3 py-3 text-right font-bold text-base">
                        {fmt(total)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            {/* OBSERVAÇÕES */}
            {(order.publicNotes || order.internalNotes) && (
              <section>
                <div className="bg-gray-800 text-white text-xs font-bold uppercase px-3 py-1.5 mb-3 tracking-wider">
                  Observações
                </div>
                <table className="w-full text-sm border border-gray-300">
                  <tbody>
                    {order.publicNotes && (
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold w-1/4 align-top">
                          Observações Públicas
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {order.publicNotes}
                        </td>
                      </tr>
                    )}
                    {order.internalNotes && (
                      <tr>
                        <td className="border border-gray-300 px-3 py-2 bg-gray-50 font-semibold w-1/4 align-top">
                          Observações Internas
                        </td>
                        <td className="border border-gray-300 px-3 py-2">
                          {order.internalNotes}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </section>
            )}

            {/* ASSINATURAS */}
            <section className="pt-4">
              <div className="grid grid-cols-2 gap-16 mt-8">
                <div className="text-center">
                  <div className="border-t-2 border-gray-800 pt-3">
                    <p className="text-sm font-semibold text-gray-700">
                      Assinatura do Cliente
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {order.client?.name || ""}
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="border-t-2 border-gray-800 pt-3">
                    <p className="text-sm font-semibold text-gray-700">
                      Assinatura do Técnico
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {order.technician || ""}
                    </p>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Rodapé */}
          <div className="px-10 py-4 border-t border-gray-200 bg-gray-50 text-center">
            <p className="text-xs text-gray-400">
              Caso o cliente não aprove o orçamento e não retire o equipamento em até 30 (trinta) dias, a empresa poderá considerá-lo abandonado, podendo destiná-lo ao descarte, reciclagem ou doação, conforme o art. 1.263 do Código Civil Brasileiro.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
