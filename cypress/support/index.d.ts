declare namespace Cypress {
  interface Chainable {
    /** Aceita o banner de cookies. */
    dismissCookies(): Chainable<void>;
    /** Pesquisa a cidade ("Cidade, CC"), escolhe a primeira sugestão e confere o nome exibido. */
    searchCity(city: string): Chainable<void>;
    /** Responde a API de clima com os arquivos de cypress/fixtures/mocks/<mockName>/. */
    mockWeatherApi(mockName: string, delayMs?: number): Chainable<void>;
    /** Faz a API de clima responder com o status HTTP informado. */
    failWeatherApi(statusCode: number): Chainable<void>;
  }
}
