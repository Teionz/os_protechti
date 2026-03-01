# Guia de Hospedagem na KingHost - ProTech OS

## Visão Geral

Este guia fornece instruções passo a passo para implantar o sistema ProTech OS em um servidor KingHost. O sistema é baseado em React (front-end) e requer um servidor web com suporte a Node.js ou pode ser adaptado para PHP.

## Pré-requisitos

- Conta ativa na KingHost
- Acesso ao painel de controle (cPanel)
- Conhecimento básico de FTP/SFTP
- Banco de dados MySQL criado

## Estrutura do Projeto

```
os_protechti/
├── client/                 # Front-end React (será compilado)
│   ├── src/
│   ├── public/
│   └── index.html
├── server/                 # Back-end Node.js (opcional)
├── database_setup.sql      # Script de criação do banco
├── .env.example            # Variáveis de ambiente
└── package.json
```

## Passo 1: Preparar o Projeto para Produção

### 1.1 Compilar o Front-end

```bash
cd os_protechti
npm install
npm run build
```

Isso criará uma pasta `dist/` com os arquivos estáticos compilados.

### 1.2 Estrutura de Arquivos para Upload

Após a compilação, você terá:
- `dist/public/` - Arquivos estáticos (HTML, CSS, JS)
- `dist/index.js` - Servidor Node.js (se usar back-end)

## Passo 2: Criar Banco de Dados na KingHost

### 2.1 Acessar o cPanel

1. Faça login no cPanel da KingHost
2. Procure por "MySQL Databases" ou "Banco de Dados MySQL"

### 2.2 Criar Banco de Dados

1. Nome do banco: `protechti_os`
2. Clique em "Create Database"

### 2.3 Criar Usuário MySQL

1. Vá para "MySQL Users"
2. Crie um novo usuário:
   - Username: `protechti_user`
   - Password: (gere uma senha forte)
3. Clique em "Create User"

### 2.4 Atribuir Privilégios

1. Vá para "Add User To Database"
2. Selecione o usuário e o banco criados
3. Marque "ALL PRIVILEGES"
4. Clique em "Make Changes"

### 2.5 Executar Script SQL

1. Acesse o phpMyAdmin (disponível no cPanel)
2. Selecione o banco `protechti_os`
3. Vá para a aba "SQL"
4. Cole o conteúdo do arquivo `database_setup.sql`
5. Clique em "Go" para executar

## Passo 3: Fazer Upload dos Arquivos

### 3.1 Conectar via FTP

1. No cPanel, vá para "FTP Accounts"
2. Crie uma conta FTP (ou use a padrão)
3. Use um cliente FTP (FileZilla, WinSCP) para conectar

### 3.2 Estrutura de Diretórios

Crie a seguinte estrutura no servidor:

```
public_html/
├── os_protechti/           # Diretório principal
│   ├── dist/               # Arquivos compilados do React
│   │   ├── public/
│   │   └── index.js
│   ├── .env                # Variáveis de ambiente
│   └── package.json
```

### 3.3 Upload dos Arquivos

1. Faça upload de todos os arquivos da pasta `dist/` para `public_html/os_protechti/`
2. Faça upload do arquivo `.env` (veja seção abaixo)
3. Faça upload do `package.json`

## Passo 4: Configurar Variáveis de Ambiente

### 4.1 Criar Arquivo `.env`

Crie um arquivo `.env` na raiz do projeto com o seguinte conteúdo:

```env
# Banco de Dados
DB_HOST=localhost
DB_USER=protechti_user
DB_PASSWORD=sua_senha_aqui
DB_NAME=protechti_os
DB_PORT=3306

# Aplicação
NODE_ENV=production
PORT=3000
APP_URL=https://seudominio.com.br

# Segurança
JWT_SECRET=sua_chave_secreta_muito_segura_aqui
SESSION_SECRET=outra_chave_secreta_muito_segura_aqui

# Email (opcional)
SMTP_HOST=smtp.seudominio.com.br
SMTP_PORT=587
SMTP_USER=seu_email@seudominio.com.br
SMTP_PASSWORD=sua_senha_email
```

