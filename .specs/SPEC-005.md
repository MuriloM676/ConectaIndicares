# SPEC-005 - Sincronização SICONFI

## Objetivo

Importar dados da API do Tesouro para o banco local.

## Execução

CRON diário.

## Horário

02:00

## Fluxo

1. Buscar Entes.
2. Buscar RREO.
3. Buscar RGF.
4. Buscar Entregas.
5. Atualizar Ranking.
6. Persistir dados.

## Regras

RN-012
Não realizar mais de 1 requisição por segundo para a API SICONFI.

RN-013
Falhas devem ser registradas em log.

RN-014
Dados antigos devem ser atualizados e não duplicados.

## Acceptance Criteria

AC-014
Processo deve ser idempotente.

AC-015
Processo deve continuar mesmo que um município falhe.

AC-016
Logs devem registrar quantidade de registros importados.