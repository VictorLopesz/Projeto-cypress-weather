import { Given, Then, When } from '@badeball/cypress-cucumber-preprocessor';
import homePage from '../../pages/HomePage';
import currentWeather from '../../pages/CurrentWeather';
import hourlyForecast from '../../pages/HourlyForecast';

const MPH_POR_MS = 2.237;

// Serve para "Dado que seleciono a unidade..." e para "Quando seleciono a unidade..."
When(/^(?:que )?seleciono a unidade "(°[CF])"$/, (unidade: string) => {
  homePage.selectUnit(unidade);
});

// Guarda os valores em °C (em aliases) para comparar depois da troca de unidade
Given('que registro as condições atuais em °C', () => {
  currentWeather.elements.detail('Dew Point').should('contain', '°C');
  currentWeather.elements.temperature().invoke('text').then((texto) => {
    cy.wrap(parseInt(texto)).as('temperaturaEmC');
  });
  currentWeather.elements.detail('Wind').invoke('text').then((texto) => {
    cy.wrap(parseFloat(texto)).as('ventoEmMs');
  });
  hourlyForecast.elements.hourLabels().first().invoke('text').then((texto) => {
    cy.wrap(texto).as('primeiroHorario');
  });
  hourlyForecast.elements.temperatures().first().invoke('text').then((texto) => {
    cy.wrap(parseInt(texto)).as('temperaturaDoHorarioEmC');
  });
});

// O ponto de orvalho é o único valor que mostra a unidade (ex.: "18°C")
Then('a unidade de temperatura exibida deve ser {string}', (unidade: string) => {
  currentWeather.elements.detail('Dew Point').should('contain', unidade);
});

Then('a velocidade do vento deve estar em {string}', (unidade: string) => {
  currentWeather.elements.detail('Wind').should('contain', ` ${unidade}`);
});

Then('a visibilidade deve estar em {string}', (unidade: string) => {
  currentWeather.elements.detail('Visibility').invoke('text').should('match', new RegExp(`^\\d+(\\.\\d+)?${unidade}$`));
});

// Obs.: o site troca o rótulo (°C → °F) antes de trocar o número. Por isso as validações abaixo
// usam .should(callback): o Cypress repete a verificação até o número convertido aparecer.

Then(
  'a temperatura atual deve corresponder à conversão da temperatura registrada com tolerância de {int} grau(s)',
  (tolerancia: number) => {
    cy.get<number>('@temperaturaEmC').then((temperaturaEmC) => {
      const esperadoEmF = Math.round((temperaturaEmC * 9) / 5 + 32);
      currentWeather.elements.temperature().should(($temperatura) => {
        const exibidoEmF = parseInt($temperatura.text());
        expect(Math.abs(exibidoEmF - esperadoEmF), `${temperaturaEmC}°C → esperado ≈${esperadoEmF}°F`).to.be.at.most(tolerancia);
      });
    });
  },
);

Then(
  'a temperatura do primeiro horário registrado deve corresponder à conversão com tolerância de {int} grau(s)',
  (tolerancia: number) => {
    cy.get<string>('@primeiroHorario').then((horario) => {
      cy.get<number>('@temperaturaDoHorarioEmC').then((temperaturaEmC) => {
        const esperadoEmF = Math.round((temperaturaEmC * 9) / 5 + 32);
        // Procura o mesmo horário, porque a lista pode começar em outra hora depois da troca
        hourlyForecast.elements.temperatureAt(horario).should(($temperatura) => {
          const exibidoEmF = parseInt($temperatura.text());
          expect(Math.abs(exibidoEmF - esperadoEmF), `${horario}: ${temperaturaEmC}°C → esperado ≈${esperadoEmF}°F`).to.be.at.most(tolerancia);
        });
      });
    });
  },
);

Then('a velocidade do vento deve corresponder à conversão da velocidade registrada', () => {
  cy.get<number>('@ventoEmMs').then((ventoEmMs) => {
    // A tela arredonda o valor em m/s (ex.: "3 m/s" pode ser de 2.5 a 3.5 m/s)
    const minimo = Math.floor(Math.max(0, ventoEmMs - 0.5) * MPH_POR_MS * 10) / 10;
    const maximo = Math.ceil((ventoEmMs + 0.5) * MPH_POR_MS * 10) / 10;
    currentWeather.elements.detail('Wind').should(($vento) => {
      const exibidoEmMph = parseFloat($vento.text());
      expect(exibidoEmMph, `${ventoEmMs} m/s → esperado entre ${minimo} e ${maximo} mph`).to.be.within(minimo, maximo);
    });
  });
});
