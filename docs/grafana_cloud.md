# Integração com o Grafana Cloud

Este guia descreve como enviar métricas e logs coletados localmente ou em produção diretamente para o Grafana Cloud, utilizando o Prometheus e o Promtail.

---

## 1. Pré-requisitos

1. Uma conta no [Grafana Cloud](https://grafana.com).
2. Acesso à console do Grafana Cloud (Portal) para obter as credenciais e URLs.
3. Gerar um **Access Policy Token** (API Key) com escopos de escrita para métricas e logs (`metrics:write`, `logs:write`).

---

## 2. Configurando Variáveis de Ambiente

Edite o arquivo `.env` localizado na raiz do projeto e configure as seguintes variáveis com os dados fornecidos no portal do Grafana Cloud:

```env
# ── Grafana Cloud ─────────────────────────────────────────────────────────────
# Enviar métricas (Prometheus)
GRAFANA_CLOUD_PROMETHEUS_URL=https://prometheus-prod-XX.grafana.net/api/prom/push
GRAFANA_CLOUD_PROMETHEUS_USER=seu_usuario_prometheus_id
GRAFANA_CLOUD_PROMETHEUS_API_KEY=seu_token_aqui

# Enviar logs (Loki)
GRAFANA_CLOUD_LOKI_URL=https://logs-prod-XX.grafana.net/loki/api/v1/push
GRAFANA_CLOUD_LOKI_USER=seu_usuario_loki_id
GRAFANA_CLOUD_LOKI_API_KEY=seu_token_aqui
```

---

## 3. Como Executar

Para iniciar a stack de monitoramento conectada ao Grafana Cloud, execute o Docker Compose mesclando o arquivo de configurações base com o de override:

```bash
# Iniciar a stack com Grafana Cloud (Loki e Grafana locais serão desativados)
docker compose -f docker-compose.yml -f docker-compose.grafana-cloud.yml up -d
```

Se desejar voltar a usar a stack local (Prometheus, Loki e Grafana rodando localmente na máquina), basta rodar o comando padrão:

```bash
# Iniciar a stack local
docker compose up -d
```

---

## 4. Configuração em Produção (Railway)

Quando implantado no Railway, não é necessário subir containers dedicados para o Prometheus e Promtail. Você pode usar a infraestrutura gerenciada do Railway e do Grafana Cloud:

### Ingestão de Logs (Railway Log Drains -> Grafana Loki)
O Railway pode enviar automaticamente todos os logs do console (`stdout`) da sua API para o Grafana Loki:
1. No painel do **Railway**, vá nas configurações do projeto e clique em **Project Settings**.
2. Role até a seção **Log Drains** e clique em **Add Log Drain**.
3. Selecione o tipo **Loki**.
4. Configure os campos com as credenciais do Loki do Grafana Cloud:
   - **Endpoint**: Sua URL do Loki (ex: `https://logs-prod-us-central-0.grafana.net/loki/api/v1/push`)
   - **Username**: Seu ID de usuário do Loki.
   - **Password/Token**: Seu Access Policy Token do Grafana Cloud.
5. Salve. O Railway passará a enviar os logs de produção automaticamente.

### Ingestão de Métricas (Grafana Cloud Hosted Scrape -> API Railway)
O Grafana Cloud coleta as métricas diretamente do endpoint público da sua API do Railway:
1. Verifique se o endpoint `/api/v1/metrics` da sua API de produção está respondendo publicamente no navegador (ex: `https://seu-dominio-api.up.railway.app/api/v1/metrics`).
2. Acesse o console do **Grafana Cloud** e vá em **Connections** -> **Connect Data**.
3. Busque por **Prometheus** e escolha **Hosted Scrape** (ou *Scrape a public endpoint*).
4. Configure:
   - **Target URL**: A URL pública completa do seu endpoint de métricas (ex: `https://seu-dominio-api.up.railway.app/api/v1/metrics`).
   - **Job Name**: `api`
5. Salve. O Grafana Cloud passará a coletar as métricas da sua API em produção automaticamente.

---

## 5. Importando o Dashboard no Grafana Cloud

O LinguoUp possui um dashboard pré-configurado para a API. Para importá-lo no Grafana Cloud:

1. Acesse o seu painel do Grafana Cloud.
2. No menu lateral, navegue até **Dashboards** e clique em **New** -> **Import**.
3. Copie o conteúdo ou faça o upload do arquivo JSON localizado em:
   `monitoring/grafana/provisioning/dashboards/definitions/api-dashboard.json`
4. Selecione a fonte de dados (Datasource) do Prometheus correspondente ao seu Grafana Cloud.
5. Clique em **Import**.
