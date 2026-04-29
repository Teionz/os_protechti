import React from "react";

interface OrderData {
  id: number;
  status: string;
  createdAt: Date;
  entryDate: Date;
  exitDate: Date;
  laborCost: number;
  shippingCost: number;
  otherCosts: number;
  discount: number;
  publicNotes?: string;
  internalNotes?: string;
  client: {
    name: string;
    cpfCnpj: string;
    phone: string;
    email: string;
    address: string;
  };
  equipment: {
    name: string;
    brand: string;
    model: string;
    serial: string;
    tag: string;
    defects: string;
    solution?: string;
    diagnosis?: string;
  };
  services: Array<{
    id: number;
    description: string;
    details?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }>;
  products: Array<{
    id: number;
    description: string;
    details?: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    total: number;
  }>;
}

interface OSPrintTemplateProps {
  order: OrderData;
  forPrint?: boolean;
}

export const OSPrintTemplate: React.FC<OSPrintTemplateProps> = ({
  order,
  forPrint = false,
}) => {
  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString("pt-BR");
  };

  const formatTime = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
  };

  const toNumber = (value: any) => {
    const num = parseFloat(value);
    return isNaN(num) ? 0 : num;
  };

  const totalServicos = order.services.reduce(
    (sum, item) => sum + toNumber(item.total),
    0
  );
  const totalProdutos = order.products.reduce(
    (sum, item) => sum + toNumber(item.total),
    0
  );
  const subtotal = totalServicos + totalProdutos;
  const total =
    subtotal +
    toNumber(order.laborCost) +
    toNumber(order.shippingCost) +
    toNumber(order.otherCosts) -
    toNumber(order.discount);

  const printStyles = forPrint
    ? `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      background: white;
      line-height: 1.6;
    }
    .print-container {
      max-width: 210mm;
      height: 297mm;
      margin: 0 auto;
      padding: 20mm;
      background: white;
    }
    .header {
      text-align: center;
      margin-bottom: 30px;
      border-bottom: 2px solid #333;
      padding-bottom: 15px;
    }
    .header h1 {
      font-size: 28px;
      margin-bottom: 5px;
    }
    .header p {
      font-size: 12px;
      color: #666;
    }
    .section {
      margin-bottom: 20px;
    }
    .section-title {
      font-size: 14px;
      font-weight: bold;
      background: #f0f0f0;
      padding: 8px 12px;
      margin-bottom: 10px;
      border-left: 4px solid #0099cc;
    }
    .section-content {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
      font-size: 12px;
    }
    .field {
      display: flex;
      flex-direction: column;
    }
    .field-label {
      font-weight: bold;
      color: #666;
      font-size: 11px;
      margin-bottom: 3px;
    }
    .field-value {
      color: #333;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0;
      font-size: 11px;
    }
    th {
      background: #0099cc;
      color: white;
      padding: 8px;
      text-align: left;
      font-weight: bold;
    }
    td {
      border-bottom: 1px solid #ddd;
      padding: 6px 8px;
    }
    tr:nth-child(even) {
      background: #f9f9f9;
    }
    .total-row {
      font-weight: bold;
      background: #f0f0f0;
    }
    .summary {
      margin-top: 20px;
      border-top: 2px solid #333;
      padding-top: 15px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 12px;
    }
    .summary-total {
      display: flex;
      justify-content: space-between;
      font-size: 16px;
      font-weight: bold;
      color: #0099cc;
      margin-top: 10px;
      padding-top: 10px;
      border-top: 1px solid #ddd;
    }
    .notes {
      margin-top: 15px;
      font-size: 11px;
      padding: 10px;
      background: #f9f9f9;
      border-left: 3px solid #0099cc;
    }
    .notes-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    @media print {
      body {
        margin: 0;
        padding: 0;
      }
      .print-container {
        max-width: 100%;
        height: auto;
        margin: 0;
        padding: 0;
      }
    }
  `
    : "";

  return (
    <>
      {forPrint && <style>{printStyles}</style>}
      <div
        className={
          forPrint
            ? "print-container"
            : "p-8 bg-white text-gray-900 max-w-4xl mx-auto"
        }
      >
        {/* Header */}
        <div className={forPrint ? "header" : "text-center mb-8 pb-4 border-b-2"}>
          <h1 className={forPrint ? "" : "text-3xl font-bold"}>
            ORDEM DE SERVIÇO
          </h1>
          <p className={forPrint ? "" : "text-gray-600"}>
            #{order.id.toString().padStart(6, "0")}
          </p>
        </div>

        {/* Datas */}
        <div className={forPrint ? "section" : "mb-6"}>
          <div className={forPrint ? "section-content" : "grid grid-cols-4 gap-4"}>
            <div className={forPrint ? "field" : ""}>
              <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                Emissão
              </span>
              <span className={forPrint ? "field-value" : ""}>
                {formatDate(order.createdAt)}
              </span>
            </div>
            <div className={forPrint ? "field" : ""}>
              <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                Entrada
              </span>
              <span className={forPrint ? "field-value" : ""}>
                {formatDate(order.entryDate)} - {formatTime(order.entryDate)}
              </span>
            </div>
            <div className={forPrint ? "field" : ""}>
              <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                Saída
              </span>
              <span className={forPrint ? "field-value" : ""}>
                {formatDate(order.exitDate)} - {formatTime(order.exitDate)}
              </span>
            </div>
            <div className={forPrint ? "field" : ""}>
              <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                Status
              </span>
              <span className={forPrint ? "field-value" : ""}>
                {order.status === "completed"
                  ? "Concluído"
                  : order.status === "in_progress"
                  ? "Em Andamento"
                  : order.status === "budgeting"
                  ? "Orçando"
                  : order.status === "awaiting_approval"
                  ? "Aguardando Aprovação"
                  : order.status === "awaiting_pickup"
                  ? "Aguardando Retirada"
                  : order.status}
              </span>
            </div>
          </div>
        </div>

        {/* Cliente */}
        <div className={forPrint ? "section" : "mb-6"}>
          <div className={forPrint ? "section-title" : "font-bold mb-3"}>
            DADOS DO CLIENTE
          </div>
          <div className={forPrint ? "section-content" : "grid grid-cols-2 gap-4"}>
            <div className={forPrint ? "field" : ""}>
              <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                Nome/Razão Social
              </span>
              <span className={forPrint ? "field-value" : ""}>
                {order.client.name}
              </span>
            </div>
            <div className={forPrint ? "field" : ""}>
              <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                CPF/CNPJ
              </span>
              <span className={forPrint ? "field-value" : ""}>
                {order.client.cpfCnpj}
              </span>
            </div>
            <div className={forPrint ? "field" : ""}>
              <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                Telefone
              </span>
              <span className={forPrint ? "field-value" : ""}>
                {order.client.phone}
              </span>
            </div>
            <div className={forPrint ? "field" : ""}>
              <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                E-mail
              </span>
              <span className={forPrint ? "field-value" : ""}>
                {order.client.email}
              </span>
            </div>
            <div className={forPrint ? "field" : "col-span-2"}>
              <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                Endereço
              </span>
              <span className={forPrint ? "field-value" : ""}>
                {order.client.address}
              </span>
            </div>
          </div>
        </div>

        {/* Equipamento */}
        <div className={forPrint ? "section" : "mb-6"}>
          <div className={forPrint ? "section-title" : "font-bold mb-3"}>
            EQUIPAMENTO
          </div>
          <div className={forPrint ? "section-content" : "grid grid-cols-2 gap-4"}>
            <div className={forPrint ? "field" : ""}>
              <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                Nome
              </span>
              <span className={forPrint ? "field-value" : ""}>
                {order.equipment.name}
              </span>
            </div>
            <div className={forPrint ? "field" : ""}>
              <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                Marca
              </span>
              <span className={forPrint ? "field-value" : ""}>
                {order.equipment.brand}
              </span>
            </div>
            <div className={forPrint ? "field" : ""}>
              <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                Modelo
              </span>
              <span className={forPrint ? "field-value" : ""}>
                {order.equipment.model}
              </span>
            </div>
            <div className={forPrint ? "field" : ""}>
              <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                Série
              </span>
              <span className={forPrint ? "field-value" : ""}>
                {order.equipment.serial}
              </span>
            </div>
            <div className={forPrint ? "field" : ""}>
              <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                Etiqueta
              </span>
              <span className={forPrint ? "field-value" : ""}>
                {order.equipment.tag}
              </span>
            </div>
            <div className={forPrint ? "field col-span-2" : "col-span-2"}>
              <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                Defeitos Relatados
              </span>
              <span className={forPrint ? "field-value" : ""}>
                {order.equipment.defects}
              </span>
            </div>
            {order.equipment.diagnosis && (
              <div className={forPrint ? "field col-span-2" : "col-span-2"}>
                <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                  Laudo Técnico
                </span>
                <span className={forPrint ? "field-value" : ""}>
                  {order.equipment.diagnosis}
                </span>
              </div>
            )}
            {order.equipment.solution && (
              <div className={forPrint ? "field col-span-2" : "col-span-2"}>
                <span className={forPrint ? "field-label" : "text-xs text-gray-600"}>
                  Solução Proposta
                </span>
                <span className={forPrint ? "field-value" : ""}>
                  {order.equipment.solution}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Serviços */}
        {order.services.length > 0 && (
          <div className={forPrint ? "section" : "mb-6"}>
            <div className={forPrint ? "section-title" : "font-bold mb-3"}>
              SERVIÇOS
            </div>
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Detalhes</th>
                  <th style={{ textAlign: "right" }}>Qtd</th>
                  <th style={{ textAlign: "right" }}>Valor Unit.</th>
                  <th style={{ textAlign: "right" }}>Desc %</th>
                  <th style={{ textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.services.map((servico) => (
                  <tr key={servico.id}>
                    <td>{servico.description}</td>
                    <td>{servico.details || "-"}</td>
                    <td style={{ textAlign: "right" }}>{servico.quantity}</td>
                    <td style={{ textAlign: "right" }}>
                      R$ {toNumber(servico.unitPrice).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {toNumber(servico.discount)}%
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      R$ {toNumber(servico.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className={forPrint ? "total-row" : ""}>
                  <td colSpan={5} style={{ textAlign: "right" }}>
                    Total Serviços:
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "bold" }}>
                    R$ {totalServicos.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Produtos */}
        {order.products.length > 0 && (
          <div className={forPrint ? "section" : "mb-6"}>
            <div className={forPrint ? "section-title" : "font-bold mb-3"}>
              PRODUTOS
            </div>
            <table>
              <thead>
                <tr>
                  <th>Descrição</th>
                  <th>Detalhes</th>
                  <th style={{ textAlign: "right" }}>Qtd</th>
                  <th style={{ textAlign: "right" }}>Valor Unit.</th>
                  <th style={{ textAlign: "right" }}>Desc %</th>
                  <th style={{ textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.products.map((produto) => (
                  <tr key={produto.id}>
                    <td>{produto.description}</td>
                    <td>{produto.details || "-"}</td>
                    <td style={{ textAlign: "right" }}>{produto.quantity}</td>
                    <td style={{ textAlign: "right" }}>
                      R$ {toNumber(produto.unitPrice).toFixed(2)}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      {toNumber(produto.discount)}%
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "bold" }}>
                      R$ {toNumber(produto.total).toFixed(2)}
                    </td>
                  </tr>
                ))}
                <tr className={forPrint ? "total-row" : ""}>
                  <td colSpan={5} style={{ textAlign: "right" }}>
                    Total Produtos:
                  </td>
                  <td style={{ textAlign: "right", fontWeight: "bold" }}>
                    R$ {totalProdutos.toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {/* Resumo Financeiro */}
        <div className={forPrint ? "summary" : "mb-6"}>
          <div className={forPrint ? "" : "font-bold mb-3"}>
            RESUMO FINANCEIRO
          </div>
          <div className={forPrint ? "summary-row" : "flex justify-between mb-2"}>
            <span>Serviços:</span>
            <span>R$ {totalServicos.toFixed(2)}</span>
          </div>
          <div className={forPrint ? "summary-row" : "flex justify-between mb-2"}>
            <span>Produtos:</span>
            <span>R$ {totalProdutos.toFixed(2)}</span>
          </div>
          <div className={forPrint ? "summary-row" : "flex justify-between mb-2"}>
            <span>Mão de Obra:</span>
            <span>R$ {toNumber(order.laborCost).toFixed(2)}</span>
          </div>
          <div className={forPrint ? "summary-row" : "flex justify-between mb-2"}>
            <span>Frete:</span>
            <span>R$ {toNumber(order.shippingCost).toFixed(2)}</span>
          </div>
          <div className={forPrint ? "summary-row" : "flex justify-between mb-2"}>
            <span>Outros:</span>
            <span>R$ {toNumber(order.otherCosts).toFixed(2)}</span>
          </div>
          <div className={forPrint ? "summary-row" : "flex justify-between mb-2"}>
            <span>Subtotal:</span>
            <span>R$ {subtotal.toFixed(2)}</span>
          </div>
          <div className={forPrint ? "summary-row" : "flex justify-between mb-2"}>
            <span>Desconto:</span>
            <span>-R$ {toNumber(order.discount).toFixed(2)}</span>
          </div>
          <div className={forPrint ? "summary-total" : "flex justify-between text-lg font-bold text-blue-600 mt-4 pt-2 border-t"}>
            <span>TOTAL:</span>
            <span>R$ {total.toFixed(2)}</span>
          </div>
        </div>

        {/* Observações */}
        {(order.publicNotes || order.internalNotes) && (
          <div className={forPrint ? "notes" : "mt-6 p-4 bg-gray-100 rounded"}>
            {order.publicNotes && (
              <div className={forPrint ? "" : "mb-3"}>
                <div className={forPrint ? "notes-title" : "font-bold text-sm mb-1"}>
                  Observações Públicas:
                </div>
                <p className={forPrint ? "" : "text-sm whitespace-pre-wrap"}>
                  {order.publicNotes}
                </p>
              </div>
            )}
            {order.internalNotes && (
              <div>
                <div className={forPrint ? "notes-title" : "font-bold text-sm mb-1"}>
                  Observações Internas:
                </div>
                <p className={forPrint ? "" : "text-sm whitespace-pre-wrap"}>
                  {order.internalNotes}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
};
