# SPEC-003 - Ranking Municipal

## Objetivo

Classificar municípios conforme indicadores fiscais.

## Entradas

- UF
- Exercício

## Regras

RN-007
Score Fiscal será calculado por:

40% Resultado Fiscal
30% Receita Per Capita
30% Investimento Per Capita

RN-008
Municípios sem dados não participam do ranking.

## API

GET /ranking

## Acceptance Criteria

AC-008
Ranking deve ser exibido ordenado do maior score para o menor.

AC-009
Filtros devem atualizar a listagem em tempo real.

AC-010
Paginação obrigatória para listas acima de 100 registros.