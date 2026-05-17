# ProTech OS - TODO

## Equipamentos
- [x] Salvar equipamento com todos os dados (nome, marca, modelo, série, etiqueta)
- [x] Exibir etiqueta de controle na página de edição da OS
- [x] Validar etiqueta única em todo o sistema
- [ ] Permitir selecionar equipamento existente ao criar OS
- [x] Criar página de histórico de manutenção por equipamento

## Ordens de Serviço
- [x] Criar nova OS com cliente e equipamento
- [x] Editar OS existente
- [ ] Validar campos obrigatórios no formulário
- [ ] Implementar busca avançada de OS
- [x] Remover prefixo "OS-" do número da OS (exibir apenas número)
- [x] Renomear campo para "Ordem de Serviço"
- [x] Adicionar campo de Origem (Anúncio, Cliente, Indicação, BNI, Cliente Novo)
- [x] Adicionar campo Teclado faltando (Sim/Não)
- [x] Adicionar campo Tela trincada (Sim/Não)
- [x] Adicionar campo Carregador (Sim/Não)
- [x] Adicionar campo Bolsa (Sim/Não)
- [x] Adicionar campo Ligando (Sim/Não)
- [x] Adicionar campo Cabo de energia (Sim/Não)
- [x] Adicionar campo Senha (texto livre)
- [x] Implementar tabela de Serviços/Produtos com preenchimento manual
- [x] Adicionar colunas: Produto/Serviço, Detalhes, Qtd, Valor, Desconto, Subtotal

## Clientes
- [x] Listar clientes
- [x] Criar novo cliente
- [ ] Editar cliente existente
- [ ] Deletar cliente

## Geral
- [x] Autenticação com Manus OAuth
- [x] Dashboard com estatísticas
- [x] Relatórios de OS por período com filtro de data
- [ ] Exportar OS em PDF

## Ações na Ordem de Serviço (Menu)

### Documentos e Impressão
- [ ] Link de cobrança (gerar link de pagamento)
- [ ] Imprimir (gerar PDF para impressão)
- [ ] Formato A4 (exportar em tamanho A4)
- [ ] Cupom (gerar cupom fiscal)
- [ ] Etiqueta (gerar etiqueta de identificação)
- [ ] Produção (gerar ordem de produção/serviço)

### Gerenciamento de Status
- [ ] Alterar situação (mudar status da OS)
- [ ] Compartilhar (enviar OS para outro usuário/departamento)
  - [ ] Via E-mail
  - [ ] Via WhatsApp

### Assinatura e Documentos
- [ ] Emitir (gerar documento oficial)
- [ ] e-Assinatura (assinar digitalmente)
- [ ] Atividade (registrar atividades/atualizações)
- [ ] Compromisso (registrar compromissos/prazos)
- [ ] Cópia (duplicar OS)
- [ ] Devolução (processar devolução de equipamento)

### Notas Fiscais (Implementar por último)
- [ ] NFS-e (Nota Fiscal de Serviço eletrônica)
- [ ] NF-e (Nota Fiscal eletrônica)
- [ ] NFC-e (Nota Fiscal do Consumidor eletrônica)

### Relatórios
- [ ] Gerar (gerar relatórios da OS)

## Melhorias OSForm e OSDetail
- [x] Corrigir validação de equipamento existente na edição de OS (não acusar etiqueta duplicada ao editar)
- [x] Adicionar campo de desconto com opção % ou valor fixo no formulário de OS
- [x] Corrigir cálculo do desconto ao salvar (salvar valor monetário calculado, não o percentual bruto)
- [x] Persistir discountType no banco para restaurar ao editar
- [x] Exibir desconto na visualização da OS para o cliente
- [x] Criar template de impressão em cupom térmico (80mm) baseado no modelo do sistema antigo
- [x] Separar botões de impressão: Formato A4 e Cupom

## Desconto por item (serviço/produto)
- [x] Adicionar seletor R$/% em cada linha de serviço no OSForm
- [x] Adicionar seletor R$/% em cada linha de produto no OSForm
- [x] Ajustar cálculo de subtotal por item para respeitar o tipo de desconto
- [x] Persistir discountType por item no banco e restaurar ao editar

## Coluna de desconto por item na visualização e impressão
- [x] Adicionar coluna Desc nas tabelas de Serviços e Produtos do JSX da OSDetail
- [x] Adicionar coluna Desc no template de impressão A4 (buildPrintHTML)
