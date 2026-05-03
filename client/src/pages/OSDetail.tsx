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

  const buildPrintHTML = () => {
    const s = services || [];
    const p = products || [];
    const sTotal = s.reduce((sum, i) => sum + Number(i.total || 0), 0);
    const pTotal = p.reduce((sum, i) => sum + Number(i.total || 0), 0);
    const lCost = Number(order?.laborCost || 0);
    const sCost = Number(order?.shippingCost || 0);
    const oCost = Number(order?.otherCosts || 0);
    const disc = Number(order?.discount || 0);
    const grandTotal = sTotal + pTotal + lCost + sCost + oCost - disc;
    const fmtR = (v: number) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(v);
    const fmtD = (d: Date | null | undefined) => d ? new Date(d).toLocaleDateString("pt-BR") : "-";
    const yn = (v: string | null | undefined) => v === "yes" ? "Sim" : v === "no" ? "Não" : "-";
    const statusLbl = STATUS_LABELS[order?.status || ""] || order?.status || "-";
    const addr = [order?.client?.street, order?.client?.number, order?.client?.neighborhood, order?.client?.city].filter(Boolean).join(", ") || "-";

    const serviceRows = s.map((item, idx) => `
      <tr>
        <td style="text-align:center">${idx + 1}</td>
        <td>${item.description || ""}</td>
        <td>${item.details || "-"}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">${fmtR(Number(item.unitPrice || 0))}</td>
        <td style="text-align:right;font-weight:bold">${fmtR(Number(item.total || 0))}</td>
      </tr>`).join("");

    const productRows = p.map((item, idx) => `
      <tr>
        <td style="text-align:center">${idx + 1}</td>
        <td>${item.description || ""}</td>
        <td>${item.details || "-"}</td>
        <td style="text-align:center">${item.quantity}</td>
        <td style="text-align:right">${fmtR(Number(item.unitPrice || 0))}</td>
        <td style="text-align:right;font-weight:bold">${fmtR(Number(item.total || 0))}</td>
      </tr>`).join("");

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>OS ${order?.id} - ProTech TI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: Arial, sans-serif; font-size: 11px; color: #111; background: #fff; }
    .page { padding: 20px 24px; max-width: 800px; margin: 0 auto; }

    /* CABEÇALHO DA EMPRESA */
    .company-header { display: flex; justify-content: space-between; align-items: flex-start; padding-bottom: 12px; border-bottom: 3px solid #1a1a2e; margin-bottom: 14px; }
    .company-logo-area { display: flex; align-items: center; gap: 12px; }
    .company-logo-box { width: 52px; height: 52px; background: #1a1a2e; border-radius: 8px; display: flex; align-items: center; justify-content: center; }
    .company-logo-box svg { width: 32px; height: 32px; fill: #00D9FF; }
    .company-name { font-size: 20px; font-weight: bold; color: #1a1a2e; }
    .company-subtitle { font-size: 10px; color: #666; margin-top: 2px; }
    .company-contact { text-align: right; font-size: 10px; color: #444; line-height: 1.6; }

    /* TÍTULO DA OS */
    .os-title-bar { background: #1a1a2e; color: #fff; text-align: center; padding: 10px; margin-bottom: 14px; }
    .os-title-bar h1 { font-size: 16px; font-weight: bold; letter-spacing: 1px; }
    .os-title-bar .os-date { font-size: 11px; color: #00D9FF; margin-top: 2px; }

    /* SEÇÕES */
    .section { margin-bottom: 12px; }
    .section-header { background: #1a1a2e; color: #fff; font-size: 10px; font-weight: bold; text-transform: uppercase; letter-spacing: 0.5px; padding: 5px 8px; }
    table.data { width: 100%; border-collapse: collapse; }
    table.data td { border: 1px solid #ccc; padding: 5px 8px; vertical-align: top; }
    table.data td.lbl { background: #f5f5f5; font-weight: bold; font-size: 10px; color: #333; width: 18%; white-space: nowrap; }
    table.data td.val { font-size: 11px; }

    /* TABELAS DE ITENS */
    table.items { width: 100%; border-collapse: collapse; }
    table.items th { background: #f0f0f0; border: 1px solid #bbb; padding: 5px 7px; font-size: 10px; font-weight: bold; text-align: left; }
    table.items td { border: 1px solid #ccc; padding: 5px 7px; font-size: 11px; }
    table.items tr:nth-child(even) td { background: #fafafa; }
    table.items tr.total-row td { background: #1a1a2e; color: #fff; font-weight: bold; }

    /* RESUMO FINANCEIRO */
    .financial-table { width: 260px; margin-left: auto; border-collapse: collapse; }
    .financial-table td { border: 1px solid #ccc; padding: 5px 10px; font-size: 11px; }
    .financial-table td.lbl { background: #f5f5f5; font-weight: bold; }
    .financial-table tr.grand-total td { background: #1a1a2e; color: #fff; font-weight: bold; font-size: 13px; }

    /* ASSINATURAS */
    .signatures { display: flex; gap: 60px; margin-top: 30px; padding-top: 10px; }
    .sig-box { flex: 1; text-align: center; }
    .sig-line { border-top: 1px solid #333; margin-bottom: 6px; padding-top: 4px; font-size: 10px; color: #444; }
    .sig-name { font-size: 10px; color: #666; }

    /* RODAPÉ */
    .footer { margin-top: 16px; padding-top: 10px; border-top: 1px solid #ddd; font-size: 9px; color: #888; text-align: center; }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .page { padding: 10px 16px; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- CABEÇALHO DA EMPRESA -->
  <div class="company-header">
    <div class="company-logo-area">
      <div class="company-logo-box">
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8" style="fill:none;stroke:#00D9FF;stroke-width:2"/><line x1="16" y1="13" x2="8" y2="13" style="fill:none;stroke:#00D9FF;stroke-width:2"/><line x1="16" y1="17" x2="8" y2="17" style="fill:none;stroke:#00D9FF;stroke-width:2"/><polyline points="10 9 9 9 8 9" style="fill:none;stroke:#00D9FF;stroke-width:2"/></svg>
      </div>
      <div>
        <div class="company-name">ProTech TI</div>
        <div class="company-subtitle">Soluções em Tecnologia da Informação</div>
        <div class="company-subtitle">sistema.protechti.com.br</div>
      </div>
    </div>
    <div class="company-contact">
      Responsável: ${order?.technician || "-"}<br>
      Status: <strong>${statusLbl}</strong>
    </div>
  </div>

  <!-- TÍTULO DA OS -->
  <div class="os-title-bar">
    <h1>ORDEM DE SERVIÇO Nº ${order?.id}</h1>
    <div class="os-date">Data de abertura: ${fmtD(order?.createdAt)}</div>
  </div>

  <!-- PERÍODO DE EXECUÇÃO -->
  <div class="section">
    <div class="section-header">Período de Execução</div>
    <table class="data">
      <tr>
        <td class="lbl">Entrada</td><td class="val">${fmtD(order?.entryDate || order?.createdAt)}</td>
        <td class="lbl">Saída Prevista</td><td class="val">${fmtD(order?.exitDate)}</td>
      </tr>
    </table>
  </div>

  <!-- DADOS DO CLIENTE -->
  <div class="section">
    <div class="section-header">Dados do Cliente</div>
    <table class="data">
      <tr>
        <td class="lbl">Razão Social</td><td class="val">${order?.client?.name || "-"}</td>
        <td class="lbl">CNPJ/CPF</td><td class="val">${order?.client?.cnpjCpf || "-"}</td>
      </tr>
      <tr>
        <td class="lbl">Telefone</td><td class="val">${order?.client?.phone || "-"}</td>
        <td class="lbl">E-mail</td><td class="val">${order?.client?.email || "-"}</td>
      </tr>
      <tr>
        <td class="lbl">Endereço</td><td class="val" colspan="3">${addr}</td>
      </tr>
    </table>
  </div>

  <!-- INFORMAÇÕES ADICIONAIS -->
  <div class="section">
    <div class="section-header">Informações Adicionais</div>
    <table class="data">
      <tr>
        <td class="lbl">Teclado Faltando</td><td class="val">${yn(order?.missingKeyboard)}</td>
        <td class="lbl">Tela Trincada</td><td class="val">${yn(order?.crackedScreen)}</td>
        <td class="lbl">Carregador</td><td class="val">${yn(order?.missingCharger)}</td>
      </tr>
      <tr>
        <td class="lbl">Bolsa</td><td class="val">${yn(order?.missingBag)}</td>
        <td class="lbl">Ligando</td><td class="val">${yn(order?.poweringOn)}</td>
        <td class="lbl">Cabo de Energia</td><td class="val">${yn(order?.missingPowerCable)}</td>
      </tr>
      ${order?.password ? `<tr><td class="lbl">Senha</td><td class="val" colspan="5">${order.password}</td></tr>` : ""}
    </table>
  </div>

  <!-- EQUIPAMENTO -->
  <div class="section">
    <div class="section-header">Equipamento</div>
    <table class="data">
      <tr>
        <td class="lbl">Nome</td><td class="val">${order?.equipmentName || "-"}</td>
        <td class="lbl">Marca</td><td class="val">${order?.equipmentBrand || "-"}</td>
      </tr>
      <tr>
        <td class="lbl">Modelo</td><td class="val">${order?.equipmentModel || "-"}</td>
        <td class="lbl">Série / Etiqueta</td><td class="val">${order?.equipmentSerial || "-"} / ${order?.equipmentTag || "-"}</td>
      </tr>
      ${order?.reportedDefects ? `<tr><td class="lbl">Defeitos</td><td class="val" colspan="3">${order.reportedDefects}</td></tr>` : ""}
      ${order?.technicalReport ? `<tr><td class="lbl">Laudo Técnico</td><td class="val" colspan="3">${order.technicalReport}</td></tr>` : ""}
      ${order?.proposedSolution ? `<tr><td class="lbl">Solução Proposta</td><td class="val" colspan="3">${order.proposedSolution}</td></tr>` : ""}
    </table>
  </div>

  <!-- SERVIÇOS -->
  ${s.length > 0 ? `
  <div class="section">
    <div class="section-header">Serviços</div>
    <table class="items">
      <thead><tr><th style="width:30px">#</th><th>Serviço</th><th>Detalhes</th><th style="width:40px;text-align:center">Qtd</th><th style="width:90px;text-align:right">Vl. Unit.</th><th style="width:90px;text-align:right">Subtotal</th></tr></thead>
      <tbody>${serviceRows}
        <tr class="total-row"><td colspan="5" style="text-align:right">Total Serviços:</td><td style="text-align:right">${fmtR(sTotal)}</td></tr>
      </tbody>
    </table>
  </div>` : ""}

  <!-- PRODUTOS -->
  ${p.length > 0 ? `
  <div class="section">
    <div class="section-header">Produtos</div>
    <table class="items">
      <thead><tr><th style="width:30px">#</th><th>Produto</th><th>Detalhes</th><th style="width:40px;text-align:center">Qtd</th><th style="width:90px;text-align:right">Vl. Unit.</th><th style="width:90px;text-align:right">Subtotal</th></tr></thead>
      <tbody>${productRows}
        <tr class="total-row"><td colspan="5" style="text-align:right">Total Produtos:</td><td style="text-align:right">${fmtR(pTotal)}</td></tr>
      </tbody>
    </table>
  </div>` : ""}

  <!-- RESUMO FINANCEIRO -->
  <div class="section">
    <div class="section-header">Resumo Financeiro</div>
    <div style="display:flex;justify-content:flex-end;margin-top:8px">
      <table class="financial-table">
        <tr><td class="lbl">Serviços</td><td style="text-align:right">${fmtR(sTotal)}</td></tr>
        <tr><td class="lbl">Produtos</td><td style="text-align:right">${fmtR(pTotal)}</td></tr>
        ${lCost > 0 ? `<tr><td class="lbl">Mão de Obra</td><td style="text-align:right">${fmtR(lCost)}</td></tr>` : ""}
        ${sCost > 0 ? `<tr><td class="lbl">Frete</td><td style="text-align:right">${fmtR(sCost)}</td></tr>` : ""}
        ${oCost > 0 ? `<tr><td class="lbl">Outros</td><td style="text-align:right">${fmtR(oCost)}</td></tr>` : ""}
        ${disc > 0 ? `<tr><td class="lbl" style="color:#c00">Desconto</td><td style="text-align:right;color:#c00">- ${fmtR(disc)}</td></tr>` : ""}
        <tr class="grand-total"><td>TOTAL</td><td style="text-align:right">${fmtR(grandTotal)}</td></tr>
      </table>
    </div>
  </div>

  <!-- OBSERVAÇÕES -->
  ${order?.publicNotes ? `
  <div class="section">
    <div class="section-header">Observações</div>
    <table class="data"><tr><td class="lbl">Observações</td><td class="val">${order.publicNotes}</td></tr></table>
  </div>` : ""}

  <!-- ASSINATURAS -->
  <div class="signatures">
    <div class="sig-box">
      <div style="height:40px"></div>
      <div class="sig-line">Assinatura do Cliente</div>
      <div class="sig-name">${order?.client?.name || ""}</div>
    </div>
    <div class="sig-box">
      <div style="height:40px"></div>
      <div class="sig-line">Assinatura do Técnico</div>
      <div class="sig-name">${order?.technician || ""}</div>
    </div>
  </div>

  <!-- RODAPÉ -->
  <div class="footer">
    Caso o cliente não aprove o orçamento e não retire o equipamento em até 30 (trinta) dias, a empresa poderá considerá-lo abandonado, podendo destiná-lo ao descarte, reciclagem ou doação, conforme o art. 1.263 do Código Civil Brasileiro.
  </div>

</div>
</body>
</html>`;
  };

  const buildCupomHTML = () => {
    const s = services || [];
    const p = products || [];
    const sTotal = s.reduce((sum, i) => sum + Number(i.total || 0), 0);
    const pTotal = p.reduce((sum, i) => sum + Number(i.total || 0), 0);
    const lCost = Number(order?.laborCost || 0);
    const sCost = Number(order?.shippingCost || 0);
    const oCost = Number(order?.otherCosts || 0);
    const disc = Number(order?.discount || 0);
    const grandTotal = sTotal + pTotal + lCost + sCost + oCost - disc;
    const fmtR = (v: number) => v.toFixed(2).replace('.', ',');
    const fmtD = (d: Date | null | undefined) => d ? new Date(d).toLocaleDateString("pt-BR") : "__/__/____";
    const yn = (v: string | null | undefined) => v === "yes" ? "SIM" : v === "no" ? "NÃO" : "-";
    const SEP = "--------------------------------------------------------------------------";
    const addr = [order?.client?.street, order?.client?.number, order?.client?.neighborhood].filter(Boolean).join(", ") || "-";
    const city = [order?.client?.city, order?.client?.state].filter(Boolean).join(" - ") || "";

    const serviceRows = s.map(item => {
      const name = (item.description || "").padEnd(22).substring(0, 22);
      const qty = String(item.quantity || 1).padStart(4);
      const price = fmtR(Number(item.unitPrice || 0)).padStart(8);
      const disc2 = item.discount ? fmtR(Number(item.discount)).padStart(6) : "     -";
      const total = fmtR(Number(item.total || 0)).padStart(8);
      return `<tr><td>${name}</td><td style="text-align:right">${qty}</td><td style="text-align:right">${price}</td><td style="text-align:right">${disc2}</td><td style="text-align:right">${total}</td></tr>`;
    }).join("");

    const productRows = p.map(item => {
      const name = (item.description || "").padEnd(22).substring(0, 22);
      const qty = String(item.quantity || 1).padStart(4);
      const price = fmtR(Number(item.unitPrice || 0)).padStart(8);
      const disc2 = item.discount ? fmtR(Number(item.discount)).padStart(6) : "     -";
      const total = fmtR(Number(item.total || 0)).padStart(8);
      return `<tr><td>${name}</td><td style="text-align:right">${qty}</td><td style="text-align:right">${price}</td><td style="text-align:right">${disc2}</td><td style="text-align:right">${total}</td></tr>`;
    }).join("");

    const now = new Date();
    const nowStr = now.toLocaleDateString("pt-BR") + " " + now.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });

    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Cupom OS ${order?.id} - ProTech TI</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Courier New', Courier, monospace; font-size: 11px; color: #000; background: #fff; }
    .page { width: 72mm; margin: 0 auto; padding: 4mm 3mm; }
    .center { text-align: center; }
    .bold { font-weight: bold; }
    .sep { border: none; border-top: 1px dashed #555; margin: 4px 0; }
    .header-logo { display: flex; align-items: center; gap: 8px; margin-bottom: 4px; }
    .logo-box { width: 32px; height: 32px; background: #1a1a2e; border-radius: 4px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .logo-box svg { width: 20px; height: 20px; fill: #00D9FF; }
    .company-info { font-size: 10px; line-height: 1.4; }
    .company-name { font-size: 13px; font-weight: bold; }
    .os-title { text-align: center; font-size: 13px; font-weight: bold; margin: 6px 0 2px; }
    table.items { width: 100%; border-collapse: collapse; font-size: 10px; }
    table.items th { font-weight: bold; text-align: left; padding: 1px 2px; border-bottom: 1px solid #000; }
    table.items td { padding: 1px 2px; vertical-align: top; }
    table.items th:not(:first-child), table.items td:not(:first-child) { text-align: right; }
    .total-line { display: flex; justify-content: space-between; font-size: 11px; margin: 2px 0; }
    .grand-total { display: flex; justify-content: space-between; font-size: 14px; font-weight: bold; border-top: 2px solid #000; padding-top: 4px; margin-top: 4px; }
    .sig-area { display: flex; gap: 10px; margin-top: 16px; }
    .sig-box { flex: 1; text-align: center; }
    .sig-line { border-top: 1px solid #000; margin-top: 24px; padding-top: 3px; font-size: 9px; }
    .footer-note { font-size: 9px; text-align: center; margin-top: 8px; font-style: italic; }
    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      @page { size: 80mm auto; margin: 0; }
    }
  </style>
</head>
<body>
<div class="page">
  <!-- CABEÇALHO -->
  <div class="header-logo">
    <div class="logo-box">
      <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8" style="fill:none;stroke:#00D9FF;stroke-width:2"/><line x1="16" y1="13" x2="8" y2="13" style="fill:none;stroke:#00D9FF;stroke-width:2"/><line x1="16" y1="17" x2="8" y2="17" style="fill:none;stroke:#00D9FF;stroke-width:2"/></svg>
    </div>
    <div class="company-info">
      <div class="company-name">ProTech TI</div>
      <div>Soluções em Tecnologia da Informação</div>
      <div>sistema.protechti.com.br</div>
      ${order?.technician ? `<div>Vendedor: ${order.technician}</div>` : ""}
    </div>
  </div>
  <hr class="sep">

  <!-- TÍTULO DA OS -->
  <div class="os-title">ORDEM DE SERVIÇO Nº ${order?.id}</div>
  <hr class="sep">

  <!-- INFORMAÇÕES GERAIS -->
  <div><span class="bold">Data:</span> ${fmtD(order?.createdAt)}</div>
  ${order?.missingKeyboard ? `<div><span class="bold">TECLA FALTANDO:</span> ${yn(order.missingKeyboard)}</div>` : ""}
  ${order?.crackedScreen ? `<div><span class="bold">TELA TRINCADA:</span> ${yn(order.crackedScreen)}</div>` : ""}
  ${order?.missingCharger ? `<div><span class="bold">CARREGADOR:</span> ${yn(order.missingCharger)}</div>` : ""}
  ${order?.missingBag ? `<div><span class="bold">BOLSA:</span> ${yn(order.missingBag)}</div>` : ""}
  ${order?.poweringOn ? `<div><span class="bold">LIGANDO:</span> ${yn(order.poweringOn)}</div>` : ""}
  ${order?.missingPowerCable ? `<div><span class="bold">CABO DE ENERGIA:</span> ${yn(order.missingPowerCable)}</div>` : ""}
  <hr class="sep">

  <!-- CLIENTE -->
  <div><span class="bold">Cliente:</span> ${order?.client?.name || "-"}</div>
  ${order?.client?.cnpjCpf ? `<div><span class="bold">CNPJ/CPF:</span> ${order.client.cnpjCpf}</div>` : ""}
  ${addr !== "-" ? `<div><span class="bold">Endereço:</span> ${addr}</div>` : ""}
  ${city ? `<div><span class="bold">Cidade:</span> ${city}</div>` : ""}
  ${order?.client?.phone ? `<div><span class="bold">Telefone:</span> ${order.client.phone}</div>` : ""}
  ${order?.client?.email ? `<div><span class="bold">E-mail:</span> ${order.client.email}</div>` : ""}
  <hr class="sep">

  <!-- EQUIPAMENTO -->
  <div class="center bold">EQUIPAMENTO</div>
  <hr class="sep">
  <table class="items">
    <thead><tr><th>Nome</th><th>Marca</th><th>Modelo</th><th>Série</th></tr></thead>
    <tbody>
      <tr>
        <td>${order?.equipmentName || "-"}</td>
        <td style="text-align:right">${order?.equipmentBrand || "-"}</td>
        <td style="text-align:right">${order?.equipmentModel || "-"}</td>
        <td style="text-align:right">${order?.equipmentSerial || "-"}</td>
      </tr>
    </tbody>
  </table>
  ${order?.reportedDefects ? `<hr class="sep"><div><span class="bold">Condições</span></div><div>${order.reportedDefects}</div>` : ""}
  <hr class="sep">

  ${s.length > 0 ? `
  <!-- SERVIÇOS -->
  <div class="center bold">DETALHES DO SERVIÇO</div>
  <hr class="sep">
  <table class="items">
    <thead><tr><th>NOME</th><th>QTD</th><th>VL.UNT.</th><th>DESC</th><th>TOTAL</th></tr></thead>
    <tbody>${serviceRows}</tbody>
  </table>
  <div class="total-line"><span>Total dos serviços:</span><span>${fmtR(sTotal)}</span></div>
  <hr class="sep">` : ""}

  ${p.length > 0 ? `
  <!-- PRODUTOS -->
  <div class="center bold">DETALHES DA VENDA</div>
  <hr class="sep">
  <table class="items">
    <thead><tr><th>NOME</th><th>QTD</th><th>VL.UNT</th><th>DESC</th><th>TOTAL</th></tr></thead>
    <tbody>${productRows}</tbody>
  </table>
  <hr class="sep">` : ""}

  <!-- TOTAIS -->
  ${lCost > 0 ? `<div class="total-line"><span>Mão de Obra:</span><span>${fmtR(lCost)}</span></div>` : ""}
  ${sCost > 0 ? `<div class="total-line"><span>Frete:</span><span>${fmtR(sCost)}</span></div>` : ""}
  ${oCost > 0 ? `<div class="total-line"><span>Outros:</span><span>${fmtR(oCost)}</span></div>` : ""}
  ${disc > 0 ? `<div class="total-line"><span>Desconto:</span><span>- ${fmtR(disc)}</span></div>` : ""}
  <div class="grand-total"><span>Total da ordem de serviço:</span><span>${fmtR(grandTotal)}</span></div>
  <hr class="sep">

  <!-- OBSERVAÇÕES -->
  <div class="center bold">OBSERVAÇÕES</div>
  <hr class="sep">
  <div style="font-size:9px">${order?.publicNotes || "Caso o cliente não aprove o orçamento e não retire o equipamento em até 30 (trinta) dias, a empresa poderá considerá-lo abandonado, podendo destiná-lo ao descarte, reciclagem ou doação, conforme o art. 1.263 do Código Civil Brasileiro."}</div>
  <hr class="sep">
  <div class="center bold footer-note">*** Este cupom não é documento fiscal ***</div>
  <hr class="sep">

  <!-- DATAS -->
  <div style="display:flex;justify-content:space-between;font-size:10px">
    <span>Ent.: ${nowStr}</span>
    <span>Saída: __/__/____ __:__</span>
  </div>

  <!-- ASSINATURAS -->
  <div class="sig-area">
    <div class="sig-box">
      <div class="sig-line">Assinatura do cliente</div>
    </div>
    <div class="sig-box">
      <div class="sig-line">Assinatura do técnico</div>
    </div>
  </div>
</div>
</body>
</html>`;
  };

  const handlePrintCupom = () => {
    const html = buildCupomHTML();
    const printWindow = window.open("", "", "height=900,width=400");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const handlePrint = () => {
    const html = buildPrintHTML();
    const printWindow = window.open("", "", "height=900,width=900");
    if (printWindow) {
      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    }
  };

  const handleDownloadPDF = () => {
    const html = buildPrintHTML();
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    iframe.contentDocument?.write(html);
    iframe.contentDocument?.close();
    setTimeout(() => {
      html2canvas(iframe.contentDocument?.body || document.body, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgWidth = 210;
        const pageHeight = 297;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }
        pdf.save(`OS-${order?.id}.pdf`);
        document.body.removeChild(iframe);
      });
    }, 500);
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
          <Button variant="outline" size="sm" onClick={handlePrintCupom}>
            <Printer className="w-4 h-4 mr-1" />
            Cupom
          </Button>
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-1" />
            Imprimir A4
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
