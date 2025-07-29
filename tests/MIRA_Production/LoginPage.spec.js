import { test, expect } from '@playwright/test';
// import the configuration
import { trace } from '../../playwright.config'
import * as credentials from '../../config/credential'

// set the retry parameter explicitly for this test script
// test.describe.configure({ retries: 0 })

/* Un-comment this section WHEN trace is not set to 'on' in the playwright.config.js

// set-up the tracing for all the tests in this file
let context
let page
let isTracingStarted = false    // track if tracking has been started

test.beforeAll(async ({ browser }) => {
    context = await browser.newContext()

    // only start tracing if it is not 'on' and it hasn't been started yet 
    if (trace !== 'on') {
        try {
            await context.tracing.start(
                {
                    snapshots: true,      // snapshot --> every actions: Action | Before | After
                    screenshots: true     // screenshot --> the screen capture during the tracing
                })
            isTracingStarted = true     // set flag to true
        } catch (error) {
            console.error('Error starting tracing:', error)

        }
    }

    // only create a new page if tracing has started
    if (isTracingStarted) {
        page = await context.newPage()
    }
})
// stop the tracing for all the tests in this file, and give the location and name of the trace file
test.afterAll(async () => {
    // only stop tracing if it was started
    if (isTracingStarted) {
        try {
            await context.tracing.stop({ path: './trace-viewer/record_trace.zip' })
            isTracingStarted = false        // reset the flag
        } catch (error) {
            console.error('Error stopping tracing:', error)
        }

    }

})
*/


test.beforeEach('Land to MIRA Production portal login page', async ({ page }) => {
    // land to MIRA Production portal login page
    await page.goto(`${credentials.mira_production_baseURL}/login`);
    await expect(page.locator('app-login')).toBeVisible();
});



test.describe('MIRA Production portal Login page', () => {

    test.describe('1st time visit', () => {

        test('check elements on MIRA Production portal Login page', async ({ page, headless }) => {
            // check header
            await expect(page.locator('[header="Sign In"]')).toBeVisible()
            // check Username field
            const username = page.locator('[inputid="username"]')
            await expect(username).toBeVisible();
            await expect(username).toHaveText(/Username/);
            await expect(username.getByLabel("Username")).toBeVisible()
            // check Password field
            const password = page.locator('[inputid="password"]')
            await expect(password).toBeVisible();
            await expect(password).toHaveText(/Password/);
            await expect(password.getByLabel("Password")).toBeVisible()
            // check button
            await expect(page.getByRole('button', { name: 'Login' })).toBeVisible()

            // do image comparison WHEN run in headed mode
            if (headless) {
                await expect.soft(page).toHaveScreenshot()
            } else {
                console.log('Skipping screenshot comparison for headed mode.')
            }
        });


        test('login_success', async ({ page, headless }) => {
            // Username
            await page.getByLabel('Username').click();
            await page.getByLabel('Username').fill(credentials.customerName_true);
            console.log('Username:', credentials.customerName_true)
            // Password
            await page.getByLabel('Password').click();
            await page.getByLabel('Password').fill(credentials.customerPassword_true);
            console.log('Password:', credentials.customerPassword_true)

            // Log-in
            try {
                await Promise.all([
                    // wait to land to MIRA Production portal
                    page.waitForURL(/products/),
                    // click on the Login button
                    page.getByRole('button', { name: 'Login' }).click(),
                ])
            } catch (error) {
                console.log('Login process took too long:', error)
            }
            // land to MIRA Production portal main landing page
            await expect(page).toHaveURL(/products/);
            const login_success_tooltip = page.getByRole('alert')
            await login_success_tooltip.hover()
            await expect(login_success_tooltip).toBeVisible()
            await expect(login_success_tooltip.locator('[data-pc-section="detail"]')).toHaveText(credentials.login_success_message)
            // do image comparison WHEN run in headed mode
            if (headless) {
                await expect.soft(login_success_tooltip).toHaveScreenshot()
            } else {
                console.log('Skipping screenshot comparison for headed mode.')
            }
        });


        test('login_fail_username', async ({ page, headless }) => {
            // Username
            await page.getByLabel('Username').fill(credentials.username_false);
            console.log('Username:', credentials.username_false)
            // Password
            await page.getByLabel('Password').fill(credentials.password_false);
            console.log('Password:', credentials.password_false)
            // Log-in
            await page.getByRole('button', { name: 'Login' }).click();

            // check error message
            const login_fail_tooltip = page.getByRole('alert')
            await login_fail_tooltip.hover()
            await expect(login_fail_tooltip).toBeVisible()
            await expect(login_fail_tooltip.locator('[data-pc-section="detail"]')).toHaveText(credentials.login_username_fail_message)
            // do image comparison WHEN run in headed mode
            if (headless) {
                await expect.soft(login_fail_tooltip).toHaveScreenshot()
            } else {
                console.log('Skipping screenshot comparison for headed mode.')
            }
        });


        test('login_fail_password', async ({ page, headless }) => {
            // Username
            await page.getByLabel('Username').fill(credentials.customerName_true);
            console.log('Username:', credentials.customerName_true)
            // Password
            await page.getByLabel('Password').fill(credentials.password_false);
            console.log('Password:', credentials.password_false)
            // Log-in
            await page.getByRole('button', { name: 'Login' }).click();

            // check error message
            const login_fail_tooltip = page.getByRole('alert')
            await login_fail_tooltip.hover()
            await expect(login_fail_tooltip).toBeVisible()
            await expect(login_fail_tooltip.locator('[data-pc-section="detail"]')).toHaveText(credentials.login_password_fail_message)
            // do image comparison WHEN run in headed mode
            if (headless) {
                await expect.soft(login_fail_tooltip).toHaveScreenshot()
            } else {
                console.log('Skipping screenshot comparison for headed mode.')
            }
        });
    });



    test.describe('non-1st time visit', () => {

        test.beforeEach('Login to MIRA Admin portal', async ({ page }) => {
            // land to MIRA Production portal login page
            await page.goto(`${credentials.mira_production_baseURL}/login`);
            await expect(page.locator('app-login')).toBeVisible();
            await page.getByLabel('Username').fill(credentials.customerName_true);
            await page.getByLabel('Password').fill(credentials.customerPassword_true);
            await Promise.all([
                // wait to land to MIRA Production portal
                page.waitForSelector('p-menu', { state: 'visible', timeout: 20000 }),
                // click on the Login button
                page.getByRole('button', { name: 'Login' }).click(),
            ])
        });

        test.beforeEach('Sign out from MIRA Production portal', async ({ page }) => {
            // sign out from MIRA Production portal
            await page.getByRole('button', { name: 'Sign out' }).click();
            // wait to land to MIRA Production portal login page
            await expect(page).toHaveURL(/\/login\/?$/)
        });


        test('login page cached Customer Username value', async ({ page, headless }) => {
            await expect(page.getByRole('button', { name: 'New Customer' })).toBeVisible();
        });
    });
});