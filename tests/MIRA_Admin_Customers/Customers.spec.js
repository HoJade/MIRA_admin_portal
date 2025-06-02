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
        const locator_name = page.locator('label').filter({ hasText: /^\s*Name\s*$/ })
        await expect(locator_name).toBeVisible()
        await expect(locator_name.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="customerName"]')).toBeVisible()
        // check input limit
        const input_name = page.locator('input[formcontrolname="customerName"]')
        const hintId_name = await input_name.getAttribute('aria-describedby')
        await expect(page.locator(`#${hintId_name}`)).toHaveText('0/50')

        // check Login field
        const locator_login = page.locator('label').filter({ hasText: /^\s*Login\s*$/ })
        await expect(locator_login).toBeVisible()
        await expect(locator_login.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="login"]')).toBeVisible()
        // check input limit
        const input_login = page.locator('input[formcontrolname="login"]')
        const hintId_login = await input_login.getAttribute('aria-describedby')
        await expect(page.locator(`#${hintId_login}`)).toHaveText('0/20')

        // check Password field
        const locator_password = page.locator('label').filter({ hasText: /^\s*Password\s*$/ })
        await expect(locator_password).toBeVisible()
        await expect(locator_password.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="password"]')).toBeVisible()
        // check reveal button
        await expect(page.locator('mat-form-field').filter({ hasText: 'Password' }).getByRole('button')).toBeVisible()

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
        await page.locator('label').filter({ hasText: /^\s*Name\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.name_missing_message) })).toBeVisible()
        // Login field
        await page.locator('[formcontrolname="login"]').fill('')
        await page.locator('label').filter({ hasText: /^\s*Login\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.login_missing_message) })).toBeVisible()
        // Password field
        await page.locator('[formcontrolname="password"]').fill('')
        await page.locator('label').filter({ hasText: /^\s*Password\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.password_missing_message) })).toBeVisible()
    });


    test('check error messages for having less characters', async ({ page }) => {
        // Login field
        await page.locator('[formcontrolname="login"]').fill('1')
        await page.locator('label').filter({ hasText: /^\s*Login\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.login_short_message) })).toBeVisible()
        // Password field
        await page.locator('[formcontrolname="password"]').fill('1')
        await page.locator('label').filter({ hasText: /^\s*Password\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.password_short_message) })).toBeVisible()
    });


    test('check error messages for having space character', async ({ page }) => {
        // Login field
        await page.locator('[formcontrolname="login"]').fill(' ')
        await page.locator('label').filter({ hasText: /^\s*Login\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.login_space_message) })).toBeVisible()
        // Password field
        await page.locator('[formcontrolname="password"]').fill(' ')
        await page.locator('label').filter({ hasText: /^\s*Password\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.password_space_message) })).toBeVisible()
    });


    test('check error message for already existing Login', async ({ page }) => {
        // Login field
        await page.locator('[formcontrolname="login"]').fill(credentials.login_alrExist)
        await page.locator('label').filter({ hasText: /^\s*Login\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.login_alrExist_message) })).toBeVisible()
    });


    test('check maximum cap for Name input field', async ({ page }) => {
        // input Name field with more than 50 characters
        await page.locator('[formcontrolname="customerName"]').fill(credentials.over50Char)
        // check the displayed Name
        const cap50Char_Name = await page.inputValue('[formcontrolname="customerName"]')
        await expect(cap50Char_Name).toBe('a'.repeat(50))
        console.log('#Try to input at Name:', credentials.over50Char)
        console.log('Length of input Name:', credentials.over50Char.length)
        console.log('Actual displayed Name:', cap50Char_Name)
        console.log('Length of displayed Name:', cap50Char_Name.length)
    });


    test('check maximum cap for Login input field', async ({ page }) => {
        // input Login field with more than 20 characters
        await page.locator('[formcontrolname="login"]').fill(credentials.over20Char)
        // check the displayed Login
        const cap20Char_Login = await page.inputValue('[formcontrolname="login"]')
        await expect(cap20Char_Login).toBe('a'.repeat(20))
        console.log('#Try to input at Login:', credentials.over20Char)
        console.log('Length of input Login:', credentials.over20Char.length)
        console.log('Actual displayed Login:', cap20Char_Login)
        console.log('Length of displayed Name:', cap20Char_Login.length)
    });


    test('check valid Password input before/after revealing', async ({ page }) => {
        // input valid Password
        await page.locator('[formcontrolname="password"]').fill(credentials.password_valid)
        // check the icon
        const icon_reveal = page.locator('mat-form-field').filter({ hasText: 'Password' }).getByRole('button')
        await expect(icon_reveal.locator('mat-icon')).toHaveAttribute('data-mat-icon-name', 'eye')
        // click to reveal
        await icon_reveal.click();
        const revealedPassword = await page.inputValue('[formcontrolname="password"]')
        expect(revealedPassword).toBe(credentials.password_valid)
        // check the icon
        const icon_conceal = page.locator('mat-form-field').filter({ hasText: 'Password' }).getByRole('button')
        await expect(icon_conceal.locator('mat-icon')).toHaveAttribute('data-mat-icon-name', 'eye-slash')
    });


    test('check button is enabled after valid input', async ({ page }) => {
        // input valid Name, Login, Password
        await page.locator('[formcontrolname="customerName"]').fill(credentials.name_valid)
        await page.locator('[formcontrolname="login"]').fill(credentials.login_valid)
        await page.locator('[formcontrolname="password"]').fill(credentials.password_valid)
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