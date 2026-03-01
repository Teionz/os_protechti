# ProTech OS - Sistema de Gestão de Ordens de Serviço

## Descrição

ProTech OS é um sistema web completo para gestão de ordens de serviço, desenvolvido especificamente para a ProTech Soluções em TI. O sistema permite cadastro, visualização, edição e impressão de ordens de serviço com integração a banco de dados MySQL.

## Características Principais

- **Autenticação de Usuários:** Sistema de login seguro com JWT
- **Gestão de Clientes:** Cadastro e manutenção de dados de clientes
- **Ordens de Serviço:** Criação, edição, visualização e impressão de OS
- **Gestão de Equipamentos:** Registro de equipamentos por cliente
- **Serviços e Produtos:** Catálogo de serviços e produtos com preços
- **Relatórios:** Geração de relatórios e impressão em PDF
- **Dashboard:** Painel com estatísticas e ações rápidas
- **Interface Responsiva:** Funciona em desktop, tablet e mobile
- **Design Moderno:** Interface Dark Tech Professional com Ciano brilhante

## Stack Tecnológico

### Front-end
- **React 19** - Framework JavaScript
- **TypeScript** - Tipagem estática
- **Tailwind CSS 4** - Estilização
- **Shadcn/UI** - Componentes de UI
- **Wouter** - Roteamento cliente
- **Lucide React** - Ícones

### Back-end
- **Node.js** - Runtime JavaScript
- **Express** - Framework web
- **MySQL** - Banco de dados relacional

### Ferramentas
- **Vite** - Build tool
- **Pnpm** - Gerenciador de pacotes
- **ESBuild** - Compilador JavaScript

## Estrutura do Projeto

```
os_protechti/
├── client/                          # Front-end React
│   ├── public/                      # Arquivos estáticos
│   ├── src/
│   │   ├── pages/                   # Páginas da aplicação
│   │   │   ├── Home.tsx             # Login
│   │   │   ├── Dashboard.tsx        # Painel principal
│   │   │   ├── OSForm.tsx           # Formulário de OS
│   │   │   ├── OSList.tsx           # Listagem de OS
│   │   │   └── OSDetail.tsx         # Detalhes de OS
│   │   ├── components/              # Componentes reutilizáveis
│   │   ├── contexts/                # React Contexts
│   │   ├── hooks/                   # Custom Hooks
│   │   ├── lib/                     # Utilitários
│   │   ├── App.tsx                  # Componente raiz
│   │   ├── main.tsx                 # Entrada da aplicação
│   │   └── index.css                # Estilos globais
│   └── index.html                   # Template HTML
├── server/                          # Back-end Node.js
│   └── index.ts                     # Servidor Express
├── shared/                          # Código compartilhado
├── database_setup.sql               # Script de criação do BD
├── DATABASE_SCHEMA.md               # Documentação do banco
├── KINGHOST_DEPLOYMENT.md           # Guia de hospedagem
├── ideas.md                         # Conceito de design
├── package.json                     # Dependências
└── README_PROJETO.md                # Este arquivo
```

## Instalação e Desenvolvimento

### Pré-requisitos
- Node.js 18.x ou superior
- npm ou pnpm
- MySQL 5.7 ou superior

### Passos de Instalação

1. **Clonar o repositório:**
   ```bash
   git clone <url-do-repositorio>
   cd os_protechti
   ```

2. **Instalar dependências:**
   ```bash
   pnpm install
   ```

3. **Configurar banco de dados:**
   ```bash
   mysql -u root -p < database_setup.sql
   ```

4. **Criar arquivo `.env`:**
   ```bash
   cp .env.example .env
   # Editar .env com suas credenciais
   ```

5. **Iniciar servidor de desenvolvimento:**
   ```bash
   pnpm dev
   ```

6. **Acessar a aplicação:**
   - Abra http://localhost:3000 no navegador

## Páginas Principais

### 1. Home (Login)
- Página de autenticação
- Acesso demo sem credenciais
- Design moderno com logo da ProTech

### 2. Dashboard
- Painel com estatísticas
- Atalhos para ações rápidas
- Resumo de ordens de serviço

### 3. Formulário de OS (OSForm)
- Cadastro completo de ordem de serviço
- Seções colapsáveis:
  - Informações básicas
  - Dados do cliente
  - Equipamento
  - Serviços (dinâmico)
  - Produtos (dinâmico)
  - Pagamento
  - Observações
- Cálculo automático de totais

### 4. Listagem de OS (OSList)
- Tabela com todas as ordens
- Busca por número, cliente ou equipamento
- Filtros por status
- Ações: Visualizar, Editar, Deletar
- Paginação

