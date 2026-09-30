# Plano de Testes — Previsão do Tempo (OpenWeatherMap)

| Item | Valor |
|---|---|
| Sistema sob teste (SUT) | https://openweathermap.org (página inicial — widget "Weather forecast") |
| Framework | Cypress 16 + TypeScript + Cucumber (`@badeball/cypress-cucumber-preprocessor`) |
| Casos de teste (BDD) | [`cypress/e2e/previsao-do-tempo.feature`](../cypress/e2e/previsao-do-tempo.feature), executável via Cucumber |
| Versão do plano | 1.3 — CT034 (cross-browser) removido (2026-09-29) |
| Responsável | Victor Lopes |

### Histórico de versões

| Versão | Data | Alteração |
|---|---|---|
| 0.1 | 2026-09-29 | Rascunho com regras inferidas |
| 1.0 | 2026-09-29 | Aprovado por Victor Lopes |
| 1.1 | 2026-09-29 | Premissas validadas no site real. RN01, RN03, RN04, RN05, RN06 e RN10 ajustadas, RN08 descartada, CT037–CT040 incluídos, resultados de execução e defeitos candidatos registrados (seções 13 e 14). **Requer nova revisão**. |
| 1.2 | 2026-09-29 | Automação migrada de Playwright para **Cypress + TypeScript + Cucumber**, com código em estilo simples. CT034 passou a cobrir Chrome, Firefox e Edge (removido na v1.3); CT035 vira teste de viewport mobile. Novo defeito candidato D2 (dados desatualizados entre unidades), que explica O2 e O6. |
| 1.3 | 2026-09-29 | **CT034 removido** a pedido do responsável, junto com a cobertura de Firefox e Edge: a automação roda só no Chrome. CA11.1 retirado. |

---

## 1. Resumo Executivo

Este plano define a estratégia de testes E2E do widget público de previsão do tempo do OpenWeatherMap. O foco está nas funções que o usuário final usa: **busca de cidade**, **alternância de unidades**, **clima atual**, **previsão de 8 dias**, **previsão horária**, **consentimento de cookies** e **resiliência a falhas da API**.

O site é de terceiros e não tem especificação pública. Por isso, as regras de negócio (RN) foram inferidas e depois **confrontadas com o site real na sessão exploratória** de 2026-09-29 (seção 13). Na versão 1.1, os cenários refletem o comportamento observado. Onde esse comportamento parece defeito, o cenário mantém a regra esperada e falha (seção 14).

**Situação atual (Cypress, Chrome, 2026-09-29, v1.3):** 53 testes, 51 passaram e 2 falharam. As 2 falhas são do CT037 (sugestões duplicadas), o **defeito candidato D1** (seção 14.1). O CT038 falha de forma **intermitente** por causa do defeito candidato D2 (seção 14.2).

Os dados meteorológicos mudam o tempo todo, então a estratégia combina:

1. **Testes contra dados reais**: estrutura, formato, unidade e faixas plausíveis.
2. **Testes com API mockada** (`cy.intercept`): valores exatos e cenários de erro, de forma determinística.

---

## 2. Escopo

### 2.1 Dentro do escopo

| Módulo | Descrição |
|---|---|
| M1 — Busca de cidade | Autocomplete "Search City", sugestões, cidades homônimas, busca por país, cidade inexistente, entradas inválidas |
| M2 — Unidades | °C (m/s, km) × °F (mph, mi), conversão e persistência da escolha |
| M3 — Clima atual | Cidade/país, horário local, temperatura, descrição, sensação térmica, vento, umidade, visibilidade, pressão, UV, ponto de orvalho |
| M4 — Previsão de 8 dias | Quantidade e sequência de dias, temperatura, ícone, seleção de um dia |
| M5 — Previsão horária | Lista horária (hora, probabilidade de chuva, temperatura) e unidade |
| M7 — Cookies | Banner de consentimento (Accept/Decline) |
| M8 — Resiliência | Erro da API, botão "Please try again", latência (via mock) |
| M9 — Não funcionais (básico) | Viewport mobile e tempo de carregamento |

