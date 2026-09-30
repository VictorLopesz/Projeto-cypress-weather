class SearchBar {
  elements = {
    input: () => cy.get('input[placeholder="Search City"]'),
    // As sugestões são os botões do cabeçalho, menos os botões °C e °F
    suggestions: () => cy.get('.weather-header-container button').not(':contains("°C")').not(':contains("°F")'),
    // Cada sugestão tem o nome ("London, England") e, embaixo, as coordenadas ("51.51, -0.13")
    suggestionNames: () => cy.get('.weather-header-container button .text-base'),
    suggestionCoordinates: () => cy.get('.weather-header-container button .text-xs'),
  };

  search(term: string) {
    cy.intercept('GET', '**/api/widget/geo*').as('buscaCidade');
    this.elements.input().clear();

    // Campo vazio: só limpa, não tem o que digitar
    if (term === '') {
      return;
    }

    this.elements.input().type(term, { delay: 0, parseSpecialCharSequences: false });

    // Só espaços não disparam a busca no site, então só espera quando tem texto
    if (term.trim() !== '') {
      cy.wait('@buscaCidade');
    }
  }

  selectSuggestion(text: string) {
    cy.intercept('GET', '**/api/widget/onecall*').as('carregarClima');
    this.elements.suggestions().contains(text).click();
    cy.wait('@carregarClima');
  }

  selectFirstSuggestion() {
    cy.intercept('GET', '**/api/widget/onecall*').as('carregarClima');
    this.elements.suggestions().first().click();
    cy.wait('@carregarClima');
  }
}

export default new SearchBar();