### 4.2 Proteger o Arquivo `.env`

Adicione um arquivo `.htaccess` na raiz para proteger arquivos sensíveis:

```apache
<Files .env>
    Order allow,deny
    Deny from all
</Files>

<Files database_setup.sql>
    Order allow,deny
    Deny from all
</Files>
```

## Passo 5: Configurar Node.js na KingHost

### 5.1 Verificar Suporte a Node.js

A KingHost oferece suporte a Node.js através de:
- **Passenger** (recomendado)
- **Custom Port** (alternativa)

### 5.2 Usar Passenger (Recomendado)

1. No cPanel, vá para "Setup Node.js App"
2. Clique em "Create Application"
3. Configure:
   - **Node.js version:** 18.x ou superior
   - **Application root:** `/home/seu_usuario/public_html/os_protechti`
   - **Application startup file:** `dist/index.js`
   - **Application URL:** `https://seudominio.com.br`

### 5.3 Instalar Dependências

Via SSH (se disponível):

```bash
cd ~/public_html/os_protechti
npm install --production
```

Ou via cPanel > Terminal (se disponível)

## Passo 6: Configurar SSL/HTTPS

### 6.1 Usar AutoSSL da KingHost

1. No cPanel, vá para "AutoSSL"
2. Clique em "Manage" próximo ao seu domínio
3. Clique em "Check for new certificates"

### 6.2 Forçar HTTPS

Adicione ao arquivo `.htaccess`:

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</IfModule>
```

## Passo 7: Testar a Aplicação

### 7.1 Verificar Status

1. Acesse `https://seudominio.com.br` no navegador
2. Você deve ver a página de login do ProTech OS

### 7.2 Testar Banco de Dados

1. Acesse o phpMyAdmin
2. Verifique se as tabelas foram criadas corretamente
3. Teste a conexão com as credenciais do `.env`

### 7.3 Logs de Erro

Se houver problemas:
1. Verifique os logs em `~/logs/` ou `~/public_html/os_protechti/logs/`
2. Verifique o error_log do cPanel
3. Verifique a console do navegador (F12)

## Passo 8: Manutenção

### 8.1 Backups

1. No cPanel, vá para "Backups"
2. Configure backups automáticos diários
3. Baixe backups regularmente

### 8.2 Atualizações

Para atualizar o sistema:

```bash
cd ~/public_html/os_protechti
git pull origin main
npm install
npm run build
```

### 8.3 Monitoramento

- Monitore o uso de CPU e memória no cPanel
- Verifique logs regularmente
- Faça backups antes de qualquer alteração

## Troubleshooting

### Problema: Erro 500 - Internal Server Error

**Solução:**
1. Verifique se o Node.js está ativo no cPanel
2. Verifique o arquivo `.env` e as credenciais do banco
3. Verifique os logs de erro

### Problema: Banco de Dados não conecta

**Solução:**
1. Verifique se o usuário MySQL foi criado corretamente
2. Verifique se os privilégios foram atribuídos
3. Teste a conexão via phpMyAdmin

### Problema: Página em branco

**Solução:**
1. Verifique se a pasta `dist/` foi enviada corretamente
2. Verifique se o arquivo `index.html` existe
3. Verifique a console do navegador para erros

## Suporte

Para suporte técnico:
- **KingHost:** https://www.kinghost.com.br/suporte
- **Documentação Node.js:** https://nodejs.org/docs
- **Documentação MySQL:** https://dev.mysql.com/doc

## Próximos Passos

1. Adicionar autenticação com JWT
2. Implementar API REST completa
3. Adicionar validação de dados
4. Implementar testes automatizados
5. Configurar CI/CD para deployments automáticos
