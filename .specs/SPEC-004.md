# SPEC-004 - Entregas SICONFI

## Objetivo

Exibir situação dos relatórios enviados ao Tesouro Nacional.

## Fonte

/extrato_entregas

## Dados

- Exercício
- Relatório
- Status
- Data de Entrega
- Data de Homologação

## Regras

RN-009
Status homologado possui prioridade visual máxima.

RN-010
Status retificado deve possuir destaque visual.

RN-011
Última entrega deve ser exibida primeiro.

## API

GET /municipalities/{ibgeCode}/deliveries

## Acceptance Criteria

AC-011
Listar entregas mais recentes primeiro.

AC-012
Permitir filtro por exercício.

AC-013
Permitir filtro por tipo de relatório.