> **M6 — Geolocalização foi descartado:** o site não oferece a função. O ícone de localização é apenas decorativo.

### 2.2 Fora do escopo

- Testes da API REST paga/assinada (endpoints com `appid` próprio), contratos e carga.
- Cadastro, login, área do assinante, planos e pagamentos.
- Mapas meteorológicos, blog, documentação, marketplace e "Minute forecast".
- Alertas meteorológicos (botão "⚠ Alert"): aparecem só em algumas cidades e condições, então são candidatos a um ciclo futuro com mock.
- Precisão meteorológica, ou seja, se a previsão "acerta".
- Testes de carga, estresse e segurança (pentest). Não há autorização para isso num site de terceiros.

---

## 3. Premissas (validadas em 2026-09-29)

| # | Premissa original | Resultado |
|---|---|---|
| P1 | O widget permite buscar cidade sem login | ✅ Confirmada |
| P2 | Unidade padrão Métrica (°C, m/s) | ✅ Confirmada. A visibilidade também é métrica (km) |
| P3 | Busca sem resultado exibe mensagem "Not found..." | ❌ **Refutada.** A lista fica vazia, sem mensagem (ver O4) |
| P4 | Previsão diária com 8 dias a partir de hoje | ✅ Confirmada ("Today" + 7 dias) |
| P5 | Dados interceptáveis na automação (`page.route` no Playwright, `cy.intercept` no Cypress) | ✅ Confirmada. Endpoints: `/api/widget/geo`, `/api/widget/onecall`, `/api/widget/hourly` e `api.openweathermap.org/data/2.5/weather` |
| P6 | Unidade e consentimento persistidos | ✅ Confirmada. Unidade e cidade em `localStorage` (`weather_location`), consentimento no cookie `gdpr_cookie_consent` |
| P7 | Interface em inglês | ✅ Confirmada |
| P8 | Sem bloqueio anti-bot em volume baixo | ✅ Sem bloqueio com 2 workers. O evento `load` é lento por causa de scripts de terceiros, por isso a navegação usa `domcontentloaded` |

---

## 4. Regras de Negócio (RN) e Critérios de Aceite (CA)

> Os itens com **(v1.1)** foram alterados após a exploração.

### RN01 — Busca de cidade por nome
- **CA01.1 (v1.1)** Ao digitar o nome de uma cidade existente, o autocomplete exibe **até 5 sugestões** no formato `Cidade[, Região]` com as coordenadas `lat, lon`. Não há botão "Search".
- **CA01.2 (v1.1)** Ao selecionar uma sugestão, o cabeçalho do widget passa a exibir `Cidade, CC` (código ISO 3166 do país).
- **CA01.3** A busca não diferencia maiúsculas de minúsculas.
- **CA01.4 (v1.1)** A busca aceita nomes com e sem acento e com espaços (`São Paulo` e `sao paulo`).
- **CA01.5 (v1.1, novo)** A lista não contém sugestões repetidas, com mesmo nome e mesmas coordenadas.

### RN02 — Busca refinada por país
- **CA02.1** A busca no formato `Cidade, CC` (ex.: `London, CA`) retorna a cidade do país informado.
- **CA02.2 (v1.1)** Cidades homônimas geram várias sugestões, de regiões diferentes.

### RN03 — Busca sem resultado e entradas inválidas
- **CA03.1 (v1.1)** Uma cidade inexistente não exibe sugestões. O comportamento esperado original (mensagem de orientação) virou a recomendação O4.
- **CA03.2** Após uma busca sem resultado, a última cidade válida continua exibida.
- **CA03.3** Uma busca vazia ou só com espaços não exibe sugestões nem altera a cidade.
- **CA03.4** Caracteres especiais, números e entradas longas não geram erro de JavaScript nem desabilitam a busca.

