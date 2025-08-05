import { test, expect } from '@playwright/test';
// import the configuration
import * as credentials from '../../config/credential'

// set the retry parameter explicitly for this test script
// test.describe.configure({ retries: 0 })



test.beforeEach('Login to MIRA Production portal', async ({ page }) => {
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



test.describe('Products section', async () => {

    test.beforeEach('Go to Products section', async ({ page }) => {
        await Promise.all([
            // wait to land to Products section
            page.waitForURL(/products/, { state: 'load', timeout: 20000 }),
            // click on the Porducts button
            page.getByRole('menuitem', { name: 'Products' }).click(),
        ])
    });


    test('check elements on Products section', async ({ page }) => {
        // check header
        await expect(page.locator('[header="Products"] > p-panel > div > div > span')).toHaveText(/^Products$/)

        // check search box and placeholder
        await expect(page.locator('p-iconfield')).toBeVisible()
        await expect(page.locator('[class="p-input-icon"]')).toBeVisible()
        const searchBox = await page.getByRole('textbox')
        await expect(searchBox).toHaveAttribute('placeholder', 'Search...')
        await expect(searchBox).toBeEmpty()

        /**
         * check Products table list
         * locate the Table Header row 
         */
        const tableHeader = await page.locator('table > thead > th');
        const tableHeaderTexts = await tableHeader.allInnerTexts();
        const trimmed_tableHeaderTexts = tableHeaderTexts.map(item => item.trim());
        console.log('Products Table Header Row:', trimmed_tableHeaderTexts);
        // check if the Table Header row is as expected
        await expect(trimmed_tableHeaderTexts).toEqual(credentials.products_tableHeaderTexts);

        // check list vs icon display switch
        await expect(page.getByRole('group')).toBeVisible()
        // check refresh button
        await expect(page.locator('p-panel p-button')).toBeVisible()
    })


    test('check placeholder disappears on typing', async ({ page }) => {
        await expect(page.locator('p-iconfield')).toBeVisible()
        // check for placeholder
        const searchBox = await page.getByRole('textbox')
        await expect(searchBox).toHaveAttribute('placeholder', 'Search...')
        await expect(searchBox).toBeEmpty()
        // ensure user input replaces placeholder
        await searchBox.fill(credentials.productName)
        await expect(searchBox).not.toBeEmpty()
    })


    test('check [X Reset Filters] button', async ({ page }) => {
        await expect(page.locator('p-iconfield')).toBeVisible()
        // check the presence of button
        const searchBox = await page.getByRole('textbox')
        await searchBox.fill(credentials.productName)
        await expect(page.getByRole('button', { name: 'Reset Filter' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Reset Filter' })).toBeEnabled()
        // check the removal of the keyword search
        await page.getByRole('button', { name: 'Reset Filter' }).click()
        await expect(searchBox).toBeEmpty()
    })


    test('check display switch', async ({ page }) => {
        // default is list display
        const list_Display = await page.getByRole('group').locator('[aria-labelledby="pi pi-bars"]')
        const tile_Display = await page.getByRole('group').locator('[aria-labelledby="pi pi-th-large"]')

        // check initial state
        const list_isChecked = await list_Display.getAttribute('aria-checked')
        await expect(list_isChecked).toBe('true')
        await expect(tile_Display).toHaveAttribute('aria-checked', 'false')

        // ensure the table header row is visible
        await expect(page.locator('table > thead')).toBeVisible()

        // switch to tile display
        await tile_Display.click()
        const tile_isChecked = await tile_Display.getAttribute('aria-checked')
        await expect(tile_isChecked).toBe('true')

        // re-fetch the attribute *after* clicking
        await expect(list_Display).toHaveAttribute('aria-checked', 'false')
        // table header row should be disappeared
        await expect(page.locator('table > thead')).not.toBeAttached()
    })


    test('check refresh button', async ({ page, headless }) => {
        await expect(page.locator('p-panel p-button')).toBeVisible()
        await page.locator('p-panel p-button').click()

        const refresh_success_tooltip = page.getByRole('alert').last()
        await refresh_success_tooltip.hover()
        await expect(refresh_success_tooltip).toBeVisible()
        await expect(refresh_success_tooltip.locator('[data-pc-section="detail"]')).toHaveText(credentials.refresh_success_message)
        // do image comparison WHEN run in headed mode
        if (headless) {
            await expect.soft(refresh_success_tooltip).toHaveScreenshot()
        } else {
            console.log('Skipping screenshot comparison for headed mode.')
        }
    })
})



test.describe('Product detail page', async () => {

    test.beforeEach('Go to Products section', async ({ page }) => {
        // go to Products section
        await Promise.all([
            page.waitForURL(/products/, { state: 'load', timeout: 20000 }),
            page.getByRole('menuitem', { name: 'Products' }).click(),
        ])
    });

    test.beforeEach('Go to the desired Product detail page', async ({ page }) => {
        // select the desired Product
        await Promise.all([
            // wait for the desired Product Name to be visible
            page.waitForURL(/products\/\d+/),
            // click on the Product link
            page.getByRole('link', { name: credentials.productName }).click(),
        ])
    })

    test('check elements on Product detail page', async ({ page }) => {
        // check header
        const product_header = page.locator('p-panel > div > div > div > span')
        console.log('Product Header:', (await product_header.innerText()).trim())
        expect(product_header).toHaveText(credentials.productName);

        // check Product's Description and Requested quantity
        // Locate the "Description:" label
        const product_Description = page.locator('app-stat-list > div > div').filter({ hasText: /^\s*Description:\s*/ });
        await expect(product_Description).toBeVisible();
        const descriptionText = product_Description.locator('.text-right');
        console.log('Product Description:', (await descriptionText.innerText()).trim());
        expect(descriptionText).toHaveText(credentials.productDescription);
        // Locate the "Requested:" label
        const product_RequestedQuantity = page.locator('app-stat-list > div > div').filter({ hasText: /^\s*Requested:\s*/ });
        await expect(product_RequestedQuantity).toBeVisible();
        const requestedQuantity = (await product_RequestedQuantity.locator('.text-right').innerText()).trim();
        console.log('Product Requested Quantity:', requestedQuantity);

        // check presence of any available Traveler template
        const count = await page.locator("[data-pc-name = panel]").count();
        expect(count).toBeGreaterThan(0);
        // check the expand button
        const traveler_template = page.locator('div > p-panel > div').nth(0)
        const hintId_name = await traveler_template.getAttribute('id')
        const expand_Button = page.locator(`#${hintId_name + '_header'}`)
        await expect(expand_Button).toBeVisible()
        await expect(expand_Button.locator('plusicon')).toBeAttached()

        //expand the template tile
        await expand_Button.click()
        await expect(expand_Button.locator('minusicon')).toBeAttached()
        const expanded_template = page.locator(`#${hintId_name}_content`)
        await expect(expanded_template).toBeVisible()
        await expect(expanded_template).toHaveAttribute('aria-hidden', 'false')
        // check the template process summary
        await expect(expanded_template.locator('app-stat-list')).toBeVisible()
        // check search box and placeholder
        await expect(expanded_template.locator('p-iconfield')).toBeVisible()
        await expect(expanded_template.locator('[class="p-input-icon"]')).toBeVisible()
        const searchBox = await expanded_template.getByRole('textbox')
        await expect(searchBox).toHaveAttribute('placeholder', 'Search...')
        await expect(searchBox).toBeEmpty()

        /**
         * check template table list
         * locate the Table Header row 
         */
        const tableHeader = await expanded_template.locator('table > thead > th');
        const tableHeaderTexts = await tableHeader.allInnerTexts();
        const trimmed_tableHeaderTexts = tableHeaderTexts.map(item => item.trim());
        console.log('Products Table Header Row:', trimmed_tableHeaderTexts);
        // check if the Table Header row is as expected
        const [first, second, ...rest] = trimmed_tableHeaderTexts;
        expect(first).toBe(credentials.productDetail_tableHeaderTexts[0]);
        expect(credentials.acceptableSecond).toContain(second)
        expect(rest).toEqual(credentials.productDetail_tableHeaderTexts.slice(1));

        // collapse the template tile
        await page.waitForTimeout(500)
        await expand_Button.click();
        await expect(expand_Button.locator('plusicon')).toBeAttached()
        await expect(expanded_template).not.toBeVisible()
        await expect(expanded_template).toHaveAttribute('aria-hidden', 'true')
    })
})