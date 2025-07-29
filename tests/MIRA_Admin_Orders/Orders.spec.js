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
        const locator_customer = page.locator('label').filter({ hasText: /^\s*Customer\s*$/ })
        await expect(locator_customer).toBeVisible()
        await expect(page.locator('[formcontrolname="customer"]')).toBeVisible()
        await expect(page.getByLabel('Customer').locator('svg')).toBeVisible()

        // check Product drop-down field
        const locator_product = page.locator('label').filter({ hasText: /^\s*Product\s*$/ })
        await expect(locator_product).toBeVisible()
        await expect(locator_product.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="productId"]')).toBeVisible()
        await expect(page.getByLabel('Product').locator('svg')).toBeVisible()

        // check Order Number field
        const locator_orderNumber = page.locator('label').filter({ hasText: /^\s*Order Number\s*$/ })
        await expect(locator_orderNumber).toBeVisible()
        await expect(locator_orderNumber.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="orderNumber"]')).toBeVisible()

        // check Quantity field
        const locator_quantity = page.locator('label').filter({ hasText: /^\s*Quantity\s*$/ })
        await expect(locator_quantity).toBeVisible()
        await expect(locator_quantity.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="qtyRequested"]')).toBeVisible()

        // check Due Date field
        const locator_dueDate = page.locator('label').filter({ hasText: /^\s*Due date\s*$/ })
        await expect(locator_dueDate).toBeVisible()
        await expect(locator_dueDate.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="dueDate"]')).toBeVisible()
        await expect(page.locator('mat-datepicker-toggle').getByRole('button')).toBeVisible()

        // check buttons
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
        await page.locator('label').filter({ hasText: /^\s*Product\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.product_missing_message) })).toBeVisible()
        // Order Number field
        await page.locator('[formcontrolname="orderNumber"]').fill('')
        await page.locator('label').filter({ hasText: /^\s*Order Number\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.orderNumber_missing_message) })).toBeVisible()
        // Quantity field
        await page.locator('[formcontrolname="qtyRequested"]').fill('')
        await page.locator('label').filter({ hasText: /^\s*Quantity\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.quantity_missing_message) })).toBeVisible()
        // Due Date field
        await page.locator('[formcontrolname="dueDate"]').click()
        await page.keyboard.press('Escape')
        await expect(page.locator('mat-error').filter({ hasText: (new RegExp(credentials.dueDate_missing_message)) })).toBeVisible()
    });


    test('check error messages for inputting 0', async ({ page }) => {
        // Order Number field
        await page.locator('[formcontrolname="orderNumber"]').fill('0')
        await page.locator('label').filter({ hasText: /^\s*Order Number\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.orderNumber_cannotBeZero_message) })).toBeVisible()
        // Quantity field
        await page.locator('[formcontrolname="qtyRequested"]').fill('0')
        await page.locator('label').filter({ hasText: /^\s*Quantity\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.quantity_cannotBeZero_message) })).toBeVisible()
    });


    test('check maximum cap for Order Number input field', async ({ page }) => {
        // input Order Number field with more than 9 digits
        await page.locator('[formcontrolname="orderNumber"]').fill(credentials.over9Dig)
        // check the displayed Order Number
        const cap9Dig_OrderNumber = await page.inputValue('[formcontrolname="orderNumber"]')
        await expect(cap9Dig_OrderNumber).toBe('1'.repeat(9))
        console.log('#Try to input at Order Number:', credentials.over9Dig)
        console.log('Length of input Order Number:', credentials.over9Dig.length)
        console.log('Actual displayed Order Number:', cap9Dig_OrderNumber)
        console.log('Length of displayed Order Number:', cap9Dig_OrderNumber.length)
    });


    test('check maximum cap for Quantity input field', async ({ page }) => {
        // input Quantity field with more than 5 digits
        await page.locator('[formcontrolname="qtyRequested"]').fill(credentials.over5Dig)
        // check the displayed Quantity
        const cap5Dig_OrderNumber = await page.inputValue('[formcontrolname="qtyRequested"]')
        await expect(cap5Dig_OrderNumber).toBe('1'.repeat(5))
        console.log('#Try to input at Quantity:', credentials.over5Dig)
        console.log('Length of input Quantity:', credentials.over5Dig.length)
        console.log('Actual displayed Quantity:', cap5Dig_OrderNumber)
        console.log('Length of displayed Quantity:', cap5Dig_OrderNumber.length)
    });


    test('check error message for already existing Order Number', async ({ page }) => {
        // Order Number field
        await page.locator('[formcontrolname="orderNumber"]').fill(credentials.orderNumber_alrExist)
        await page.locator('label').filter({ hasText: /^\s*Order Number\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.orderNumber_alrExist_message) })).toBeVisible()
    });


    test('check Customer selection; hence, Product selection', async ({ page }) => {
        // Select customer
        const customer_dropdown = page.locator('[formcontrolname="customer"]')
        await expect(customer_dropdown).toBeVisible();
        await Promise.all([
            // wait for dropdown options to be visible
            page.waitForSelector('mat-option', { state: 'visible', timeout: 8000 }),
            // click to expand the dropdown
            customer_dropdown.click(),
        ])

        const customer_option = page.getByRole('option').first()
        const customer_selection = (await customer_option.innerText()).trim()
        await customer_option.click()
        await expect(page.locator('[formcontrolname="customer"]')).toHaveText(customer_selection)
        console.log('Selected Customer:', customer_selection)

        // Select product
        await page.locator('[formcontrolname="productId"]').click()

        // Wait for new options to appear after customer triggers a change
        await page.waitForTimeout(500) // or a better wait condition if you have one

        const product_option = page.getByRole('option').first()
        const product_selection = (await product_option.innerText()).trim()
        await product_option.click()
        await expect(page.locator('[formcontrolname="productId"]')).toHaveText(product_selection)
        console.log('Selected Product:', product_selection)
    })


    test('check Due Date selection', async ({ page }) => {
        await page.locator('[formcontrolname="dueDate"]').click()
        // select the desired Due Date option
        await page.locator('.mat-calendar-body-today').click()
        await expect(page.locator('mat-calendar')).not.toBeAttached()
    });


    test('check Order Number auto-display', async ({ page }) => {
        await page.locator('[formcontrolname="orderNumber"]').fill(credentials.orderNumber_valid)
        // check the inputted Order Number
        const inputted_OrderNumber = await page.inputValue('[formcontrolname="orderNumber"]')
        console.log('Inputted Order Number:', inputted_OrderNumber)
        await expect(page.locator('legend')).toHaveText(inputted_OrderNumber)
    })


    test('check buttons are enabled after valid input', async ({ page }) => {
        test.setTimeout(30000);             // Set timeout to 30 seconds for this test
        // select the first valid Customer option
        await page.locator('[formcontrolname="customer"]').click()
        await page.getByRole('option').nth(0).click()
        // select the first valid Product option
        await page.locator('[formcontrolname="productId"]').click()
        await page.getByRole('option').nth(0).click()
        // input valid Order Number
        await page.locator('[formcontrolname="orderNumber"]').fill(credentials.orderNumber_valid)
        // input valid Quantity
        await page.locator('[formcontrolname="qtyRequested"]').fill(credentials.quantity_valid)
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