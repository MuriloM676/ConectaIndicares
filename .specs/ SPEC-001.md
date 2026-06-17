# SPEC-001 - Dashboard Fiscal

## Objetivo

Permitir visualização rápida da situação fiscal de um município.

## Entradas

- Código IBGE do município
- Exercício

## Fonte dos Dados

- SICONFI / RREO
- SICONFI / RGF
- Cadastro de Entes

## Regras de Negócio

RN-001
Receita Total deve ser calculada a partir do RREO mais recente disponível.

RN-002
Resultado Fiscal = Receita Total - Despesa Total.

RN-003
Caso não exista dado para o exercício selecionado, exibir "Dados não disponíveis".

## Componentes

- Card Receita
- Card Despesa
- Card Resultado
- Card População
- Card Saúde
- Card Educação
- Card Pessoal
- Gráfico Receita x Despesa

## API

GET /municipalities/{ibgeCode}/dashboard

## Resposta

{
  revenue: number;
  expense: number;
  result: number;
  population: number;
  educationPercent: number;
  healthPercent: number;
  personnelPercent: number;
}

## Acceptance Criteria

AC-001
Ao acessar um município válido o dashboard deve carregar em até 2 segundos.

AC-002
Todos os indicadores devem possuir valor formatado em moeda brasileira.

AC-003
Os percentuais devem possuir duas casas decimais.

AC-004
Ausência de dados deve exibir estado vazio.