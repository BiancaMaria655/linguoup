#!/bin/bash

# Adicionar proxy local do pnpm no PATH para resolver execuções internas do monorepo
export PATH="$PWD/.bin:$PATH"

# Cores para o output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}==============================================${NC}"
echo -e "${GREEN}          LinguoUp - Inicializador           ${NC}"
echo -e "${YELLOW}==============================================${NC}"

# Libera portas 3000, 3001 e 8081 se estiverem presas por execuções anteriores
for port in 3000 3001 8081; do
    pid=$(lsof -t -i:$port 2>/dev/null)
    if [ ! -z "$pid" ]; then
        echo -e "${YELLOW}Liberando porta $port (PID: $pid)...${NC}"
        kill -9 $pid 2>/dev/null
    fi
done

# 1. Verificar .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}[1/5] Arquivo .env não encontrado. Copiando de .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✓ .env criado com sucesso!${NC}"
else
    echo -e "${GREEN}[1/5] ✓ Arquivo .env já existe.${NC}"
fi

# 2. Instalar dependências se node_modules não existir
if [ ! -d node_modules ]; then
    echo -e "${YELLOW}[2/5] node_modules não encontrado. Instalando dependências com pnpm...${NC}"
    npx pnpm install
    echo -e "${GREEN}✓ Dependências instaladas!${NC}"
else
    echo -e "${GREEN}[2/5] ✓ Dependências instaladas (node_modules existente).${NC}"
fi

# 3. Subir containers do Docker
echo -e "${YELLOW}[3/5] Iniciando serviços do Docker (PostgreSQL, Redis, pgAdmin)...${NC}"
if ! docker compose up -d; then
    echo -e "${RED}Erro: Certifique-se de que o Docker está instalado e em execução.${NC}"
    exit 1
fi

# 4. Aguardar PostgreSQL ficar healthy
echo -ne "${YELLOW}[4/5] Aguardando o banco de dados (PostgreSQL) ficar pronto...${NC}"
until [ "$(docker inspect --format='{{json .State.Health.Status}}' linguoup_postgres 2>/dev/null)" == "\"healthy\"" ]; do
    echo -ne "${YELLOW}.${NC}"
    sleep 2
done
echo -e "\n${GREEN}✓ Banco de dados pronto!${NC}"

# 5. Executar migrations do Prisma
if [ -d packages/database/prisma ]; then
    echo -e "${YELLOW}[5/5] Executando migrations e seed do banco de dados...${NC}"
    npx pnpm db:migrate
    npx pnpm db:seed
    echo -e "${GREEN}✓ Banco de dados atualizado e populado!${NC}"
else
    echo -e "${YELLOW}[5/5] Setup do Prisma não encontrado (pulando migrations e seed por enquanto).${NC}"
fi

echo -e "${GREEN}==============================================${NC}"
echo -e "${GREEN}✓ Tudo pronto! Iniciando a aplicação...       ${NC}"
echo -e "${GREEN}==============================================${NC}"

# Iniciar o ambiente de desenvolvimento
npx pnpm dev
