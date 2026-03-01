import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Layout from "@/components/Layout";
import { Edit, Printer, Download } from "lucide-react";
import { useLocation } from "wouter";

/**
 * OSDetail - Visualização detalhada de uma Ordem de Serviço
 * Design: Dark Tech Professional com layout de impressão
 */
export default function OSDetail() {
  const [, navigate] = useLocation();

  // Mock data - será substituído por chamadas à API
  const ordem = {
    numero: "705",
    data: "20/02/2026",
    entrada: "20/02/2026 - 09:32",
    saida: "20/02/2026 - 15:45",
    cliente: {
      nome: "SAULO PARAGUASSU",
      cnpjCpf: "329.350.928-21",
      endereco: "Rua São Váldomiro, 440 (apto 62)",
      bairro: "Jardim Santa Luzia",
      cep: "15080-070",
      cidade: "São José do Rio Preto",
      estado: "SP",
      telefone: "(17) 99776-7186",
      email: "saulo.paraguassu@gmail.com",
    },
    equipamento: {
      nome: "NOTEBOOK",
      marca: "ACER",
      modelo: "A515-5UX",
      serie: "E2134",
    },
    defeitos: "TECLADO ALGUMAS TECLAS E OUTRAS NÃO. TRACKPAD NÃO FUNCIONA E TELA PISCA DE VEZ EM QUANDO",
    solucao: "TROCA DO TECLADO, REPARO DA CARCAÇA E LIMPEZA",
    laudo: "TRACKPAD FUNCIONANDO NORMALMENTE ESTAVA APENAS DESABILITADO. TECLADO NECESSITA DE TROCA. FAZENDO AVALIAÇÃO CONSTATAMOS QUE A DOBRADIÇA ESQUERDA ESTÁ QUEBRADA. NOTEBOOK SUJO INTERNAMENTE NECESSITANDO DE LIMPEZA.",
    servicos: [
      { nome: "M.O TROCA TECLADO COM REBITE", quantidade: 1, valorUnitario: 180.0, subtotal: 180.0 },
    ],
    produtos: [
      { nome: "TECLADO ACER A515", unidade: "UN", quantidade: 1, valorUnitario: 120.0, subtotal: 120.0 },
    ],
    totais: {
      servicos: 180.0,
      produtos: 120.0,
      geral: 300.0,
    },
    pagamento: {
      vencimento: "20/02/2026",
      valor: 300.0,
      forma: "A Combinar",
      observacao: "Caso o cliente não aprove o orçamento e não retire o equipamento em até 30 (trinta) dias, a empresa poderá considerá-lo abandonado, podendo destiná-lo ao descarte, reciclagem ou doação, conforme o art. 1.263 do Código Civil Brasileiro.",
    },
    status: "Concluído",
  };

  return (
    <Layout>
      <div className="container py-8 max-w-4xl">
        {/* Page Title */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Ordem de Serviço #{ordem.numero}
            </h1>
            <p className="text-muted-foreground">Visualize e gerencie os detalhes da OS</p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => navigate(`/os/edit/${ordem.numero}`)}
              variant="outline"
              className="gap-2"
            >
              <Edit className="w-4 h-4" />
              Editar
            </Button>
            <Button className="btn-glow gap-2">
              <Printer className="w-4 h-4" />
              Imprimir
            </Button>
          </div>
        </div>

        {/* Status Badge */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              {ordem.status}
            </span>
          </div>
          <Button variant="outline" className="gap-2">
            <Download className="w-4 h-4" />
            Baixar PDF
          </Button>
        </div>

        {/* Cabeçalho */}
        <Card className="card-float p-8 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Número da OS</h3>
              <p className="text-3xl font-bold text-accent">{ordem.numero}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Data de Emissão</h3>
              <p className="text-2xl font-semibold text-foreground">{ordem.data}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6 border-t border-border">
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Entrada</h3>
              <p className="text-foreground">{ordem.entrada}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Saída</h3>
              <p className="text-foreground">{ordem.saida}</p>
            </div>
          </div>
        </Card>

        {/* Dados do Cliente */}
        <Card className="card-float p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Dados do Cliente</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Nome/Razão Social</h3>
              <p className="text-foreground font-semibold">{ordem.cliente.nome}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">CNPJ/CPF</h3>
              <p className="text-foreground">{ordem.cliente.cnpjCpf}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Telefone</h3>
              <p className="text-foreground">{ordem.cliente.telefone}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">E-mail</h3>
              <p className="text-foreground">{ordem.cliente.email}</p>
            </div>
            <div className="md:col-span-2">
              <h3 className="text-sm text-muted-foreground mb-2">Endereço</h3>
              <p className="text-foreground">
                {ordem.cliente.endereco}, {ordem.cliente.bairro}, {ordem.cliente.cep}
              </p>
              <p className="text-foreground">
                {ordem.cliente.cidade} - {ordem.cliente.estado}
              </p>
            </div>
          </div>
        </Card>

        {/* Equipamento */}
        <Card className="card-float p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Equipamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Nome</h3>
              <p className="text-foreground font-semibold">{ordem.equipamento.nome}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Marca</h3>
              <p className="text-foreground">{ordem.equipamento.marca}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Modelo</h3>
              <p className="text-foreground">{ordem.equipamento.modelo}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Série</h3>
              <p className="text-foreground">{ordem.equipamento.serie}</p>
            </div>
          </div>
          <div className="pt-6 border-t border-border">
            <h3 className="text-sm text-muted-foreground mb-2">Defeitos</h3>
            <p className="text-foreground whitespace-pre-wrap">{ordem.defeitos}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="text-sm text-muted-foreground mb-2">Solução</h3>
            <p className="text-foreground whitespace-pre-wrap">{ordem.solucao}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <h3 className="text-sm text-muted-foreground mb-2">Laudo Técnico</h3>
            <p className="text-foreground whitespace-pre-wrap">{ordem.laudo}</p>
          </div>
        </Card>

        {/* Serviços */}
        <Card className="card-float p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Serviços</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-sm font-semibold text-foreground">
                    Nome
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-foreground">
                    Quantidade
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-foreground">
                    Valor Unitário
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-foreground">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordem.servicos.map((servico, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-3 text-foreground">{servico.nome}</td>
                    <td className="text-right py-3 text-foreground">{servico.quantidade}</td>
                    <td className="text-right py-3 text-foreground">
                      R$ {servico.valorUnitario.toFixed(2)}
                    </td>
                    <td className="text-right py-3 text-accent font-semibold">
                      R$ {servico.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-right text-foreground font-semibold">
              Total: <span className="text-accent">R$ {ordem.totais.servicos.toFixed(2)}</span>
            </p>
          </div>
        </Card>

        {/* Produtos */}
        <Card className="card-float p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Produtos</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 text-sm font-semibold text-foreground">
                    Nome
                  </th>
                  <th className="text-center py-3 text-sm font-semibold text-foreground">
                    Unidade
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-foreground">
                    Quantidade
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-foreground">
                    Valor Unitário
                  </th>
                  <th className="text-right py-3 text-sm font-semibold text-foreground">
                    Subtotal
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordem.produtos.map((produto, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-3 text-foreground">{produto.nome}</td>
                    <td className="text-center py-3 text-foreground">{produto.unidade}</td>
                    <td className="text-right py-3 text-foreground">{produto.quantidade}</td>
                    <td className="text-right py-3 text-foreground">
                      R$ {produto.valorUnitario.toFixed(2)}
                    </td>
                    <td className="text-right py-3 text-accent font-semibold">
                      R$ {produto.subtotal.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-right text-foreground font-semibold">
              Total: <span className="text-accent">R$ {ordem.totais.produtos.toFixed(2)}</span>
            </p>
          </div>
        </Card>

        {/* Totalizações */}
        <Card className="card-float p-8 mb-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <span className="text-foreground">Serviços:</span>
              <span className="text-foreground">R$ {ordem.totais.servicos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pb-4 border-b border-border">
              <span className="text-foreground">Produtos:</span>
              <span className="text-foreground">R$ {ordem.totais.produtos.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-lg font-bold text-foreground">Total Geral:</span>
              <span className="text-3xl font-bold text-accent">
                R$ {ordem.totais.geral.toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        {/* Pagamento */}
        <Card className="card-float p-8 mb-6">
          <h2 className="text-2xl font-bold text-foreground mb-6">Pagamento</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Vencimento</h3>
              <p className="text-foreground font-semibold">{ordem.pagamento.vencimento}</p>
            </div>
            <div>
              <h3 className="text-sm text-muted-foreground mb-2">Forma de Pagamento</h3>
              <p className="text-foreground">{ordem.pagamento.forma}</p>
            </div>
          </div>
          <div className="pt-6 border-t border-border">
            <h3 className="text-sm text-muted-foreground mb-2">Observações</h3>
            <p className="text-foreground text-sm whitespace-pre-wrap">
              {ordem.pagamento.observacao}
            </p>
          </div>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4 mb-8">
          <Button
            onClick={() => navigate("/os/list")}
            variant="outline"
            className="flex-1"
          >
            Voltar à Lista
          </Button>
          <Button
            onClick={() => navigate(`/os/edit/${ordem.numero}`)}
            className="btn-glow flex-1 gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar
          </Button>
        </div>
      </div>
    </Layout>
  );
}
