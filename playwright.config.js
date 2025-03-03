// @ts-check
const { defineConfig, devices } = require('@playwright/test');

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config({ path: path.resolve(__dirname, '.env') });

/**
 * @see https://playwright.dev/docs/test-configuration
 */


// import artillery cloud api key
import { ARTILLERY_CLOUD_API_KEY } from './config/credential'

// set up reporters; Keep the HTML report if needed, so you can still generate local HTML reports
const reporters = [
  ["html"]
];

// Enable Artillery Cloud reporter only if the environment variable is set
// Default ENABLE_ARTILLERY_REPORTER to "false" if not explicitly set
const enableArtilleryReporter = !!process.env.ENABLE_ARTILLERY_REPORTER && process.env.ENABLE_ARTILLERY_REPORTER.toLowerCase() === "true";

if (enableArtilleryReporter) {
  // Set the Artillery Cloud API Key
  process.env.ARTILLERY_CLOUD_API_KEY = ARTILLERY_CLOUD_API_KEY;
  reporters.push(["@artilleryio/playwright-reporter", { name: "My Test Suite" }]);
}


// Detect if the test is being retried
const isRetry = process.env.PLAYWRIGHT_RETRIES === 'true';


module.exports = defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,


  /* Retry on CI only */
  //retries: process.env.CI ? 2 : 0,
  retries: 1,
  timeout: 20 * 1000,     // originally, the global timeout = 30 sec
  expect: {
    /**
     * Maximum time expect() should wait for the condition to be met.
     * For example in `await expect(locator).toHaveText();`
     */
    timeout: 8000       // originally, the expect() timeout = 5 sec
  },


  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  // originally, reporter: 'html',
  reporter: reporters,

  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://127.0.0.1:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on',      // on-first-retry | on-all-retry | off | on | retain-on-failure

    /* Run tests in headful/headless mode. */
    // headless: false,                  // Set to true for headless mode

    /* Record videos of test runs. */
    video: 'retain-on-failure',       // off | on | on-first-retry | retain-on-failure | retry-with-video
    /* Record in slow motion. */
    launchOptions: {
      slowMo: isRetry ? 1000 : 0,                 // Apply slowMo only during retires; slow down the browser operations by 1000ms (1s)
    },
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },

    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },

    // NOTE: Safari is not supported
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    {
      name: 'Microsoft Edge',
      use: { ...devices['Desktop Edge'], channel: 'msedge' },
    },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://127.0.0.1:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});

