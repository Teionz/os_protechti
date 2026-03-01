-- ============================================================================
-- ProTech OS - Script de Criação do Banco de Dados
-- ============================================================================
-- Este script cria todas as tabelas necessárias para o sistema de gestão
-- de Ordens de Serviço da ProTech TI.
-- ============================================================================

-- Criar banco de dados
CREATE DATABASE IF NOT EXISTS protechti_os CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE protechti_os;

-- ============================================================================
-- Tabela: usuarios
-- ============================================================================
CREATE TABLE usuarios (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) NOT NULL UNIQUE,
  senha VARCHAR(255) NOT NULL,
  nome VARCHAR(255) NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Tabela: clientes
-- ============================================================================
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
  INDEX idx_cnpj_cpf (cnpj_cpf),
  INDEX idx_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Tabela: equipamentos
-- ============================================================================
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
  INDEX idx_cliente_id (cliente_id),
  INDEX idx_serie (serie)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Tabela: servicos_tabela
-- ============================================================================
CREATE TABLE servicos_tabela (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  descricao TEXT,
  valor_padrao DECIMAL(10, 2),
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nome (nome),
  UNIQUE KEY uk_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Tabela: produtos_tabela
-- ============================================================================
CREATE TABLE produtos_tabela (
  id INT PRIMARY KEY AUTO_INCREMENT,
  nome VARCHAR(255) NOT NULL,
  unidade VARCHAR(20),
  valor_padrao DECIMAL(10, 2),
  estoque INT DEFAULT 0,
  ativo BOOLEAN DEFAULT TRUE,
  criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_nome (nome),
  UNIQUE KEY uk_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Tabela: ordens_servico
-- ============================================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Tabela: os_servicos
-- ============================================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Tabela: os_produtos
-- ============================================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Tabela: pagamentos
-- ============================================================================
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================================
-- Dados de Exemplo
-- ============================================================================

-- Inserir usuário de exemplo
INSERT INTO usuarios (email, senha, nome) VALUES 
('bruno@protechti.com.br', SHA2('senha123', 256), 'Bruno Zimmermann');

-- Inserir cliente de exemplo
INSERT INTO clientes (nome, cnpj_cpf, endereco, numero, bairro, cep, cidade, estado, telefone, email) VALUES 
('SAULO PARAGUASSU', '329.350.928-21', 'Rua São Váldomiro', '440', 'Jardim Santa Luzia', '15080-070', 'São José do Rio Preto', 'SP', '(17) 99776-7186', 'saulo.paraguassu@gmail.com');

-- Inserir equipamento de exemplo
INSERT INTO equipamentos (cliente_id, nome, marca, modelo, serie) VALUES 
(1, 'NOTEBOOK', 'ACER', 'A515-5UX', 'E2134');

-- Inserir serviços de exemplo
INSERT INTO servicos_tabela (nome, descricao, valor_padrao) VALUES 
('M.O TROCA TECLADO COM REBITE', 'Mão de obra para troca de teclado', 180.00),
('LIMPEZA INTERNA', 'Limpeza completa do equipamento', 100.00),
('REPARO DE CARCAÇA', 'Reparo de carcaça danificada', 150.00);

-- Inserir produtos de exemplo
INSERT INTO produtos_tabela (nome, unidade, valor_padrao, estoque) VALUES 
('TECLADO ACER A515', 'UN', 120.00, 5),
('TELA NOTEBOOK 15.6', 'UN', 250.00, 3),
('PASTA TÉRMICA', 'UN', 25.00, 10);

-- ============================================================================
-- Fim do Script
-- ============================================================================