### RN04 — Unidades de medida
- **CA04.1 (v1.1)** Em °C (padrão), o vento aparece em **m/s** e a visibilidade em **km**.
- **CA04.2 (v1.1)** Ao selecionar **°F**, o vento passa para **mph** e a visibilidade para **mi**.
- **CA04.3** Temperatura: `°F = °C × 9/5 + 32`, com tolerância de **±1**.
- **CA04.4 (v1.1, novo)** Vento: o valor em mph corresponde ao valor em m/s × 2,237, considerando o arredondamento da tela.
- **CA04.5** A unidade escolhida se mantém ao trocar de cidade.
- **CA04.6** A unidade escolhida se mantém após recarregar a página.

### RN05 — Clima atual
- **CA05.1 (v1.1)** Exibe cidade e país (cabeçalho), horário local, temperatura, descrição, "Feels like", vento, umidade, visibilidade, pressão (hPa), índice UV e ponto de orvalho. Para o dia atual aparece **só o horário, sem data**.
- **CA05.2** Os valores respeitam faixas plausíveis:

| Campo | Faixa válida |
|---|---|
| Temperatura | −90 a 60 °C |
| Umidade | 0 a 100 % |
| Pressão | 870 a 1085 hPa |
| Índice UV | 0 a 20 |
| Visibilidade | 0 a 10 km |

- **CA05.3** O horário exibido corresponde ao **fuso da cidade** consultada.
- **CA05.4 (v1.1, novo)** A cidade escolhida se mantém após recarregar a página.

### RN06 — Previsão de 8 dias
- **CA06.1** São exibidos exatamente **8 dias**.
- **CA06.2** O primeiro é "Today", e os demais são dias da semana consecutivos no fuso da cidade.
- **CA06.3 (v1.1)** Cada dia exibe rótulo, **uma** temperatura e o ícone com a descrição. A tela não mostra máxima e mínima.
- **CA06.4 (v1.1)** A temperatura de cada dia está na faixa plausível (−90 a 60 °C). Substitui "máx ≥ mín".
- **CA06.5 (v1.1)** Ao selecionar um dia, o bloco principal exibe a data desse dia ("Wed, Sep 30") e as condições dele. Não existe "expandir".

### RN07 — Previsão horária
- **CA07.1 (v1.1)** Exibe pelo menos 24 horários, cada um com hora, probabilidade de chuva (%) e temperatura.
- **CA07.2 (v1.1)** Ao trocar a unidade, a temperatura **do mesmo horário** é convertida corretamente.

### ~~RN08 — Geolocalização~~ (descartada na v1.1)
O site não oferece localização atual, e CT026 e CT027 foram retirados. Com a permissão concedida, a página continuou abrindo a cidade padrão (London).

### RN09 — Consentimento de cookies
- **CA09.1** No primeiro acesso aparece o banner *"We use cookies to personalize content and to analyze our traffic"* com **Accept** e **Decline**, além do link "Advanced Settings".
- **CA09.2** Ao aceitar ou recusar, o banner fecha.
- **CA09.3** Após a escolha, o banner não reaparece ao recarregar a página.

### RN10 — Resiliência a falhas da API (via mock)
- **CA10.1 (v1.1)** Com a API respondendo HTTP 500, o widget exibe **"Something went wrong"**, **"Unable to load weather"** e o botão **"Please try again"**, sem erro de JavaScript não tratado.
- **CA10.2 (v1.1, novo)** Quando a API se recupera, "Please try again" carrega os dados.
- **CA10.3** Com a API lenta (3 s), os dados aparecem quando a resposta chega.
- **CA10.4** Com uma resposta mockada conhecida, a tela exibe exatamente os valores do mock.

### RN11 — Requisitos não funcionais (básico)
- ~~**CA11.1** O fluxo principal passa em vários navegadores.~~ Retirado na v1.3: a automação roda só no Chrome.
- **CA11.2** O fluxo principal funciona em iPhone 13 e Pixel 7, sem rolagem horizontal.
- **CA11.3** O widget fica pronto em até **10 s** após a navegação. Em 4 execuções, 3 ficaram dentro da meta e 1 marcou 10,7 s. **Meta a calibrar** com uma série maior de medições.

---

## 5. Matriz de Rastreabilidade e Status

