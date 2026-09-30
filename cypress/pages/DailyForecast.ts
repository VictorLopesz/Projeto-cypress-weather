class DailyForecast {
  elements = {
    // Cada dia é um botão: "Today 25°", "Wed 25°", ...
    days: () => cy.get('.weather-daily-tabs-container button'),
    // Partes de cada dia: nome ("Today", "Wed"), temperatura ("25°") e ícone (o "alt" tem a descrição)
    dayNames: () => cy.get('.weather-daily-tabs-container button > span:nth-child(1)'),
    dayTemperatures: () => cy.get('.weather-daily-tabs-container button > span:nth-child(2)'),
    dayIcons: () => cy.get('.weather-daily-tabs-container button > img'),
  };

  // Posição começa em 1 (1 = "Today")
  selectDay(position: number) {
    this.elements.days().eq(position - 1).click();
  }
}

export default new DailyForecast();
