class HourlyForecast {
  elements = {
    // Cada horário é um card com 3 textos: hora ("3 p.m"), chance de chuva ("0%") e temperatura ("25°")
    hours: () => cy.get('.weather-hourly-chart-inner.flex > div'),
    hourLabels: () => cy.get('.weather-hourly-chart-inner.flex > div > span:first-child'),
    rainChances: () => cy.get('.weather-hourly-chart-inner.flex > div > div > span'),
    temperatures: () => cy.get('.weather-hourly-chart-inner.flex > div > span:last-child'),
    // Temperatura de um horário específico (ex.: "9 p.m")
    temperatureAt: (label: string) => cy.contains('.weather-hourly-chart-inner.flex > div', label).children('span').last(),
  };
}

export default new HourlyForecast();
