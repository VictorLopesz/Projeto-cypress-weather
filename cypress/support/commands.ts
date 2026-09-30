import cookieBanner from '../pages/CookieBanner';
import homePage from '../pages/HomePage';
import searchBar from '../pages/SearchBar';

// Aceita os cookies para o banner não atrapalhar os cliques
Cypress.Commands.add('dismissCookies', () => {
  cookieBanner.choose('Accept');
});

// Pesquisa a cidade (ex.: "London, GB"), escolhe a primeira sugestão e confere o nome no cabeçalho
Cypress.Commands.add('searchCity', (city: string) => {
  searchBar.search(city);
  searchBar.selectFirstSuggestion();
  homePage.cityName().should('have.text', city);
});

// Troca as respostas da API de clima pelos arquivos de cypress/fixtures/mocks/<nome>/
Cypress.Commands.add('mockWeatherApi', (mockName: string, delayMs = 0) => {
  cy.intercept('GET', '**/api/widget/onecall*', { fixture: `mocks/${mockName}/onecall.json`, delay: delayMs });
  cy.intercept('GET', '**/api/widget/hourly*', { fixture: `mocks/${mockName}/hourly.json`, delay: delayMs });
  cy.intercept('GET', '**/data/2.5/weather*', { fixture: `mocks/${mockName}/weather.json`, delay: delayMs });
});

// Faz a API de clima responder com erro (ex.: 500)
Cypress.Commands.add('failWeatherApi', (statusCode: number) => {
  cy.intercept('GET', '**/api/widget/onecall*', { statusCode: statusCode });
  cy.intercept('GET', '**/api/widget/hourly*', { statusCode: statusCode });
  cy.intercept('GET', '**/data/2.5/weather*', { statusCode: statusCode });
});
