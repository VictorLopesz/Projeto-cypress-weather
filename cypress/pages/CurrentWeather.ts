class CurrentWeather {
  elements = {
    block: () => cy.get('.weather-current-weather'),
    // Hoje mostra só a hora (ex.: "3:24 PM")
    localTime: () => cy.get('.weather-current-weather').contains(/^\d{1,2}:\d{2} [AP]M$/),
    // Outro dia selecionado mostra a data (ex.: "Wed, Sep 30")
    date: (text: string) => cy.get('.weather-current-weather').contains(text),
    // Temperatura principal (ex.: "25°")
    temperature: () => cy.get('.weather-current-weather').contains(/^-?\d+°$/),
    feelsLike: () => cy.get('.weather-current-weather').contains(/^Feels like/),
    // A descrição (ex.: "Scattered Clouds") fica logo antes do "Feels like"
    description: () => cy.get('.weather-current-weather').contains(/^Feels like/).prev(),
    // Valor de um detalhe pelo nome: "Wind", "Humidity", "Visibility", "Pressure", "UV Index", "Dew Point"
    detail: (label: string) => cy.get('.weather-current-weather').contains('span', label).parent().next(),
  };
}

export default new CurrentWeather();
