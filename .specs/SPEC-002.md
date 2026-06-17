# SPEC-002 - Comparativo Municipal

## Objetivo

Permitir comparação entre dois municípios.

## Entradas

- Município A
- Município B
- Exercício

## Regras

RN-004
Ambos municípios devem possuir dados para o exercício.

RN-005
Receita Per Capita = Receita Total / População.

RN-006
Despesa Per Capita = Despesa Total / População.

## API

GET /comparison

## Query Params

municipalityA
municipalityB
year

## Resposta

{
  municipalityA: {}
  municipalityB: {}
}

## Acceptance Criteria

AC-005
Os dados devem ser exibidos lado a lado.

AC-006
Diferenças percentuais devem ser calculadas automaticamente.

AC-007
A troca de município deve atualizar os dados sem reload da página.