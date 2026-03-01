# Esquema do Banco de Dados - ProTech OS

## Visão Geral

Este documento descreve a estrutura do banco de dados MySQL para o sistema de gestão de Ordens de Serviço (OS) da ProTech TI. O banco foi projetado para armazenar informações de clientes, equipamentos, serviços, produtos e ordens de serviço.

## Tabelas

### 1. `usuarios`

Armazena informações de usuários do sistema.

```sql
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 2. `clientes`

Armazena dados dos clientes.

```sql
CREATE TABLE clientes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  cnpj_cpf VARCHAR(20),
  endereco VARCHAR(255),
  numero VARCHAR(20),
  complemento VARCHAR(255),
  bairro VARCHAR(100),
  cep VARCHAR(10),
  cidade VARCHAR(100),
  estado VARCHAR(2),
  telefone VARCHAR(20),
  email VARCHAR(255),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_cnpj_cpf (cnpj_cpf)
);
```

### 3. `equipamentos`

Armazena informações sobre equipamentos.

```sql
CREATE TABLE equipamentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  cliente_id INT NOT NULL,
  nome VARCHAR(255) NOT NULL,
  marca VARCHAR(100),
  modelo VARCHAR(100),
  serie VARCHAR(100),
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE CASCADE,
  INDEX idx_cliente_id (cliente_id)
);
```

### 4. `servicos_tabela`

Armazena serviços disponíveis no sistema.

```sql
CREATE TABLE servicos_tabela (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  valor_padrao DECIMAL(10, 2),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nome (nome)
);
```

### 5. `produtos_tabela`

Armazena produtos disponíveis no sistema.

```sql
CREATE TABLE produtos_tabela (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  unidade VARCHAR(20),
  valor_padrao DECIMAL(10, 2),
  estoque INT DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nome (nome)
);
```

### 6. `ordens_servico`

Armazena as ordens de serviço.

```sql
CREATE TABLE ordens_servico (
  id INT PRIMARY KEY AUTO_INCREMENT,
  numero VARCHAR(20) NOT NULL UNIQUE,
  cliente_id INT NOT NULL,
  equipamento_id INT,
  usuario_id INT NOT NULL,
  data_emissao DATE NOT NULL,
  entrada_data DATETIME,
  saida_data DATETIME,
  origem VARCHAR(50),
  carregador BOOLEAN DEFAULT FALSE,
  ligando BOOLEAN DEFAULT FALSE,
  defeitos LONGTEXT,
  solucao LONGTEXT,
  laudo_tecnico LONGTEXT,
  status VARCHAR(50) DEFAULT 'PENDENTE',
  observacoes LONGTEXT,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id) ON DELETE RESTRICT,
  FOREIGN KEY (equipamento_id) REFERENCES equipamentos(id) ON DELETE SET NULL,
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE RESTRICT,
  INDEX idx_numero (numero),
  INDEX idx_cliente_id (cliente_id),
  INDEX idx_data_emissao (data_emissao),
  INDEX idx_status (status)
);
```

### 7. `os_servicos`

Armazena os serviços associados a cada ordem de serviço.

```sql
CREATE TABLE os_servicos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ordem_servico_id INT NOT NULL,
  servico_id INT,
  nome VARCHAR(255) NOT NULL,
  quantidade DECIMAL(10, 2) NOT NULL,
  valor_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ordem_servico_id) REFERENCES ordens_servico(id) ON DELETE CASCADE,
  FOREIGN KEY (servico_id) REFERENCES servicos_tabela(id) ON DELETE SET NULL,
  INDEX idx_ordem_servico_id (ordem_servico_id)
);
```

### 8. `os_produtos`

Armazena os produtos associados a cada ordem de serviço.

```sql
CREATE TABLE os_produtos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ordem_servico_id INT NOT NULL,
  produto_id INT,
  nome VARCHAR(255) NOT NULL,
  unidade VARCHAR(20),
  quantidade DECIMAL(10, 2) NOT NULL,
  valor_unitario DECIMAL(10, 2) NOT NULL,
  subtotal DECIMAL(10, 2) GENERATED ALWAYS AS (quantidade * valor_unitario) STORED,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (ordem_servico_id) REFERENCES ordens_servico(id) ON DELETE CASCADE,
  FOREIGN KEY (produto_id) REFERENCES produtos_tabela(id) ON DELETE SET NULL,
  INDEX idx_ordem_servico_id (ordem_servico_id)
);
```

### 9. `pagamentos`

Armazena informações de pagamento das ordens de serviço.

```sql
CREATE TABLE pagamentos (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ordem_servico_id INT NOT NULL UNIQUE,
  vencimento DATE,
  valor DECIMAL(10, 2) NOT NULL,
  forma_pagamento VARCHAR(50),
  observacao LONGTEXT,
  pago BOOLEAN DEFAULT FALSE,
  data_pagamento DATE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (ordem_servico_id) REFERENCES ordens_servico(id) ON DELETE CASCADE,
  INDEX idx_vencimento (vencimento),
  INDEX idx_pago (pago)
);
```

## Relacionamentos

| Tabela | Relacionamento | Descrição |
|--------|---|---|
| `ordens_servico` → `clientes` | N:1 | Cada OS pertence a um cliente |
| `ordens_servico` → `equipamentos` | N:1 | Cada OS pode estar associada a um equipamento |
| `ordens_servico` → `usuarios` | N:1 | Cada OS é criada por um usuário |
| `os_servicos` → `ordens_servico` | N:1 | Múltiplos serviços por OS |
| `os_servicos` → `servicos_tabela` | N:1 | Referência ao catálogo de serviços |
| `os_produtos` → `ordens_servico` | N:1 | Múltiplos produtos por OS |
| `os_produtos` → `produtos_tabela` | N:1 | Referência ao catálogo de produtos |
| `pagamentos` → `ordens_servico` | 1:1 | Uma OS tem um registro de pagamento |
| `equipamentos` → `clientes` | N:1 | Múltiplos equipamentos por cliente |

## Índices

Os índices foram criados para otimizar as consultas mais frequentes:

- **Busca por email:** `usuarios.email`, `clientes.email`
- **Busca por CNPJ/CPF:** `clientes.cnpj_cpf`
- **Busca por número de OS:** `ordens_servico.numero`
- **Filtros por cliente:** `ordens_servico.cliente_id`, `equipamentos.cliente_id`
- **Filtros por data:** `ordens_servico.data_emissao`, `pagamentos.vencimento`
- **Filtros por status:** `ordens_servico.status`, `pagamentos.pago`

## Considerações de Design

1. **Campos Calculados:** Os campos `subtotal` nas tabelas `os_servicos` e `os_produtos` são gerados automaticamente usando `GENERATED ALWAYS AS`.

2. **Auditoria:** Todas as tabelas incluem timestamps `criado_em` e `atualizado_em` para rastreamento.

3. **Integridade Referencial:** Foram usadas foreign keys com `ON DELETE CASCADE` para manter a integridade dos dados.

4. **Escalabilidade:** A estrutura permite crescimento futuro com novas funcionalidades como controle de estoque, histórico de preços, etc.

## Script de Criação Completo

Veja o arquivo `database_setup.sql` para o script SQL completo que cria todas as tabelas e índices.
