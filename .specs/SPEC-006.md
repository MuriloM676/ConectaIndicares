# SPEC-006 - Refinamento Visual dos Gráficos Receita x Despesa

## Objetivo

Melhorar a aparência dos dois gráficos de barras da página Dashboard ("Receita" e "Despesa"), tornando-os mais modernos, limpos e fáceis de interpretar, sem alterar regras de negócio ou a origem dos dados.

---

## Problema

Os gráficos atualmente cumprem sua função, porém possuem aparência simples e pouco atrativa, reduzindo a qualidade visual do dashboard.

O objetivo desta melhoria é aplicar um refinamento ("polish") na interface mantendo toda a funcionalidade existente.

---

## Requisitos

### Visual

* Modernizar o estilo dos gráficos.
* Melhorar espaçamentos internos.
* Utilizar cores mais harmoniosas.
* Bordas e cantos arredondados.
* Melhor contraste entre fundo e barras.
* Melhorar tipografia dos títulos.
* Destacar valores de forma mais elegante.
* Melhorar aparência das legendas (caso existam).

### Interação

* Adicionar animação suave na renderização.
* Melhorar efeito de hover nas barras.
* Tooltip mais agradável visualmente.

### Layout

* Os dois gráficos devem possuir exatamente o mesmo padrão visual.
* Devem manter responsividade.
* Não alterar tamanho geral da seção do dashboard.

---

## Não faz parte desta SPEC

* Novos indicadores.
* Novos filtros.
* Mudança na API.
* Mudança nas consultas.
* Mudança nos cálculos.
* Novos tipos de gráfico.

---

## Critérios de Aceitação

* [ ] Os gráficos possuem aparência mais moderna.
* [ ] As barras utilizam paleta de cores consistente.
* [ ] O hover possui destaque visual.
* [ ] Existe animação de entrada suave.
* [ ] Tooltips apresentam boa legibilidade.
* [ ] Os dois gráficos possuem identidade visual consistente.
* [ ] Não houve alteração nas regras de negócio.
* [ ] Não houve alteração dos dados exibidos.
