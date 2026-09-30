import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../../pages/HomePage';

Given('que a API de clima responde com status {int}', (status: number) => {
  cy.failWeatherApi(status);
});

Given('que a API de clima responde com o mock {string}', (mock: string) => {
  cy.mockWeatherApi(mock);
});

Given('que a API de clima responde com atraso de {int} segundos usando o mock {string}', (segundos: number, mock: string) => {
  cy.mockWeatherApi(mock, segundos * 1000);
});

// O intercept mais novo tem prioridade, então este mock substitui o erro configurado antes
Given('a API de clima volta a responder com o mock {string}', (mock: string) => {
  cy.mockWeatherApi(mock);
});

When('clico no botão {string} do widget', (nome: string) => {
  homePage.elements.button(nome).click();
});

Then('devo ver a mensagem de erro {string} com o detalhe {string}', (titulo: string, detalhe: string) => {
  homePage.elements.errorTitle().should('have.text', titulo);
  homePage.elements.errorDetail().should('have.text', detalhe);
});

Then('o botão {string} deve estar visível', (nome: string) => {
  homePage.elements.button(nome).should('be.visible');
});
