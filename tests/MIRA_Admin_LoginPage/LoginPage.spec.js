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


test.beforeEach('Land to MIRA Admin portal login page', async ({ page }) => {
    // land to MIRA Admin portal login page
    await page.goto(`${credentials.mira_admin_baseURL}/auth/sign-in`);
    await expect(page.getByRole('img')).toBeVisible();
});



test.describe('MIRA Admin portal Login page', () => {

    test('check elements on MIRA Admin portal Login page', async ({ page, headless }) => {
        // check Username field
        await expect(page.locator('#mat-mdc-form-field-label-0')).toHaveText(/Username/);
        await expect(page.locator('xpath=//span[@class="mat-mdc-form-field-required-marker mdc-floating-label--required ng-tns-c2608167813-1 ng-star-inserted"]')).toBeVisible();
        await expect(page.locator('#username')).toBeVisible()
        // check Password field
        await expect(page.locator('#mat-mdc-form-field-label-2')).toHaveText(/Password/);
        await expect(page.locator('xpath=//span[@class="mat-mdc-form-field-required-marker mdc-floating-label--required ng-tns-c2608167813-2 ng-star-inserted"]')).toBeVisible();
        await expect(page.locator('mat-form-field').filter({ hasText: 'Password' }).getByRole('button')).toBeVisible()
        await expect(page.locator('#password')).toBeVisible()
        // check button
        await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
        // check "Forgot password" hyperlink
        await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute('href', expect.stringContaining('forgot-password'))
        // do image comparison WHEN run in headed mode
        if (headless) {
            await expect.soft(page).toHaveScreenshot({
                maxDiffPixelRatio: 0.02     // Allows up to 2% of pixels to differ
            })
        } else {
            console.log('Skipping screenshot comparison for headed mode.')
        }
    })


    test('check error messages for having empty field', async ({ page }) => {
        // Username field
        await page.locator('#username').fill('')
        await page.locator('label').filter({ hasText: 'Username' }).click()
        await expect(page.locator('mat-error').filter({ hasText: credentials.username_missing_message })).toBeVisible()
        // Password field
        await page.locator('#password').fill('')
        await page.locator('label').filter({ hasText: 'Password' }).click()
        await expect(page.locator('mat-error').filter({ hasText: credentials.password_missing_message })).toBeVisible()
    })


    test('login_success', async ({ page }) => {

        // Username
        await page.getByLabel('Username').click();
        await page.getByLabel('Username').fill(credentials.username_true);
        console.log('Username:', credentials.username_true)

        // Password
        await page.getByLabel('Password').click();
        await page.getByLabel('Password').fill(credentials.password_true);
        console.log('Password:', credentials.password_true)

        // check password input
        await page.locator('mat-form-field').filter({ hasText: 'Password' }).getByRole('button').click();
        const revealedPassword = await page.inputValue('#password')
        expect(revealedPassword).toBe(credentials.password_true)

        // Sign-in
        await page.getByRole('button', { name: 'Sign in' }).click();

        // land to MIRA Admin portal main landing page
        await page.waitForURL(/home/)
        await expect(page).toHaveURL(/home/);
        await expect(page.locator('app-home').getByRole('img')).toBeVisible({ timeout: 20000 });
        const user_name = await page.locator('[class="user-name font-semibold"]').innerText()
        console.log('User Name:', user_name)
        await expect(page.getByRole('paragraph')).toHaveText(new RegExp('Welcome ' + user_name))
    });


    test('login_fail_username', async ({ page }) => {

        // Username
        await page.getByLabel('Username').fill(credentials.username_false);
        console.log('Username:', credentials.username_false)

        // Password
        await page.getByLabel('Password').fill(credentials.password_false);
        console.log('Password:', credentials.password_false)

        // Sign-in
        await page.getByRole('button', { name: 'Sign in' }).click();

        // check error message
        await expect(page.locator('fuse-alert div').first()).toHaveText(credentials.incorrectUsername_message);
    });


    test('login_fail_password', async ({ page }) => {

        // Username
        await page.getByLabel('Username').fill(credentials.username_true);
        console.log('Username:', credentials.username_true)

        // Password
        await page.getByLabel('Password').fill(credentials.password_false);
        console.log('Password:', credentials.password_false)

        // Sign-in
        await page.getByRole('button', { name: 'Sign in' }).click();

        // check error message
        await expect(page.locator('fuse-alert div').first()).toHaveText(credentials.incorrectPassword_message);
    });



    test.describe('Forgot Password page', () => {

        test.beforeEach('Land to Forgot password page', async ({ page }) => {
            // click "Forgot password" hyperlink
            await page.getByRole('link', { name: 'Forgot password?' }).click()
            await expect(page).toHaveURL(/\/auth\/forgot-password\/?$/)
        })


        test('check elements on Forgot Password page', async ({ page, headless }) => {
            // check Email field
            const locator_confirmNewPassword = page.locator('mat-form-field').filter({ hasText: 'Email' })
            await expect(locator_confirmNewPassword.locator('label')).toBeVisible()
            await expect(locator_confirmNewPassword.locator('label > span')).toBeVisible()
            await expect(locator_confirmNewPassword.locator('#email')).toBeVisible()
            // check button
            await expect(page.getByRole('button', { name: 'Send Reset Link' })).toBeVisible()
            // check "sign in" hyperlink
            await expect(page.getByRole('link', { name: 'sign in' })).toBeVisible()
            await expect(page.getByRole('link', { name: 'sign in' })).toHaveAttribute('href', expect.stringContaining('sign-in'))
            // do image comparison WHEN run in headed mode
            if (headless) {
                await expect.soft(page).toHaveScreenshot({
                    maxDiffPixelRatio: 0.02     // Allows up to 2% of pixels to differ
                })
            } else {
                console.log('Skipping screenshot comparison for headed mode.')
            }
        })


        test('check error message for having empty field', async ({ page }) => {
            // Email field
            await page.locator('#email').fill('')
            await page.locator('label').filter({ hasText: 'Email' }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.emailMissingForgotPassword_message })).toBeVisible()
        })


        test('check error message for invalid Email', async ({ page }) => {
            // Email field
            await page.locator('#email').fill(credentials.email_invalid)
            await page.locator('label').filter({ hasText: 'Email' }).click()

            // check error message
            /*  `.toHaveText()` check for exact match, and implies checking visibility 
                `.toContainText()` check for partial match
            */
            await expect(page.locator('mat-error')).toHaveText(new RegExp(credentials.emailInavlidForgotPassword_message))
        })


        test('check redirection to Sign-in page', async ({ page, headless }) => {
            // click "sign in" hyperlink
            await page.getByRole('link', { name: 'sign in' }).click()
            await expect(page).toHaveURL(/\/auth\/sign-in\/?$/)
            // do image comparison WHEN run in headed mode
            if (headless) {
                await expect.soft(page).toHaveScreenshot({
                    maxDiffPixelRatio: 0.02     // Allows up to 2% of pixels to differ
                })
            } else {
                console.log('Skipping screenshot comparison for headed mode.')
            }
        })
    })
});