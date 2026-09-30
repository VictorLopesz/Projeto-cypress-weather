import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../../pages/HomePage';
import searchBar from '../../pages/SearchBar';

Given('o clima da cidade {string} está sendo exibido', (cidade: string) => {
  cy.searchCity(cidade);
});

When('consulto o clima da cidade {string}', (cidade: string) => {
  cy.searchCity(cidade);
});

When('pesquiso pela cidade {string}', (termo: string) => {
  // Alguns termos do .feature são marcadores (ex.: "[vazio]") trocados pelo valor real de inputs.json
  cy.fixture('inputs').then((inputs) => {
    const texto = inputs[termo] !== undefined ? inputs[termo] : termo;
    searchBar.search(texto);
  });
});

When('seleciono a sugestão {string}', (sugestao: string) => {
  searchBar.selectSuggestion(sugestao);
});

When('seleciono a primeira sugestão', () => {
  searchBar.selectFirstSuggestion();
});

Then('devo ver uma lista de sugestões de cidades', () => {
  searchBar.elements.suggestions().should('have.length.greaterThan', 0);
});

Then('a lista deve conter no máximo {int} sugestões', (maximo: number) => {
  searchBar.elements.suggestions().should('have.length.at.most', maximo);
});

Then('cada sugestão deve exibir o nome da cidade e as coordenadas', () => {
  searchBar.elements.suggestionNames().each(($nome) => {
    expect($nome.text().trim(), 'nome da cidade').not.to.be.empty;
  });
  searchBar.elements.suggestionCoordinates().each(($coordenadas) => {
    expect($coordenadas.text(), 'coordenadas').to.match(/^-?\d+\.\d+, -?\d+\.\d+$/);
  });
});

Then('a lista de sugestões deve conter {string}', (sugestao: string) => {
  searchBar.elements.suggestions().contains(sugestao).should('be.visible');
});

Then('a lista de sugestões deve conter mais de uma cidade', () => {
  searchBar.elements.suggestions().should('have.length.greaterThan', 1);
});

Then('as sugestões devem pertencer a pelo menos {int} regiões diferentes', (minimo: number) => {
  const regioes: string[] = [];
  searchBar.elements
    .suggestionNames()
    .each(($nome) => {
      // "London, England" → região "England"
      const regiao = $nome.text().split(',')[1]?.trim();
      if (regiao && !regioes.includes(regiao)) {
        regioes.push(regiao);
      }
    })
    .then(() => {
      expect(regioes.length, `regiões: ${regioes.join(', ')}`).to.be.at.least(minimo);
    });
});

Then('a lista de sugestões não deve conter itens duplicados', () => {
  const vistos: string[] = [];
  const repetidos: string[] = [];
  searchBar.elements.suggestions().should('have.length.greaterThan', 0);
  searchBar.elements
    .suggestions()
    .each(($sugestao) => {
      const texto = $sugestao.text();
      if (vistos.includes(texto)) {
        repetidos.push(texto);
      }
      vistos.push(texto);
    })
    .then(() => {
      expect(repetidos, 'sugestões repetidas').to.be.empty;
    });
});

Then('nenhuma sugestão deve ser exibida', () => {
  searchBar.elements.suggestions().should('have.length', 0);
});

Then('o campo de busca deve continuar habilitado', () => {
  searchBar.elements.input().should('be.enabled');
});

Then('a cidade exibida deve ser {string}', (cidade: string) => {
  homePage.cityName().should('have.text', cidade);
});
