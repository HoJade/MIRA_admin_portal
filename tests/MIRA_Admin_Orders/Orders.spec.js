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



test.describe('Add Order page', async () => {

    test.beforeEach('Go to Add Order page', async ({ page }) => {
        // go to Add Order page
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Orders' }).click();
        await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'Add Order' }).click();
        await expect(page).toHaveURL(/\/orders\/edit-order\/\d*?$/);
    });


    test('check elements on Add Order page', async ({ page, headless }) => {
        // check Order Info box
        await expect(page.locator('.card')).toHaveText(/Order/)
        // check Customer drop-down field
        await expect(page.locator('mat-form-field > div > div > div > label').nth(0)).toHaveText(/Customer/)
        await expect(page.locator('[formcontrolname="customer"]')).toBeVisible()
        await expect(page.getByLabel('Customer').locator('svg')).toBeVisible()
        // check Product drop-down field
        await expect(page.locator('mat-form-field > div > div > div > label').nth(1)).toHaveText(/Product/)
        await expect(page.locator('mat-form-field > div > div > div > label > span').nth(0)).toBeVisible()
        await expect(page.locator('[formcontrolname="productId"]')).toBeVisible()
        await expect(page.getByLabel('Product').locator('svg')).toBeVisible()
        // check Order Number field
        await expect(page.locator('mat-form-field > div > div > div > label').nth(2)).toHaveText(/Order Number/)
        await expect(page.locator('mat-form-field > div > div > div > label > span').nth(1)).toBeVisible()
        await expect(page.locator('[formcontrolname="orderNumber"]')).toBeVisible()
        // check Quantity field
        await expect(page.locator('mat-form-field > div > div > div > label').nth(3)).toHaveText(/Quantity/)
        await expect(page.locator('mat-form-field > div > div > div > label > span').nth(2)).toBeVisible()
        await expect(page.locator('[formcontrolname="qtyRequested"]')).toBeVisible()
        // check Due Date field
        await expect(page.locator('mat-form-field > div > div > div > label').nth(4)).toHaveText(/Due date/)
        await expect(page.locator('mat-form-field > div > div > div > label > span').nth(3)).toBeVisible()
        await expect(page.locator('[formcontrolname="dueDate"]')).toBeVisible()
        await expect(page.locator('form').getByRole('button')).toBeVisible()
        // check button
        await expect(page.getByRole('button', { name: 'Add Order' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add Order' })).toBeDisabled();
        await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();

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
        // Product field
        await page.locator('[formcontrolname="productId"]').click()
        await page.keyboard.press('Escape')
        await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.productMissing_message))
        // Order Number field
        await page.locator('[formcontrolname="orderNumber"]').fill('')
        await page.locator('mat-form-field > div > div > div > label').nth(2).click()
        await expect(page.locator('mat-error').nth(1)).toHaveText(new RegExp(credentials.orderNumberMissing_message))
        // Quantity field
        await page.locator('[formcontrolname="qtyRequested"]').fill('')
        await page.locator('mat-form-field > div > div > div > label').nth(3).click()
        await expect(page.locator('mat-error').nth(2)).toHaveText(new RegExp(credentials.quantityMissing_message))
        // Due Date field
        await page.locator('[formcontrolname="dueDate"]').click()
        await page.keyboard.press('Escape')
        await expect(page.locator('mat-error').nth(3)).toHaveText(new RegExp(credentials.dueDateMissing_message))
    });


    test('check error messages for inputting 0', async ({ page }) => {
        // Order Number field
        await page.locator('[formcontrolname="orderNumber"]').fill('0')
        await page.locator('mat-form-field > div > div > div > label').nth(2).click()
        await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.orderNumberCannotBeZero_message))
        // Quantity field
        await page.locator('[formcontrolname="qtyRequested"]').fill('0')
        await page.locator('mat-form-field > div > div > div > label').nth(3).click()
        await expect(page.locator('mat-error').nth(1)).toHaveText(new RegExp(credentials.quantityCannotBeZero_message))
    });


    test('check maximum cap for Order Number input field', async ({ page }) => {
        // input Order Number field with more than 9 digits
        await page.locator('[formcontrolname="orderNumber"]').fill(credentials.over9Dig)
        // check the displayed Order Number
        const cap9DigOrderNumber = await page.inputValue('[formcontrolname="orderNumber"]')
        await expect(cap9DigOrderNumber).toBe('1'.repeat(9))
        console.log('#Try to input at Order Number:', credentials.over9Dig)
        console.log('Length of input Order Number:', credentials.over9Dig.length)
        console.log('Actual displayed Order Number:', cap9DigOrderNumber)
        console.log('Length of displayed Order Number:', cap9DigOrderNumber.length)
    });


    test('check maximum cap for Quantity input field', async ({ page }) => {
        // input Quantity field with more than 5 digits
        await page.locator('[formcontrolname="qtyRequested"]').fill(credentials.over5Dig)
        // check the displayed Quantity
        const cap5DigOrderNumber = await page.inputValue('[formcontrolname="qtyRequested"]')
        await expect(cap5DigOrderNumber).toBe('1'.repeat(5))
        console.log('#Try to input at Quantity:', credentials.over5Dig)
        console.log('Length of input Quantity:', credentials.over5Dig.length)
        console.log('Actual displayed Quantity:', cap5DigOrderNumber)
        console.log('Length of displayed Quantity:', cap5DigOrderNumber.length)
    });


    test('check error message for already existing Order Number', async ({ page }) => {
        // Order Number field
        await page.locator('[formcontrolname="orderNumber"]').fill(credentials.orderNumberAlrExist)
        await page.locator('mat-form-field > div > div > div > label').nth(2).click()
        await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.orderNumberAlrExist_message))
    });


    test('check Customer selection', async ({ page }) => {
        await page.locator('[formcontrolname="customer"]').click()
        // select the first customer option
        const customer_selection = await page.getByRole('option').nth(0).innerText()
        await page.getByRole('option').nth(0).click()
        await expect(page.locator('[formcontrolname="customer"]')).toHaveText(customer_selection)
        console.log('Selected Customer:', customer_selection)
    });


    test('check Product selection', async ({ page }) => {
        await page.locator('[formcontrolname="productId"]').click()
        // select the first product option
        const product_selection = await page.getByRole('option').nth(0).innerText()
        await page.getByRole('option').nth(0).click()
        await expect(page.locator('[formcontrolname="productId"]')).toHaveText(product_selection)
        console.log('Selected Product:', product_selection)
    });


    test('check Due Date selection', async ({ page }) => {
        await page.locator('[formcontrolname="dueDate"]').click()
        // select the desired Due Date option
        await page.locator('.mat-calendar-body-today').click()
        await expect(page.locator('mat-calendar')).not.toBeAttached()
    });


    test('check Order Number auto-display', async ({ page }) => {
        await page.locator('[formcontrolname="orderNumber"]').fill(credentials.orderNumberValid)
        // check the inputted Order Number
        const inputtedOrderNumber = await page.inputValue('[formcontrolname="orderNumber"]')
        console.log('Inputted Order Number:', inputtedOrderNumber)
        await expect(page.locator('legend')).toHaveText(inputtedOrderNumber)
    })


    test('check buttons are enabled after valid input', async ({ page }) => {
        test.setTimeout(30000);             // Set timeout to 30 seconds for this test
        // select the first valid Product option
        await page.locator('[formcontrolname="productId"]').click()
        await page.getByRole('option').nth(0).click()
        // input valid Order Number
        await page.locator('[formcontrolname="orderNumber"]').fill(credentials.orderNumberValid)
        // input valid Quantity
        await page.locator('[formcontrolname="qtyRequested"]').fill(credentials.quantityValid)
        // select valid Due Date
        await page.locator('[formcontrolname="dueDate"]').click()
        await page.locator('.mat-calendar-body-today').click()
        // check the buttons
        await expect(page.getByRole('button', { name: 'Add Order' })).toBeEnabled();
        await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    });


    test('check Cancel button', async ({ page }) => {
        const btn_Cancel = page.getByRole('button', { name: 'Cancel' })
        await expect(btn_Cancel).toBeVisible();
        await expect(btn_Cancel).toBeEnabled();
        await btn_Cancel.click()
        await expect(page).toHaveURL(/\/orders\/all-orders\/?$/)
    });
});



test.describe('View Order page', async () => {

    test.beforeEach('Go to View Order page', async ({ page }) => {
        // go to Add Order page
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Orders' }).click();
        await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'View Orders' }).click();
        await expect(page).toHaveURL(/\/orders\/all-orders\/?$/);
    });


    test('check elements on View Orders page', async ({ page }) => {
        // check button
        await expect(page.getByRole('button', { name: 'Add Order' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add Order' })).toBeEnabled();
        // check filter field
        await expect(page.locator('mat-form-field')).toHaveText(/Filter/);
        await expect(page.locator('mat-form-field')).toBeVisible();

        // check the redirection to Add Order page
        await page.getByRole('button', { name: 'Add Order' }).click();
        await expect(page).toHaveURL(/\/orders\/edit-order\/\d*?$/);
    });
});