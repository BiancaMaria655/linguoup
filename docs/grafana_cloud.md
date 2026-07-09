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

## 4. Importando o Dashboard no Grafana Cloud

O LinguoUp possui um dashboard pré-configurado para a API. Para importá-lo no Grafana Cloud:

1. Acesse o seu painel do Grafana Cloud.
2. No menu lateral, navegue até **Dashboards** e clique em **New** -> **Import**.
3. Copie o conteúdo ou faça o upload do arquivo JSON localizado em:
   `monitoring/grafana/provisioning/dashboards/definitions/api-dashboard.json`
4. Selecione a fonte de dados (Datasource) do Prometheus correspondente ao seu Grafana Cloud.
5. Clique em **Import**.