Execução de 2026-09-29, Cypress no Chrome.

| RN | Critérios | Cenários | Prioridade | Dado | Status |
|---|---|---|---|---|---|
| RN01 | CA01.1–01.5 | CT001–CT004, CT037 | Alta | Real | ✅ CT001–CT004 · ❌ CT037 (defeito candidato D1) |
| RN02 | CA02.1–02.2 | CT005–CT006 | Média | Real | ✅ |
| RN03 | CA03.1–03.4 | CT007–CT010 | Alta | Real | ✅ |
| RN04 | CA04.1–04.6 | CT011–CT015, CT038 | Alta | Real | ✅ · ⚠️ CT038 intermitente (defeito candidato D2) |
| RN05 | CA05.1–05.4 | CT016–CT018, CT040 | Alta | Real | ✅ |
| RN06 | CA06.1–06.5 | CT019–CT023 | Alta | Real | ✅ |
| RN07 | CA07.1–07.2 | CT024–CT025 | Média | Real | ✅ |
| ~~RN08~~ | — | ~~CT026–CT027~~ | — | — | Descartada |
| RN09 | CA09.1–09.3 | CT028–CT030 | Média | Real | ✅ |
| RN10 | CA10.1–10.4 | CT031–CT033, CT039 | Média | Mock | ✅ |
| RN11 | CA11.2–11.3 | CT035–CT036 | Baixa | Real | ✅ Chrome e viewports iPhone 13 / Pixel 7 · CT034 removido na v1.3 |

Total: **37 CTs** (CT001–CT040, sem CT026, CT027 e CT034).

---

## 6. Estratégia de Testes

### 6.1 Níveis e tipos
- **E2E funcional (UI)**: módulos M1–M5, M7 e M8.
- **API mockada**: `cy.intercept()` com JSON em `cypress/fixtures/mocks/<cenário>/`. Os mocks foram gerados a partir de respostas reais, com valores controlados e sem chaves de API.
- **Não funcional básico**: viewport mobile e tempo de carregamento (RN11).

### 6.2 Suítes (tags) e comandos

| Tag | Uso | Comando |
|---|---|---|
| `@smoke` | Caminho feliz crítico (CT001, CT002, CT011, CT012, CT016) | `npm run test:smoke` |
| `@regressao` | Todos os cenários funcionais | `npm run test:regressao` |
| `@negativo` | Entradas inválidas e erros | `npm run test:negativo` |
| `@mock` | Cenários determinísticos com API mockada | `npm run test:mock` |
| `@nao-funcional` | Mobile e desempenho | `npm run test:nao-funcional` |
| (todas) | Suíte completa no Chrome | `npm test` |
| — | Modo interativo do Cypress | `npm run cy:open` |

### 6.3 Tratamento de dados dinâmicos
- Contra dados reais, validar **presença, formato (regex), unidade e faixa**, nunca valores exatos.
- A conversão de unidades compara o valor antes e depois da troca, com tolerância de arredondamento. Na previsão horária, a comparação usa o **mesmo horário**.
- Horários e datas esperados são calculados no **fuso da cidade** com `toLocaleTimeString`/`toLocaleDateString` e a opção `timeZone`.
- As comparações após trocar a unidade usam `.should(callback)`: o Cypress repete a verificação até o valor convertido aparecer (ver O1).

### 6.4 Técnicas de projeto de teste
- **Partição de equivalência**: cidade válida, inexistente, vazia, com caracteres especiais.
- **Valor-limite**: faixas de umidade, pressão e UV. Entrada de 256 caracteres.
- **Tabela de decisão**: unidade × cidade × recarga de página.
- **Transição de estado**: banner de cookies; widget em erro → nova tentativa → dados.

---

## 7. Arquitetura do Projeto de Automação

