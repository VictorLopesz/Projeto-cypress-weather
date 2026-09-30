import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'cypress';
import { addCucumberPreprocessorPlugin } from '@badeball/cypress-cucumber-preprocessor';
import { createEsbuildPlugin } from '@badeball/cypress-cucumber-preprocessor/esbuild';
import createBundler from '@bahmutov/cypress-esbuild-preprocessor';

/** URL do ambiente lida do cypress.env.json (fora do git), com fallback para produção. */
function baseUrlFromEnvFile(): string {
  const file = path.join(__dirname, 'cypress.env.json');
  if (fs.existsSync(file)) {
    const { BASE_URL } = JSON.parse(fs.readFileSync(file, 'utf-8')) as { BASE_URL?: string };
    if (BASE_URL) return BASE_URL;
  }
  return 'https://openweathermap.org';
}

export default defineConfig({
  e2e: {
    baseUrl: baseUrlFromEnvFile(),
    // Os cenários Gherkin são os specs; os steps ficam em cypress/support/step_definitions.
    specPattern: 'cypress/e2e/**/*.feature',
    supportFile: 'cypress/support/e2e.ts',
    viewportWidth: 1366,
    viewportHeight: 768,
    video: false,
    screenshotOnRunFailure: true,
    // Site de terceiros em produção: margens maiores que o padrão.
    defaultCommandTimeout: 10_000,
    pageLoadTimeout: 60_000,
    retries: { runMode: process.env.CI ? 1 : 0, openMode: 0 },
    async setupNodeEvents(on, config) {
      await addCucumberPreprocessorPlugin(on, config);
      on('file:preprocessor', createBundler({ plugins: [createEsbuildPlugin(config)] }));
      return config;
    },
  },
});
