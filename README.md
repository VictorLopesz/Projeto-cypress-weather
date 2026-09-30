# Cypress Weather

[![Cypress E2E Tests](https://github.com/VictorLopesz/Projeto-cypress-weather/actions/workflows/cypress.yml/badge.svg)](https://github.com/VictorLopesz/Projeto-cypress-weather/actions/workflows/cypress.yml)

Automação de testes E2E do widget de previsão do tempo da página inicial do [OpenWeatherMap](https://openweathermap.org), escrita com **Cypress + TypeScript + Cucumber (Gherkin)**.

Os casos de teste ficam em Gherkin, em português, e cobrem busca de cidades, unidades de medida, clima atual, previsão diária e horária, banner de cookies, falhas da API (com mocks) e requisitos não funcionais básicos (tela de celular e tempo de carregamento).

> O site é de terceiros e está em produção. Os dados de clima mudam o tempo todo, então os testes validam **presença, formato, unidade e faixas plausíveis**, e não valores exatos. Valores exatos só são comparados nos cenários com a API mockada.

## Tecnologias

| Item | Versão |
|---|---|
| [Cypress](https://www.cypress.io) | 16 |
| TypeScript | 7 |
| [@badeball/cypress-cucumber-preprocessor](https://github.com/badeball/cypress-cucumber-preprocessor) | 28 |
| esbuild (bundler dos specs) | 0.28 |
| Node.js | 22, 24 ou 26+ |
| Navegador | Google Chrome |

## Estrutura

```
├── .github/workflows/cypress.yml         # pipeline do GitHub Actions
├── cypress/
│   ├── e2e/previsao-do-tempo.feature     # casos de teste em Gherkin (é o próprio spec)
│   ├── pages/                            # Page Objects: seletores e ações de cada parte da página
│   ├── fixtures/                         # massa de dados e mocks da API (mocks/london-metric/)
│   └── support/
│       ├── commands.ts                   # Custom Commands (dismissCookies, searchCity, mockWeatherApi, failWeatherApi)
│       ├── index.d.ts                    # tipagem dos Custom Commands
│       ├── step_definitions/             # código de cada frase do Gherkin
│       └── utils/datetime.ts             # datas e horários no fuso de cada cidade
├── docs/plano-de-testes.md               # plano de testes, rastreabilidade e defeitos encontrados
├── cypress.config.ts
└── cypress.env.example.json              # modelo do arquivo de ambiente
```

**Padrões adotados:**
- Os steps não têm seletores: todos ficam nos Page Objects.
- Nenhuma espera com tempo fixo (`cy.wait(ms)`). As esperas usam `cy.intercept` + `cy.wait('@alias')` e asserções com repetição automática.
- O site não tem `data-cy`/`data-testid`, então os seletores usam atributos (`placeholder`, `alt`), textos e as classes do widget.

## Como executar

### 1. Instalar

```bash
git clone https://github.com/VictorLopesz/Projeto-cypress-weather.git
cd Projeto-cypress-weather
npm ci
```

### 2. Configurar o ambiente (opcional)

```bash
cp cypress.env.example.json cypress.env.json
```

O `cypress.env.json` define a `BASE_URL` e fica fora do git. Sem ele, os testes usam `https://openweathermap.org`.

### 3. Rodar

| Comando | O que roda |
|---|---|
| `npm test` | Suíte completa no Chrome (headless) |
| `npm run test:smoke` | Caminho feliz crítico |
| `npm run test:regressao` | Todos os cenários funcionais |
| `npm run test:negativo` | Entradas inválidas e erros |
| `npm run test:mock` | Cenários com a API mockada |
| `npm run test:nao-funcional` | Tela de celular e tempo de carregamento |
| `npm run cy:open` | Modo interativo do Cypress |
| `npm run typecheck` | Verificação de tipos do TypeScript |

Para rodar uma expressão de tags qualquer:

```bash
npx cypress run --browser chrome --expose "tags=@regressao and not @mock"
```

## Tags

| Tag | Significado |
|---|---|
| `@CTxxx` | Identificador do caso de teste |
| `@RNxx` | Regra de negócio coberta |
| `@smoke` | Caminho feliz crítico (CT001, CT002, CT011, CT012, CT016) |
| `@regressao` | Todos os cenários funcionais |
| `@negativo` | Entradas inválidas e erros |
| `@mock` | API mockada com `cy.intercept` (resultado determinístico) |
| `@nao-funcional` | Tela de celular e tempo de carregamento |
| `@defeito-conhecido` | Falha por defeito já registrado no site (hoje: CT037). Fica fora da regressão do CI |

## Pipeline (GitHub Actions)

| Gatilho | Tags executadas |
|---|---|
| Pull request e push na `main` | `@smoke` |
| Agendado (segunda a sexta, 06:00 de Brasília) | `@regressao and not @defeito-conhecido` |
| Manual (**Actions → Cypress E2E Tests → Run workflow**) | Expressão informada (padrão: `@regressao and not @defeito-conhecido`) |

Quando algum teste falha, os screenshots ficam disponíveis como artefato (`cypress-screenshots`) por 14 dias. No CI, cada teste que falha é repetido uma vez.

## Defeitos encontrados no site

Os testes encontraram comportamentos que parecem defeitos do site. Os detalhes estão na seção 14 do [plano de testes](docs/plano-de-testes.md).

| # | Descrição | Teste afetado |
|---|---|---|
| D1 | A lista de sugestões da busca repete itens idênticos (ex.: "Paris, Ile-de-France") | CT037 falha sempre (tag `@defeito-conhecido`) |
| D2 | A API do widget às vezes devolve dados de horas antes em uma das unidades, e a tela mostra condições diferentes em °C e °F | CT038 e, às vezes, CT013 e CT025 falham de forma intermitente |

## Documentação

O [plano de testes](docs/plano-de-testes.md) reúne escopo, regras de negócio e critérios de aceite, matriz de rastreabilidade, estratégia, riscos e a análise dos defeitos encontrados.