```
Cypress-Weather/
├── docs/plano-de-testes.md                   # este documento
├── cypress/
│   ├── e2e/previsao-do-tempo.feature         # casos de teste em Gherkin: é o próprio spec
│   ├── pages/                                # Page Objects: seletores (elements) e ações
│   │   ├── HomePage.ts                       # visitar, cidade exibida, troca de unidade, erro
│   │   ├── SearchBar.ts                      # busca e sugestões
│   │   ├── CurrentWeather.ts                 # bloco de clima atual
│   │   ├── DailyForecast.ts                  # previsão de 8 dias
│   │   ├── HourlyForecast.ts                 # previsão horária
│   │   └── CookieBanner.ts                   # banner de cookies
│   ├── fixtures/                             # massa de dados e mocks
│   │   ├── mocks/london-metric/              # onecall.json, hourly.json, weather.json
│   │   ├── inputs.json                       # marcadores do Gherkin ([vazio], [espaços], 256 caracteres)
│   │   ├── formatos.json                     # formato esperado de cada campo do clima atual
│   │   └── devices.json                      # viewports do iPhone 13 e Pixel 7
│   └── support/
│       ├── commands.ts                       # Custom Commands: dismissCookies, searchCity, mockWeatherApi, failWeatherApi
│       ├── index.d.ts                        # tipagem dos Custom Commands
│       ├── e2e.ts                            # carregado antes de cada spec
│       ├── step_definitions/*.steps.ts       # código de cada frase do Gherkin (pasta padrão do Cucumber)
│       └── utils/datetime.ts                 # horários e datas no fuso da cidade
├── cypress.config.ts                         # Cucumber + esbuild, baseUrl, timeouts
├── cypress.env.json / cypress.env.example.json  # BASE_URL (cypress.env.json fora do git)
└── package.json                              # scripts por tag e configuração do Cucumber
```

**Padrões adotados:**
- Código em **estilo simples**, legível para quem está começando em Cypress: Page Objects com `elements`, `cy.contains`, `cy.intercept` + `cy.wait('@alias')`, aliases e `should`.
- Steps sem seletores soltos: todos os seletores ficam nos Page Objects.
- O site não tem `data-cy`/`data-testid`. Os seletores usam atributos (`placeholder`, `alt`), textos (`cy.contains`) e as classes do widget (`weather-current-weather`, `weather-daily-tabs-container`, `weather-hourly-chart`, `cookies-banner`), sempre dentro dos Page Objects.
- Sem `cy.wait(ms)`. As esperas usam `cy.intercept` + `cy.wait('@alias')` e asserções com repetição automática.
- Erros de JavaScript do site são registrados num hook `Before` e validados pelo step próprio. O erro React #418 é ignorado porque só acontece dentro do Cypress (ver R9).

---

## 8. Ambiente, Ferramentas e Execução

| Item | Definição |
|---|---|
| Navegador | Chrome (todos os scripts usam `--browser chrome`) |
| Mobile | CT035 simula a tela (viewport) do iPhone 13 e do Pixel 7. Não emula o dispositivo (toque, user agent) |
| Timeouts | Comandos 10 s, carregamento de página 60 s e widget 30 s: site de terceiros em produção |
| Relatórios | Saída do `cypress run`, com screenshot em falha (`cypress/screenshots/`) |
| Retries | 1 retry só em CI (`CI=true`). Falhas intermitentes são registradas, não mascaradas |
| Paralelismo | Sequencial (padrão do Cypress) |
| Evidências | Skill `/evidencias`, quando necessário |
| CI/CD | Recomendado: `@smoke` por PR e `@regressao` agendada (plataforma a definir) |

---

## 9. Riscos e Mitigações

