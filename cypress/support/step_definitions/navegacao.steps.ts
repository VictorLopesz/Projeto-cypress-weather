import { Before, Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../../pages/HomePage';
import currentWeather from '../../pages/CurrentWeather';

let errosDaPagina: string[] = [];
let inicioDoCarregamento = 0;

// Antes de cada cenário: guarda os erros de JavaScript do site em vez de reprovar o teste na hora.
// Quem valida esses erros é o step "a página não deve registrar erros de JavaScript".
Before(() => {
  errosDaPagina = [];
  cy.on('uncaught:exception', (erro) => {
    // O erro React #418 (falha de hidratação) só aparece dentro do Cypress, que modifica a página
    // ao carregar. No Chrome normal ele não acontece (verificado em 2026-09-29), então é ignorado.
    if (erro.message.includes('Minified React error #418')) {
      return false;
    }
    errosDaPagina.push(erro.message);
    return false;
  });
});

// Serve para "Dado que acesso..." e para "Quando acesso..."
Given(/^(?:que )?acesso a página inicial do OpenWeatherMap$/, () => {
  cy.then(() => {
    inicioDoCarregamento = Date.now();
  });
  homePage.visit();
});

Given('dispenso o banner de cookies', () => {
  cy.dismissCookies();
});

When('recarrego a página', () => {
  homePage.reload();
});

Then('a página não deve registrar erros de JavaScript', () => {
  cy.then(() => {
    expect(errosDaPagina, `erros de JavaScript na página: ${errosDaPagina.join(' | ')}`).to.be.empty;
  });
});

Given('que estou usando o dispositivo {string}', (dispositivo: string) => {
  cy.fixture('devices').then((devices) => {
    cy.viewport(devices[dispositivo].width, devices[dispositivo].height);
  });
});

Then('a página não deve ter rolagem horizontal', () => {
  cy.document().then((doc) => {
    const larguraDaPagina = doc.documentElement.scrollWidth;
    const larguraDaTela = doc.documentElement.clientWidth;
    expect(larguraDaPagina, 'largura da página').to.be.at.most(larguraDaTela);
  });
});

Then('o bloco de clima atual deve ficar visível em até {int} segundos', (segundos: number) => {
  currentWeather.elements.feelsLike().should('be.visible').then(() => {
    const tempo = Date.now() - inicioDoCarregamento;
    expect(tempo, 'tempo de carregamento (ms)').to.be.at.most(segundos * 1000);
  });
});
