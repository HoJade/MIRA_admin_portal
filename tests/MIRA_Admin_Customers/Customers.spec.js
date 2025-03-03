import { test, expect } from '@playwright/test';
// import the configuration
import * as credentials from '../../config/credential'

// set the retry parameter explicitly for this test script
// test.describe.configure({ retries: 0 })



test.beforeEach('Login to MIRA Admin portal', async ({ page }) => {
    // land to MIRA Admin portal login page
    await page.goto(`${credentials.mira_admin_baseURL}/auth/sign-in`);
    await expect(page.getByRole('img')).toBeVisible();
    await page.getByLabel('Username').fill(credentials.username_true);
    await page.getByLabel('Password').fill(credentials.password_true);
    await page.getByRole('button', { name: 'Sign in' }).click();
    // wait to land to MIRA Admin portal main landing page
    await page.waitForSelector('app-home img', { state: 'visible', timeout: 20000 });
});



test.describe('Add Customer page', async () => {

    test.beforeEach('Go to Add Customer page', async ({ page }) => {
        // go to Add Customer page
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Customers' }).click();
        await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'Add Customer' }).click();
        await expect(page).toHaveURL(/\/customers\/edit-customer\/\d*?$/);
    });


    test('check elements on Add Customer page', async ({ page, headless }) => {
        // check Customer Info box
        await expect(page.locator('app-view-info')).toHaveText(/Customer/)
        // check Name field
        await expect(page.locator('mat-form-field > div > div > div > label').nth(0)).toHaveText(/Name/)
        await expect(page.locator('mat-form-field > div > div > div > label > span').nth(0)).toBeVisible()
        await expect(page.locator('[formcontrolname="customerName"]')).toBeVisible()
        // check Login field
        await expect(page.locator('mat-form-field > div > div > div > label').nth(1)).toHaveText(/Login/)
        await expect(page.locator('mat-form-field > div > div > div > label > span').nth(1)).toBeVisible()
        await expect(page.locator('[formcontrolname="login"]')).toBeVisible()
        // check Password field
        await expect(page.locator('mat-form-field > div > div > div > label').nth(2)).toHaveText(/Password/)
        await expect(page.locator('mat-form-field > div > div > div > label > span').nth(2)).toBeVisible()
        await expect(page.locator('[formcontrolname="password"]')).toBeVisible()
        await expect(page.locator('form').getByRole('button')).toBeVisible()
        // check button
        await expect(page.getByRole('button', { name: 'Add Customer' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add Customer' })).toBeDisabled();

        // do image comparison WHEN run in headed mode
        if (headless) {
            await expect.soft(page).toHaveScreenshot({
                maxDiffPixelRatio: 0.02     // Allows up to 2% of pixels to differ
            })
        } else {
            console.log('Skipping screenshot comparison for headed mode.')
        }
    });


    test('check error messages for having empty field', async ({ page }) => {
        // Name field
        await page.locator('[formcontrolname="customerName"]').fill('')
        await page.locator('mat-form-field > div > div > div > label').nth(0).click()
        await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.nameMissing_message))
        // Login field
        await page.locator('[formcontrolname="login"]').fill('')
        await page.locator('mat-form-field > div > div > div > label').nth(1).click()
        await expect(page.locator('mat-error').nth(1)).toHaveText(new RegExp(credentials.loginMissing_message))
        // Password field
        await page.locator('[formcontrolname="password"]').fill('')
        await page.locator('mat-form-field > div > div > div > label').nth(2).click()
        await expect(page.locator('mat-error').nth(2)).toHaveText(new RegExp(credentials.passwordMissing_message))
    });


    test('check error messages for having less characters', async ({ page }) => {
        // Login field
        await page.locator('[formcontrolname="login"]').fill('1')
        await page.locator('mat-form-field > div > div > div > label').nth(1).click()
        await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.loginShort_message))
        // Password field
        await page.locator('[formcontrolname="password"]').fill('1')
        await page.locator('mat-form-field > div > div > div > label').nth(2).click()
        await expect(page.locator('mat-error').nth(1)).toHaveText(new RegExp(credentials.passwordShort_message))
    });


    test('check error messages for having space character', async ({ page }) => {
        // Login field
        await page.locator('[formcontrolname="login"]').fill(' ')
        await page.locator('mat-form-field > div > div > div > label').nth(1).click()
        await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.loginSpace_message))
        // Password field
        await page.locator('[formcontrolname="password"]').fill(' ')
        await page.locator('mat-form-field > div > div > div > label').nth(2).click()
        await expect(page.locator('mat-error').nth(3)).toHaveText(new RegExp(credentials.passwordSpace_message))
    });


    test('check error message for already existing Login', async ({ page }) => {
        // Login field
        await page.locator('[formcontrolname="login"]').fill(credentials.loginAlrExist)
        await page.locator('mat-form-field > div > div > div > label').nth(1).click()
        await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.loginAlrExist_message))
    });


    test('check maximum cap for Name input field', async ({ page }) => {
        // input Name field with more than 50 characters
        await page.locator('[formcontrolname="customerName"]').fill(credentials.over50Char)
        // check the displayed Name
        const cap50CharName = await page.inputValue('[formcontrolname="customerName"]')
        await expect(cap50CharName).toBe('a'.repeat(50))
        console.log('#Try to input at Name:', credentials.over50Char)
        console.log('Length of input Name:', credentials.over50Char.length)
        console.log('Actual displayed Name:', cap50CharName)
        console.log('Length of displayed Name:', cap50CharName.length)
    });


    test('check maximum cap for Login input field', async ({ page }) => {
        // input Login field with more than 20 characters
        await page.locator('[formcontrolname="login"]').fill(credentials.over20Char)
        // check the displayed Login
        const cap20CharLogin = await page.inputValue('[formcontrolname="login"]')
        await expect(cap20CharLogin).toBe('a'.repeat(20))
        console.log('#Try to input at Login:', credentials.over20Char)
        console.log('Length of input Login:', credentials.over20Char.length)
        console.log('Actual displayed Login:', cap20CharLogin)
        console.log('Length of displayed Name:', cap20CharLogin.length)
    });


    test('check valid Password input before/after revealing', async ({ page }) => {
        // input valid Password
        await page.locator('[formcontrolname="password"]').fill(credentials.passwordValid)
        // click to reveal
        await page.locator('mat-form-field').filter({ hasText: 'Password' }).getByRole('button').click();
        const revealedPassword = await page.inputValue('[formcontrolname="password"]')
        expect(revealedPassword).toBe(credentials.passwordValid)
    });


    test('check button is enabled after valid input', async ({ page }) => {
        // input valid Name, Login, Password
        await page.locator('[formcontrolname="customerName"]').fill(credentials.nameValid)
        await page.locator('[formcontrolname="login"]').fill(credentials.loginValid)
        await page.locator('[formcontrolname="password"]').fill(credentials.passwordValid)
        await expect(page.getByRole('button', { name: 'Add Customer' })).toBeEnabled();
    });
});



test.describe('View Customers page', async () => {

    test.beforeEach('Go to View Customers page', async ({ page }) => {
        // go to View Customers page
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Customers' }).click();
        await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'View Customers' }).click();
        await expect(page).toHaveURL(/\/customers\/all\/?$/);
    });


    test('check elements on View Customers page', async ({ page }) => {
        // check button
        await expect(page.getByRole('button', { name: 'Add Customer' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add Customer' })).toBeEnabled();
        // check filter field
        await expect(page.locator('mat-form-field')).toHaveText(/Filter/);
        await expect(page.locator('mat-form-field')).toBeVisible();

        // check the redirection to Add Customer page
        await page.getByRole('button', { name: 'Add Customer' }).click();
        await expect(page).toHaveURL(/\/customers\/edit-customer\/\d*?$/);
    });
});