### 5. Detalhes de OS (OSDetail)
- Visualização completa da ordem
- Opções de impressão e download PDF
- Edição rápida
- Histórico de alterações

## Design e Identidade Visual

### Paleta de Cores
- **Fundo Principal:** #0F1419 (Azul muito escuro)
- **Accent Primário:** #00D9FF (Ciano brilhante)
- **Accent Secundário:** #1E90FF (Azul royal)
- **Texto:** #FFFFFF (Branco puro)
- **Texto Secundário:** #A0AEC0 (Cinza claro)

### Tipografia
- **Títulos:** Poppins Bold/SemiBold
- **Corpo:** Inter Regular/Medium
- **Números:** Fira Code

### Componentes Especiais
- **Glow Effect:** Bordas com brilho ciano
- **Cards Flutuantes:** Elevação com sombra profunda
- **Botões:** Com efeito de brilho ao hover
- **Inputs:** Com foco em ciano

## Banco de Dados

### Tabelas Principais
1. **usuarios** - Usuários do sistema
2. **clientes** - Dados dos clientes
3. **equipamentos** - Equipamentos dos clientes
4. **ordens_servico** - Ordens de serviço
5. **os_servicos** - Serviços por OS
6. **os_produtos** - Produtos por OS
7. **pagamentos** - Dados de pagamento
8. **servicos_tabela** - Catálogo de serviços
9. **produtos_tabela** - Catálogo de produtos

Veja `DATABASE_SCHEMA.md` para detalhes completos.

## Hospedagem

### KingHost
O sistema está pronto para hospedagem na KingHost. Veja `KINGHOST_DEPLOYMENT.md` para instruções passo a passo.

### Requisitos
- Node.js 18.x
- MySQL 5.7+
- 500MB de espaço em disco
- SSL/HTTPS

## API Endpoints (Planejado)

```
POST   /api/auth/login              - Autenticação
POST   /api/auth/logout             - Logout
GET    /api/clientes                - Listar clientes
POST   /api/clientes                - Criar cliente
GET    /api/clientes/:id            - Detalhes do cliente
PUT    /api/clientes/:id            - Atualizar cliente
DELETE /api/clientes/:id            - Deletar cliente
GET    /api/ordens                  - Listar ordens
POST   /api/ordens                  - Criar ordem
GET    /api/ordens/:id              - Detalhes da ordem
PUT    /api/ordens/:id              - Atualizar ordem
DELETE /api/ordens/:id              - Deletar ordem
GET    /api/ordens/:id/pdf          - Gerar PDF
```

## Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev              # Inicia servidor de desenvolvimento

# Build
pnpm build            # Compila para produção
pnpm preview          # Visualiza build de produção

# Qualidade
pnpm check            # Verifica tipos TypeScript
pnpm format           # Formata código com Prettier

# Produção
pnpm start            # Inicia servidor de produção
```

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=protechti_user
DB_PASSWORD=sua_senha
DB_NAME=protechti_os
DB_PORT=3306

# Aplicação
NODE_ENV=development
PORT=3000
APP_URL=http://localhost:3000

# Segurança
JWT_SECRET=sua_chave_secreta_muito_segura
SESSION_SECRET=outra_chave_secreta_muito_segura

# Email (opcional)
SMTP_HOST=smtp.seudominio.com.br
SMTP_PORT=587
SMTP_USER=seu_email@seudominio.com.br
SMTP_PASSWORD=sua_senha_email
```

## Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
2. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
3. Push para a branch (`git push origin feature/AmazingFeature`)
4. Abra um Pull Request

## Roadmap

- [ ] Autenticação completa com JWT
- [ ] API REST completa
- [ ] Geração de PDF
- [ ] Envio de e-mails
- [ ] Relatórios avançados
- [ ] Integração com WhatsApp
- [ ] App mobile (React Native)
- [ ] Sincronização offline
- [ ] Testes automatizados
- [ ] CI/CD com GitHub Actions

## Licença

Este projeto é propriedade da ProTech Soluções em TI. Todos os direitos reservados.

## Contato

**ProTech Soluções em TI**
- Email: bruno@protechti.com.br
- Telefone: (17) 99711-9839
- Site: www.protechti.com.br
- Endereço: Rua Espanha, 502, Bom Jardim, São José do Rio Preto - SP

## Suporte

Para suporte técnico, entre em contato com a equipe ProTech através dos canais acima.

---

**Desenvolvido com ❤️ para ProTech Soluções em TI**
