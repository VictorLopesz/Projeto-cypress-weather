import { DataTable, Then } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../../pages/HomePage';
import currentWeather from '../../pages/CurrentWeather';
import { clockToMinutes, minutesBetween, minutesNowIn } from '../utils/datetime';

// Liga o nome do campo usado no .feature ao elemento da tela
function elementoDoCampo(campo: string) {
  const campos: Record<string, () => Cypress.Chainable> = {
    'cidade e país': () => homePage.cityName(),
    'horário local': () => currentWeather.elements.localTime(),
    temperatura: () => currentWeather.elements.temperature(),
    descrição: () => currentWeather.elements.description(),
    'sensação térmica': () => currentWeather.elements.feelsLike(),
    vento: () => currentWeather.elements.detail('Wind'),
    umidade: () => currentWeather.elements.detail('Humidity'),
    visibilidade: () => currentWeather.elements.detail('Visibility'),
    pressão: () => currentWeather.elements.detail('Pressure'),
    'índice UV': () => currentWeather.elements.detail('UV Index'),
    'ponto de orvalho': () => currentWeather.elements.detail('Dew Point'),
  };
  return campos[campo]();
}

Then('a temperatura atual deve ser exibida', () => {
  currentWeather.elements.temperature().should('be.visible');
});

Then('o bloco de clima atual deve exibir os campos:', (tabela: DataTable) => {
  cy.fixture('formatos').then((formatos) => {
    tabela.hashes().forEach((linha) => {
      elementoDoCampo(linha.campo).invoke('text').should('match', new RegExp(formatos[linha.campo]));
    });
  });
});

Then('os valores do clima atual devem estar dentro das faixas:', (tabela: DataTable) => {
  tabela.hashes().forEach((linha) => {
    elementoDoCampo(linha.campo).invoke('text').then((texto) => {
      const valor = parseFloat(texto);
      expect(valor, linha.campo).to.be.within(Number(linha.minimo), Number(linha.maximo));
    });
  });
});

Then('o horário exibido deve corresponder ao fuso {string} com tolerância de {int} minutos', (fuso: string, tolerancia: number) => {
  currentWeather.elements.localTime().invoke('text').then((horario) => {
    const diferenca = minutesBetween(clockToMinutes(horario), minutesNowIn(fuso));
    expect(diferenca, `"${horario}" comparado com a hora atual em ${fuso}`).to.be.at.most(tolerancia);
  });
});

Then('o bloco de clima atual deve exibir os valores do mock:', (tabela: DataTable) => {
  tabela.hashes().forEach((linha) => {
    // A descrição aparece com letras maiúsculas por CSS, então a comparação ignora maiúsculas/minúsculas
    elementoDoCampo(linha.campo).invoke('text').then((texto) => {
      expect(texto.trim().toLowerCase(), linha.campo).to.equal(linha.valor.toLowerCase());
    });
  });
});
