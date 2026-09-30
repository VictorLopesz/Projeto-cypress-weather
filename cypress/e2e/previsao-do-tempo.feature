# language: pt
#
# Casos de teste — Previsão do Tempo (OpenWeatherMap)
# Plano de testes e matriz de rastreabilidade: docs/plano-de-testes.md
#
# Convenção de tags:
#   @CTxxx  identificador do caso de teste
#   @RNxx   regra de negócio coberta
#   @smoke | @regressao | @negativo | @mock | @nao-funcional  suíte
#
# v1.2 — executado com Cypress + Cucumber (@badeball/cypress-cucumber-preprocessor).
# v1.1 — cenários ajustados após a sessão exploratória de 2026-09-29 (seção 13 do plano).
# Os textos entre aspas seguem o idioma do site (inglês).

Funcionalidade: Consulta de previsão do tempo
  Como usuário do site de previsão do tempo
  Quero pesquisar uma cidade e ver o clima atual e a previsão
  Para planejar minhas atividades conforme as condições meteorológicas

  # ---------------------------------------------------------------------------
  Regra: RN01 — Busca de cidade por nome

    Contexto:
      Dado que acesso a página inicial do OpenWeatherMap
      E dispenso o banner de cookies

    @CT001 @RN01 @smoke @regressao
    Cenário: Exibir sugestões ao buscar uma cidade existente
      Quando pesquiso pela cidade "London"
      Então devo ver uma lista de sugestões de cidades
      E a lista deve conter no máximo 5 sugestões
      E cada sugestão deve exibir o nome da cidade e as coordenadas
      E a lista de sugestões deve conter "London, England"

    @CT002 @RN01 @smoke @regressao
    Cenário: Exibir o clima da cidade selecionada nas sugestões
      Quando pesquiso pela cidade "Paris"
      E seleciono a sugestão "Paris, Ile-de-France"
      Então a cidade exibida deve ser "Paris, FR"
      E a temperatura atual deve ser exibida

    @CT003 @RN01 @regressao
    Esquema do Cenário: Busca não diferencia maiúsculas de minúsculas
      Quando pesquiso pela cidade "<termo>"
      E seleciono a primeira sugestão
      Então a cidade exibida deve ser "Berlin, DE"

      Exemplos:
        | termo  |
        | berlin |
        | BERLIN |
        | BeRlIn |

    @CT004 @RN01 @regressao
    Esquema do Cenário: Busca aceita nomes com e sem acento e com espaços
      Quando pesquiso pela cidade "<termo>"
      Então a lista de sugestões deve conter "<sugestao>"

      Exemplos:
        | termo          | sugestao                       |
        | São Paulo      | São Paulo, São Paulo           |
        | sao paulo      | São Paulo, São Paulo           |
        | Rio de Janeiro | Rio de Janeiro, Rio de Janeiro |

    @CT037 @RN01 @regressao
    Esquema do Cenário: Sugestões não se repetem
      Quando pesquiso pela cidade "<termo>"
      Então a lista de sugestões não deve conter itens duplicados

      Exemplos:
        | termo  |
        | Paris  |
        | Sydney |

  # ---------------------------------------------------------------------------
  Regra: RN02 — Busca refinada por país

    Contexto:
      Dado que acesso a página inicial do OpenWeatherMap
      E dispenso o banner de cookies

    @CT005 @RN02 @regressao
    Esquema do Cenário: Buscar cidade informando o código do país
      Quando pesquiso pela cidade "<termo>"
      E seleciono a primeira sugestão
      Então a cidade exibida deve ser "<cidade>"

      Exemplos:
        | termo      | cidade     |
        | London, CA | London, CA |
        | Paris, US  | Paris, US  |
        | Porto, PT  | Porto, PT  |

    @CT006 @RN02 @regressao
    Cenário: Listar cidades homônimas de regiões diferentes
      Quando pesquiso pela cidade "London"
      Então a lista de sugestões deve conter mais de uma cidade
      E as sugestões devem pertencer a pelo menos 2 regiões diferentes

  # ---------------------------------------------------------------------------
  Regra: RN03 — Busca sem resultado e entradas inválidas

    Contexto:
      Dado que acesso a página inicial do OpenWeatherMap
      E dispenso o banner de cookies
      E o clima da cidade "Tokyo, JP" está sendo exibido

    @CT007 @RN03 @negativo @regressao
    Cenário: Nenhuma sugestão para cidade inexistente
      Quando pesquiso pela cidade "Xyzabcqwe"
      Então nenhuma sugestão deve ser exibida

    @CT008 @RN03 @negativo @regressao
    Cenário: Manter a última cidade válida após busca sem resultado
      Quando pesquiso pela cidade "Xyzabcqwe"
      Então a cidade exibida deve ser "Tokyo, JP"

    @CT009 @RN03 @negativo @regressao
    Esquema do Cenário: Busca vazia não altera a cidade exibida
      Quando pesquiso pela cidade "<termo>"
      Então nenhuma sugestão deve ser exibida
      E a cidade exibida deve ser "Tokyo, JP"

      # Marcadores convertidos pelo step (cypress/fixtures/inputs.json): [vazio] = "", [espaços] = "   "
      Exemplos:
        | termo     |
        | [vazio]   |
        | [espaços] |

    @CT010 @RN03 @negativo @regressao
    Esquema do Cenário: Entradas inválidas não quebram a página
      Quando pesquiso pela cidade "<termo>"
      Então a página não deve registrar erros de JavaScript
      E o campo de busca deve continuar habilitado
      E a cidade exibida deve ser "Tokyo, JP"

      Exemplos:
        | termo                      |
        | <script>alert(1)</script>  |
        | !@#$%^&*()                 |
        | 12345                      |
        | [texto com 256 caracteres] |

  # ---------------------------------------------------------------------------
  Regra: RN04 — Unidades de medida

    Contexto:
      Dado que acesso a página inicial do OpenWeatherMap
      E dispenso o banner de cookies
      E o clima da cidade "London, GB" está sendo exibido

    @CT011 @RN04 @smoke @regressao
    Cenário: Exibir unidade métrica por padrão
      Então a unidade de temperatura exibida deve ser "°C"
      E a velocidade do vento deve estar em "m/s"
      E a visibilidade deve estar em "km"

    @CT012 @RN04 @smoke @regressao
    Cenário: Alternar para o sistema imperial
      Quando seleciono a unidade "°F"
      Então a unidade de temperatura exibida deve ser "°F"
      E a velocidade do vento deve estar em "mph"
      E a visibilidade deve estar em "mi"

    @CT013 @RN04 @regressao
    Cenário: Conversão de temperatura consistente entre as unidades
      Dado que registro as condições atuais em °C
      Quando seleciono a unidade "°F"
      Então a temperatura atual deve corresponder à conversão da temperatura registrada com tolerância de 1 grau

    @CT038 @RN04 @regressao
    Cenário: Conversão da velocidade do vento consistente entre as unidades
      Dado que registro as condições atuais em °C
      Quando seleciono a unidade "°F"
      Então a velocidade do vento deve corresponder à conversão da velocidade registrada

    @CT014 @RN04 @regressao
    Cenário: Manter a unidade escolhida ao trocar de cidade
      Dado que seleciono a unidade "°F"
      Quando consulto o clima da cidade "Tokyo, JP"
      Então a cidade exibida deve ser "Tokyo, JP"
      E a unidade de temperatura exibida deve ser "°F"

    @CT015 @RN04 @regressao
    Cenário: Manter a unidade escolhida após recarregar a página
      Dado que seleciono a unidade "°F"
      Quando recarrego a página
      Então a unidade de temperatura exibida deve ser "°F"

  # ---------------------------------------------------------------------------
  Regra: RN05 — Clima atual

    Contexto:
      Dado que acesso a página inicial do OpenWeatherMap
      E dispenso o banner de cookies

    @CT016 @RN05 @smoke @regressao
    Cenário: Exibir todos os campos do clima atual
      Quando consulto o clima da cidade "London, GB"
      Então o bloco de clima atual deve exibir os campos:
        | campo            |
        | cidade e país    |
        | horário local    |
        | temperatura      |
        | descrição        |
        | sensação térmica |
        | vento            |
        | umidade          |
        | visibilidade     |
        | pressão          |
        | índice UV        |
        | ponto de orvalho |

    @CT017 @RN05 @regressao
    Cenário: Valores do clima atual dentro de faixas plausíveis
      Quando consulto o clima da cidade "London, GB"
      Então os valores do clima atual devem estar dentro das faixas:
        | campo        | minimo | maximo |
        | temperatura  | -90    | 60     |
        | umidade      | 0      | 100    |
        | pressão      | 870    | 1085   |
        | índice UV    | 0      | 20     |
        | visibilidade | 0      | 10     |

    @CT018 @RN05 @regressao
    Esquema do Cenário: Exibir o horário no fuso da cidade
      Quando consulto o clima da cidade "<cidade>"
      Então o horário exibido deve corresponder ao fuso "<fuso>" com tolerância de 5 minutos

      Exemplos:
        | cidade        | fuso              |
        | Tokyo, JP     | Asia/Tokyo        |
        | São Paulo, BR | America/Sao_Paulo |
        | Sydney, AU    | Australia/Sydney  |

    @CT040 @RN05 @regressao
    Cenário: Manter a cidade escolhida após recarregar a página
      Quando consulto o clima da cidade "Paris, FR"
      E recarrego a página
      Então a cidade exibida deve ser "Paris, FR"

  # ---------------------------------------------------------------------------
  Regra: RN06 — Previsão de 8 dias

    Contexto:
      Dado que acesso a página inicial do OpenWeatherMap
      E dispenso o banner de cookies
      E o clima da cidade "London, GB" está sendo exibido

    @CT019 @RN06 @regressao
    Cenário: Exibir previsão para 8 dias
      Então a previsão diária deve conter exatamente 8 dias

    @CT020 @RN06 @regressao
    Cenário: Dias da previsão em sequência a partir de hoje
      Então o primeiro dia da previsão deve ser "Today"
      E os demais dias devem ser consecutivos a partir de amanhã no fuso "Europe/London"

    @CT021 @RN06 @regressao
    Cenário: Cada dia exibe as informações obrigatórias
      Então cada dia da previsão deve exibir o rótulo, a temperatura e o ícone com a descrição do tempo

    @CT022 @RN06 @regressao
    Cenário: Temperatura diária dentro de faixa plausível
      Então a temperatura de cada dia deve estar entre -90 e 60 °C

    @CT023 @RN06 @regressao
    Cenário: Selecionar um dia exibe as condições desse dia
      Quando seleciono o 2º dia da previsão
      Então o bloco de clima atual deve exibir a data do 2º dia no fuso "Europe/London"
      E o bloco de clima atual deve exibir os campos:
        | campo            |
        | temperatura      |
        | descrição        |
        | vento            |
        | umidade          |
        | pressão          |
        | índice UV        |

  # ---------------------------------------------------------------------------
  Regra: RN07 — Previsão horária

    Contexto:
      Dado que acesso a página inicial do OpenWeatherMap
      E dispenso o banner de cookies
      E o clima da cidade "London, GB" está sendo exibido

    @CT024 @RN07 @regressao
    Cenário: Exibir previsão horária da cidade selecionada
      Então a previsão horária deve exibir pelo menos 24 horários
      E cada horário deve exibir a hora, a probabilidade de chuva e a temperatura

    @CT025 @RN07 @regressao
    Cenário: Previsão horária acompanha a unidade selecionada
      Dado que registro as condições atuais em °C
      Quando seleciono a unidade "°F"
      Então a temperatura do primeiro horário registrado deve corresponder à conversão com tolerância de 1 grau

  # ---------------------------------------------------------------------------
  # RN08 — Geolocalização: descartada na sessão exploratória (2026-09-29).
  # O site não oferece botão de localização atual; CT026 e CT027 foram retirados.
  # ---------------------------------------------------------------------------

  # ---------------------------------------------------------------------------
  Regra: RN09 — Consentimento de cookies

    Contexto:
      Dado que é meu primeiro acesso, sem cookies armazenados
      E acesso a página inicial do OpenWeatherMap

    @CT028 @RN09 @regressao
    Cenário: Exibir banner de cookies no primeiro acesso
      Então devo ver o banner de cookies com o texto "We use cookies to personalize content and to analyze our traffic"
      E o banner deve oferecer as opções "Accept" e "Decline"

    @CT029 @RN09 @regressao
    Esquema do Cenário: Fechar o banner ao registrar a escolha
      Quando clico em "<opcao>" no banner de cookies
      Então o banner de cookies não deve estar visível

      Exemplos:
        | opcao   |
        | Accept  |
        | Decline |

    @CT030 @RN09 @regressao
    Esquema do Cenário: Banner não reaparece após a escolha
      Dado que clico em "<opcao>" no banner de cookies
      Quando recarrego a página
      Então o banner de cookies não deve estar visível

      Exemplos:
        | opcao   |
        | Accept  |
        | Decline |

  # ---------------------------------------------------------------------------
  Regra: RN10 — Resiliência a falhas da API

    @CT031 @RN10 @mock @negativo @regressao
    Cenário: Exibir mensagem de erro quando a API de clima falha
      Dado que a API de clima responde com status 500
      E acesso a página inicial do OpenWeatherMap
      E dispenso o banner de cookies
      Então devo ver a mensagem de erro "Something went wrong" com o detalhe "Unable to load weather"
      E o botão "Please try again" deve estar visível
      E a página não deve registrar erros de JavaScript

    @CT039 @RN10 @mock @regressao
    Cenário: Recuperar os dados ao tentar novamente
      Dado que a API de clima responde com status 500
      E acesso a página inicial do OpenWeatherMap
      E dispenso o banner de cookies
      E a API de clima volta a responder com o mock "london-metric"
      Quando clico no botão "Please try again" do widget
      Então a temperatura atual deve ser exibida

    @CT032 @RN10 @mock @regressao
    Cenário: Exibir dados após resposta lenta da API
      Dado que a API de clima responde com atraso de 3 segundos usando o mock "london-metric"
      E acesso a página inicial do OpenWeatherMap
      E dispenso o banner de cookies
      Então a cidade exibida deve ser "London, GB"
      E o bloco de clima atual deve exibir os valores do mock:
        | campo       | valor |
        | temperatura | 18°   |

    @CT033 @RN10 @mock @regressao
    Cenário: Exibir exatamente os valores retornados pela API
      Dado que a API de clima responde com o mock "london-metric"
      E acesso a página inicial do OpenWeatherMap
      E dispenso o banner de cookies
      Então a cidade exibida deve ser "London, GB"
      E o bloco de clima atual deve exibir os valores do mock:
        | campo            | valor          |
        | temperatura      | 18°            |
        | sensação térmica | Feels like 17° |
        | descrição        | broken clouds  |
        | umidade          | 72%            |
        | pressão          | 1015 hPa       |

  # ---------------------------------------------------------------------------
  Regra: RN11 — Requisitos não funcionais

    # CT034 (fluxo em vários navegadores) removido na v1.3: a automação roda só no Chrome.

    @CT035 @RN11 @nao-funcional
    Esquema do Cenário: Fluxo principal funciona na tela de dispositivos móveis
      Dado que estou usando o dispositivo "<dispositivo>"
      E acesso a página inicial do OpenWeatherMap
      E dispenso o banner de cookies
      Quando consulto o clima da cidade "London, GB"
      Então a cidade exibida deve ser "London, GB"
      E a página não deve ter rolagem horizontal

      Exemplos:
        | dispositivo |
        | iPhone 13   |
        | Pixel 7     |

    @CT036 @RN11 @nao-funcional
    Cenário: Clima atual carregado em tempo aceitável
      Quando acesso a página inicial do OpenWeatherMap
      Então o bloco de clima atual deve ficar visível em até 10 segundos
