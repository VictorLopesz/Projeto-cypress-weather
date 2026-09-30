import { Then, When } from '@badeball/cypress-cucumber-preprocessor';
import currentWeather from '../../pages/CurrentWeather';
import dailyForecast from '../../pages/DailyForecast';
import hourlyForecast from '../../pages/HourlyForecast';
import { dateLabelIn, weekdayIn } from '../utils/datetime';

// ----- Previsão diária -----
// Cada dia tem o nome ("Today", "Wed"), a temperatura ("25°") e um ícone com a descrição

Then('a previsão diária deve conter exatamente {int} dias', (quantidade: number) => {
  dailyForecast.elements.days().should('have.length', quantidade);
});

Then('o primeiro dia da previsão deve ser {string}', (nome: string) => {
  dailyForecast.elements.dayNames().first().should('have.text', nome);
});

Then('os demais dias devem ser consecutivos a partir de amanhã no fuso {string}', (fuso: string) => {
  dailyForecast.elements.dayNames().each(($nome, indice) => {
    if (indice === 0) {
      return; // o primeiro é "Today"
    }
    expect($nome.text(), `dia ${indice + 1}`).to.equal(weekdayIn(fuso, indice));
  });
});

Then('cada dia da previsão deve exibir o rótulo, a temperatura e o ícone com a descrição do tempo', () => {
  dailyForecast.elements.dayNames().should('have.length', 8).each(($nome) => {
    expect($nome.text()).to.match(/^(Today|Mon|Tue|Wed|Thu|Fri|Sat|Sun)$/);
  });
  dailyForecast.elements.dayTemperatures().should('have.length', 8).each(($temperatura) => {
    expect($temperatura.text()).to.match(/^-?\d+°$/);
  });
  dailyForecast.elements.dayIcons().should('have.length', 8).each(($icone) => {
    expect($icone.attr('alt'), 'descrição do tempo').to.match(/^[a-z ]+$/i);
  });
});

Then('a temperatura de cada dia deve estar entre {int} e {int} °C', (minimo: number, maximo: number) => {
  currentWeather.elements.detail('Dew Point').should('contain', '°C');
  dailyForecast.elements.dayTemperatures().each(($temperatura) => {
    expect(parseInt($temperatura.text())).to.be.within(minimo, maximo);
  });
});

When('seleciono o {int}º dia da previsão', (posicao: number) => {
  dailyForecast.selectDay(posicao);
});

Then('o bloco de clima atual deve exibir a data do {int}º dia no fuso {string}', (posicao: number, fuso: string) => {
  currentWeather.elements.date(dateLabelIn(fuso, posicao - 1)).should('be.visible');
});

// ----- Previsão horária -----
// Cada horário tem a hora ("3 p.m"), a chance de chuva ("0%") e a temperatura ("25°")

Then('a previsão horária deve exibir pelo menos {int} horários', (minimo: number) => {
  hourlyForecast.elements.hours().should('have.length.at.least', minimo);
});

Then('cada horário deve exibir a hora, a probabilidade de chuva e a temperatura', () => {
  hourlyForecast.elements.hours().its('length').then((quantidade) => {
    hourlyForecast.elements.hourLabels().should('have.length', quantidade).each(($hora) => {
      expect($hora.text()).to.match(/^\d{1,2} [ap]\.m$/);
    });
    hourlyForecast.elements.rainChances().should('have.length', quantidade).each(($chuva) => {
      expect($chuva.text()).to.match(/^\d{1,3}%$/);
    });
    hourlyForecast.elements.temperatures().should('have.length', quantidade).each(($temperatura) => {
      expect($temperatura.text()).to.match(/^-?\d+°$/);
    });
  });
});