| # | Risco | Impacto | Probabilidade | Mitigação |
|---|---|---|---|---|
| R1 | Regras inferidas divergem do real | Alto | ~~Média~~ Baixa | Sessão exploratória feita; premissas validadas (seção 3) |
| R2 | Site muda layout ou textos sem aviso | Alto | Média | Locators centralizados; `@smoke` detecta a quebra rápido |
| R3 | Dados reais variáveis | Médio | Alta | Formato e faixa; valores exatos só com mock |
| R4 | Rate limit / anti-bot | Alto | Baixa | Execução sequencial; não observado até agora |
| R5 | Banners sobrepõem elementos | Médio | Média | Step "dispenso o banner de cookies" em todos os contextos |
| R6 | Endpoints do widget mudam e quebram os mocks | Médio | Média | Padrões de URL isolados nos Custom Commands (`cypress/support/commands.ts`) |
| R7 | Termos de uso restringem automação | Médio | Baixa | Revisar os termos antes de agendar execuções recorrentes em CI |
| R8 (novo) | Ausência de `data-testid` e dependência de classes CSS | Médio | Média | Classes semânticas encapsuladas nos Page Objects; revisar a cada quebra |
| R9 (novo) | Dentro do Cypress, o site gera o erro **React #418** (falha de hidratação). No Chrome sem Cypress ele não aparece (3 de 3 execuções via CDP, com o widget carregado). Causa provável: o Cypress altera o HTML da página ao injetar seu script | Baixo | Alta (sempre no Cypress) | O hook `Before` ignora só o erro #418 e continua registrando os demais. Reavaliar a cada atualização do Cypress |
| R10 (novo) | Dados de clima desatualizados entre unidades (D2) tornam o CT038, e possivelmente o CT013 e o CT025, intermitentes | Médio | Média | Manter os testes (eles detectam um problema real); registrar cada ocorrência com o `dt` das respostas |

---

## 10. Critérios de Entrada e Saída

**Entrada** ✅ premissas validadas · ✅ locators e endpoints mapeados · ✅ projeto configurado.

**Saída**
- 100% dos cenários `@smoke` passando no Chrome ✅.
- ≥ 95% dos cenários `@regressao` passando. Hoje, as falhas restantes são o defeito candidato D1 (fixo) e o D2 (intermitente).
- Matriz de rastreabilidade atualizada (seção 5).

---

## 11. Recomendações

1. **Revisar a versão 1.1**: várias regras mudaram em relação à versão aprovada (seção 4, itens v1.1).
2. **Reportar D1** (sugestões duplicadas) e **D2** (dados desatualizados entre unidades); **avaliar O1 e O4** como melhorias de UX.
3. **Investigar O3 e O5** com medições repetidas antes de tratá-los como defeitos.
4. Calibrar a meta de desempenho (CA11.3) com uma série de medições em horários diferentes.
5. Tratar os mocks como **contrato**: se a resposta real mudar, atualizar o JSON e não o teste.
6. **Revisão humana**: regras e achados foram produzidos com apoio de IA e precisam de validação antes de virar critério oficial de aceite ou relato de defeito.

---

## 12. Próximos Passos

| # | Ação | Responsável | Status |
|---|---|---|---|
| 1 | Revisar e aprovar o plano e o `.feature` (v1.0) | Victor | ✅ 2026-09-29 |
| 2 | Sessão exploratória | QA / Claude | ✅ 2026-09-29 |
| 3 | Gherkin executável (`playwright-bdd`, depois Cucumber no Cypress) | Victor | ✅ Decidido |
| 4 | Montar o projeto (`/playwright-setup`) | Claude | ✅ 2026-09-29 |
| 5 | Implementar e executar as suítes (Playwright) | Claude | ✅ 2026-09-29 |
| 6 | Revisar a v1.1 do plano e do `.feature` | Victor | ⏳ |
| 7 | Instalar Firefox e WebKit e executar CT034 e CT035 (Playwright) | Claude | ✅ 2026-09-29 |
| 8 | Investigar e reportar D1 e as observações O1–O6 | QA | ⏳ |
| 9 | Configurar a pipeline de CI | A definir | ⏳ |
| 10 | Migrar a automação para Cypress + TypeScript + Cucumber (`/cypress-setup`) | Claude | ✅ 2026-09-29 |
| 11 | Remover o CT034 e a cobertura de Firefox e Edge | Claude | ✅ 2026-09-29 |

---

## 13. Sessão Exploratória (2026-09-29)

Feita com Playwright no site em produção (Chromium, viewport desktop). A seção 3 resume os fatos principais. Outras observações:

