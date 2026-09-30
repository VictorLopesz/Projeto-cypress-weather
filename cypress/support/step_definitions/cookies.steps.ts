import { Given, Then } from '@badeball/cypress-cucumber-preprocessor';
import cookieBanner from '../../pages/CookieBanner';

Given('que é meu primeiro acesso, sem cookies armazenados', () => {
  // O Cypress limpa os cookies entre os testes; aqui só conferimos
  cy.getAllCookies().should('have.length', 0);
});

// Serve para "Dado que clico em..." e para "Quando clico em..."
Given(/^(?:que )?clico em "(Accept|Decline)" no banner de cookies$/, (opcao: string) => {
  cookieBanner.choose(opcao);
});

Then('devo ver o banner de cookies com o texto {string}', (texto: string) => {
  cookieBanner.elements.message(texto).should('be.visible');
});

Then('o banner deve oferecer as opções {string} e {string}', (opcao1: string, opcao2: string) => {
  cookieBanner.elements.button(opcao1).should('be.visible');
  cookieBanner.elements.button(opcao2).should('be.visible');
});

Then('o banner de cookies não deve estar visível', () => {
  cookieBanner.elements.banner().should('not.exist');
});
