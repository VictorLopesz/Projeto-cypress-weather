class HomePage {
  elements = {
    locationIcon: () => cy.get('.weather-header-container img[alt="Location"]'),
    unitButton: (unit: string) => cy.contains('.weather-header-container button', unit),
    errorTitle: () => cy.contains('h2', 'Something went wrong'),
    errorDetail: () => cy.contains('Unable to load weather'),
    button: (name: string) => cy.contains('button', name),
  };

  visit() {
    cy.visit('/');
    // Espera o widget carregar (com os dados ou com a mensagem de erro)
    cy.contains(/Feels like|Something went wrong/, { timeout: 30000 });
  }

  reload() {
    cy.reload();
    cy.contains(/Feels like|Something went wrong/, { timeout: 30000 });
  }

  // Texto "Cidade, CC" ao lado do ícone de localização (ex.: "London, GB")
  cityName() {
    return this.elements.locationIcon().parent().parent();
  }

  // Troca a unidade (°C ou °F) e espera a API responder na nova unidade
  selectUnit(unit: string) {
    const units = unit === '°F' ? 'imperial' : 'metric';
    cy.intercept({ method: 'GET', pathname: '/api/widget/onecall', query: { units: units } }).as('novaUnidade');
    this.elements.unitButton(unit).click();
    cy.wait('@novaUnidade');
  }
}

export default new HomePage();
