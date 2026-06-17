# SICONFI API

## Visão Geral

A API SICONFI (Sistema de Informações Contábeis e Fiscais do Setor Público Brasileiro) disponibiliza dados fiscais, contábeis e orçamentários de municípios, estados e União.

Documentação oficial:

https://apidatalake.tesouro.gov.br/ords/siconfi/tt/

---

# Base URL

```http
https://apidatalake.tesouro.gov.br/ords/siconfi/tt
```

---

# Limitações

## Rate Limit

A API permite:

```text
1 requisição por segundo
```

Todas as rotinas de sincronização devem respeitar este limite.

---

# Endpoints Utilizados

O sistema utilizará apenas os endpoints necessários para o MVP.

---

## GET /entes

Retorna informações cadastrais dos entes federativos.

### Uso

Obter:

* Código IBGE
* Nome do Município
* UF
* População
* CNPJ

### Exemplo

```http
GET /entes
```

### Campos Relevantes

| Campo     | Descrição   |
| --------- | ----------- |
| cod_ibge  | Código IBGE |
| ente      | Nome        |
| uf        | UF          |
| populacao | População   |
| co_cnpj   | CNPJ        |

### Destino

Tabela:

```sql
municipalities
```

---

## GET /rreo

Relatório Resumido da Execução Orçamentária.

### Uso

Extrair:

* Receita Total
* Receita Corrente
* Receita Tributária
* Despesas Totais

### Parâmetros

| Campo                 | Obrigatório |
| --------------------- | ----------- |
| an_exercicio          | Sim         |
| nr_periodo            | Sim         |
| co_tipo_demonstrativo | Sim         |
| id_ente               | Sim         |

### Exemplo

```http
GET /rreo
?an_exercicio=2025
&nr_periodo=6
&co_tipo_demonstrativo=RREO
&id_ente=3550105
```

### Indicadores Derivados

* Receita Total
* Despesa Total
* Resultado Fiscal

### Destino

```sql
fiscal_indicators
```

---

## GET /rgf

Relatório de Gestão Fiscal.

### Uso

Extrair:

* Despesa com Pessoal
* Limites da LRF

### Parâmetros

| Campo                 | Obrigatório |
| --------------------- | ----------- |
| an_exercicio          | Sim         |
| in_periodicidade      | Sim         |
| nr_periodo            | Sim         |
| co_tipo_demonstrativo | Sim         |
| co_poder              | Sim         |
| id_ente               | Sim         |

### Exemplo

```http
GET /rgf
?an_exercicio=2025
&in_periodicidade=Q
&nr_periodo=3
&co_tipo_demonstrativo=RGF
&co_poder=E
&id_ente=3550105
```

### Indicadores Derivados

* Percentual de Pessoal
* Situação LRF

### Destino

```sql
fiscal_indicators
```

---

## GET /extrato_entregas

Retorna histórico de entregas de relatórios.

### Uso

Monitorar:

* RREO
* RGF
* DCA

### Parâmetros

| Campo         | Obrigatório |
| ------------- | ----------- |
| id_ente       | Sim         |
| an_referencia | Sim         |

### Exemplo

```http
GET /extrato_entregas
?id_ente=3550105
&an_referencia=2025
```

### Campos Relevantes

| Campo            | Descrição         |
| ---------------- | ----------------- |
| entregavel       | Tipo do relatório |
| status_relatorio | HO ou RE          |
| data_status      | Data              |
| periodicidade    | Frequência        |

### Destino

```sql
delivery_status
```

---

# Endpoints Futuros

Não serão utilizados no MVP.

## /dca

Dados das contas anuais.

Uso futuro:

* Patrimônio
* Balanços

---

## /msc_orcamentaria

Uso futuro:

* Receita detalhada
* Despesa detalhada

---

## /msc_patrimonial

Uso futuro:

* Ativos
* Passivos
* Dívida

---

## /msc_controle

Uso futuro:

* Auditoria
* Controle interno

---

# Estratégia de Sincronização

## Execução

```text
CRON
↓
SICONFI
↓
Transformação
↓
PostgreSQL
```

---

## Frequência

Diariamente

```text
02:00
```

---

## Regras

### REGRA-001

Nunca consultar o SICONFI diretamente pelo frontend.

---

### REGRA-002

Todos os dados devem ser persistidos localmente.

---

### REGRA-003

Sincronizações devem ser idempotentes.

---

### REGRA-004

Falhas devem ser registradas em log.

---

### REGRA-005

Respeitar limite de 1 requisição por segundo.

---

# Mapeamento de Entidades

## Municipality

```ts
{
  ibgeCode: string;
  name: string;
  uf: string;
  population: number;
  cnpj: string;
}
```

---

## FiscalIndicator

```ts
{
  municipalityId: string;
  year: number;

  revenue: number;
  expense: number;

  result: number;

  educationPercent: number;
  healthPercent: number;
  personnelPercent: number;
}
```

---

## DeliveryStatus

```ts
{
  municipalityId: string;
  reportType: string;
  status: string;
  deliveredAt: Date;
}
```

---

# Status

Versão: 1.0

Escopo: MVP Conecta Fiscal