- **Busca:** autocomplete com debounce que consulta `/api/widget/geo?q=<termo>&limit=5`. Não envia requisição para termos vazios ou só com espaços. `Cidade, CC` funciona como filtro por país.
- **Cabeçalho:** exibe `Cidade, CC`. A lista de sugestões não mostra o país, só a região.
- **Troca de unidade:** dispara novas chamadas `onecall` e `hourly` com `units=imperial|metric`.
- **Clima atual:** a temperatura aparece sem unidade ("25°"). Só o ponto de orvalho mostra a unidade ("18°C"), e ele é usado como indicador da unidade ativa.
- **Previsão diária:** 8 abas clicáveis. Ao selecionar um dia, o bloco principal mostra a data e as condições daquele dia.
- **Erro da API:** o widget inteiro é substituído pela mensagem de erro e pelo botão "Please try again".
- **Alertas:** em algumas cidades (ex.: Paris) aparece o botão "⚠ Alert" antes do horário. A leitura do bloco reconhece cada campo pelo formato, não pela posição.

---

## 14. Defeitos Candidatos e Observações

> **Fato** = reproduzido de forma consistente. **Hipótese** = observado poucas vezes, precisa de confirmação. Nada foi reportado ao fornecedor.

| # | Tipo | Descrição | Evidência | CT |
|---|---|---|---|---|
| **D1** | Fato: defeito candidato | A lista de sugestões repete itens idênticos (nome e coordenadas): "Paris, Ile-de-France (48.86, 2.32)" e "Sydney, New South Wales (-33.87, 151.21)". **Duas causas** (análise de 2026-09-29, seção 14.1): **(a) Paris:** a API `/api/widget/geo` devolve dois registros idênticos; **(b) Sydney:** dois lugares diferentes, a 271 m, que ficam iguais porque a tela arredonda as coordenadas para 2 casas. Em ambos, o widget não remove nem diferencia duplicatas | Falha consistente; varredura de 28 cidades | CT037 ❌ |
| O1 | Fato: UX | Ao trocar a unidade, os rótulos mudam **antes** dos valores. Por ~600 ms a tela mostra valores métricos com rótulo imperial (ex.: "18°F" para 18 °C) | Instrumentação a cada 100 ms | — (tratado na espera do teste) |
| **D2** | Fato: defeito candidato | A API do widget (`/api/widget/onecall`) às vezes devolve **dados de horas antes** numa das unidades. A tela então mostra condições diferentes em °C e em °F (seção 14.2). Explica O2 e O6 | Paris: resposta imperial com `dt` ~8h40 mais antigo que a métrica; CT038 falhou no Cypress (4 m/s → 12.1 mph) | CT038 ⚠️ intermitente |
| O2 | Explicada por D2 | Vento inconsistente entre unidades: 3 m/s → 13,4 mph e 5 m/s → 5,8 mph | Ver D2 | CT038 |
| O3 | Hipótese | O nome no cabeçalho pode mudar para um bairro: "Madrid" → "Madrid City Center, ES"; "Paris" → "Palais-Royal, FR" após recarregar | 1 ocorrência de cada; o CT040 passou depois | CT040 ✅ |
| O4 | Fato: UX | Cidade inexistente: nenhuma mensagem de "não encontrado" nem orientação de formato | Todas as execuções | CT007 ✅ (valida o comportamento atual) |
| O5 | Hipótese | A lista horária mudou o primeiro horário ao trocar de unidade (9 p.m → 7 p.m) | 1 ocorrência | CT025 ✅ (compara o mesmo horário) |
| O6 | Explicada por D2 | Paris: condições diferentes entre °C e °F na mesma sessão ("Overcast 17°C" × "Clear Sky 61°F") | Ver D2 | — |

### 14.1 Análise do D1 — sugestões duplicadas (2026-09-29)

**Método:** captura da resposta bruta de `/api/widget/geo?q=<termo>&limit=5` com Playwright, comparação com o texto exibido e varredura sequencial de 28 cidades.

| Busca | Registros envolvidos | O que difere nos dados | O que a tela mostra | Causa |
|---|---|---|---|---|
| Paris | #1 e #5 | Nada em nome, estado, país, latitude e longitude (48.8588897, 2.3200410217200766). Só `local_names`: o #1 tem uma tradução a mais (`wa` = valão), 98 × 97 | "Paris, Ile-de-France 48.86, 2.32" duas vezes | **Duplicata exata na fonte de dados** |
| Sydney | #1 e #4 | Lugares distintos a **271 m** (-33.8698439, 151.2082848 × -33.8679526, 151.2101348). O #1 tem 26 traduções, o #4 só `en` | "Sydney, New South Wales -33.87, 151.21" duas vezes | **Duplicata visual**: arredondamento para 2 casas + nomes iguais |

**Varredura:** 28 cidades (London, Paris, Sydney, Tokyo, Berlin, Madrid, Rome, Lisbon, Porto, São Paulo, Rio de Janeiro, New York, Los Angeles, Chicago, Toronto, Moscow, Cairo, Mumbai, Beijing, Mexico City, Buenos Aires, Amsterdam, Vienna, Dublin, Springfield, Portland, Santiago, Cambridge). Houve **1 duplicata exata (Paris)** e **1 visual (Sydney)**; as outras 26 buscas não têm repetições.

**Impacto:** baixo. As duas opções levam ao mesmo lugar (Paris) ou a pontos praticamente iguais para o clima (Sydney). O problema é de usabilidade: o usuário vê opções repetidas e não tem como distingui-las.

**Hipóteses (não verificadas):**
- O endpoint `/api/widget/geo` parece repassar a Geocoding API pública do OpenWeather, porque a resposta tem o mesmo formato (`name`, `local_names`, `lat`, `lon`, `country`, `state`). A duplicata viria da base geográfica, possivelmente de dois objetos de mapa diferentes para a mesma cidade.
- O registro de Sydney com uma só tradução parece ser uma entidade secundária (ex.: localidade ou centro), e não a cidade.

**Sugestões de correção (para o fornecedor):** remover do lado do widget os itens com mesmo nome, estado, país e coordenadas; quando os nomes forem iguais e as coordenadas próximas, manter só um ou diferenciar os itens (ex.: mais casas decimais ou o tipo de lugar).

### 14.2 Análise do D2 — dados desatualizados entre unidades (2026-09-29)

**Sintoma:** o CT038 falhou no Cypress com o vento em **4 m/s → 12.1 mph** (o esperado seria de 7.8 a 10.1 mph). O Cypress repetiu a verificação por 10 s, então era o valor final, não um estado intermediário.

**Investigação:**
1. **Hipótese inicial (refutada):** em °F a tela usaria o vento de outro endpoint (`/data/2.5/weather`). Um experimento com mock (vento 3 no `onecall` e 6 no `weather`) mostrou que a tela usa o **`onecall` nas duas unidades**: `units=metric` em °C e `units=imperial` em °F.
2. **Comparação direta da API:** 16 pares de respostas métrico × imperial (London e Paris, a cada ~20 s). Em 15 os valores batem com a conversão. Em 1 (Paris), a resposta imperial veio **desatualizada**:

| Campo | Métrico | Imperial |
|---|---|---|
| `dt` (horário da medição) | 1790723153 | **1790691822** (~8h40 antes) |
| Temperatura | 22.48 °C (= 72.5 °F) | **81.59 °F** |
| Vento | 4.63 m/s (= 10.4 mph) | **11.5 mph** |
| Descrição | overcast clouds | **few clouds** |

Na coleta seguinte, a resposta imperial já estava atualizada.

**Conclusão:** as respostas de cada unidade parecem vir de **caches separados**, e às vezes um deles está desatualizado. O usuário que troca a unidade pode ver dados de horas antes. A frequência exata não foi medida (1 em 16 nesta amostra).

**Impacto:** médio. A informação exibida pode estar errada, e não só mal formatada. Afeta de forma intermitente os testes de conversão (CT038 e, potencialmente, CT013 e CT025).

**Sugestão (para o fornecedor):** gerar as duas unidades a partir da mesma medição, ou converter no cliente, e invalidar os caches juntos.

