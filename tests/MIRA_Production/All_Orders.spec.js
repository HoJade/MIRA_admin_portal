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
    await page.getByRole('button', { name: 'Login' }).click();
    // wait to land to MIRA Production portal
    await page.waitForSelector('p-menu', { state: 'visible', timeout: 20000 });
});



test.describe('All Orders section', async () => {

    test.beforeEach('Go to Products section', async ({ page }) => {
        // go to Products section
        await page.getByRole('menuitem', { name: 'All Orders' }).click();
        await expect(page).toHaveURL(/orders/);
    });


    test('check elements on All Orders section', async ({ page }) => {
        // check header
        await expect(page.locator('[header="All Orders"] > p-panel > div > div > span')).toHaveText(/^All Orders$/)

        // check search box and placeholder
        await expect(page.locator('p-iconfield')).toBeVisible()
        await expect(page.locator('[class="p-input-icon"]')).toBeVisible()
        const searchBox = await page.getByRole('textbox')
        await expect(searchBox).toHaveAttribute('placeholder', 'Search...')
        await expect(searchBox).toBeEmpty()

        // check drop-down list and placeholder
        const dropdownBox = await page.locator('p-dropdown')
        await expect(dropdownBox).toBeVisible()
        await expect(dropdownBox).toBeEnabled()
        await expect(dropdownBox).toHaveAttribute('placeholder', 'All products')
        await expect(dropdownBox).toHaveText(/^All products$/)
        await expect(page.getByRole('button', { name: 'dropdown trigger' })).toBeVisible()

        /**
         * check table list
         * locate the Table Header row 
         */
        const tableHeader = await page.locator('table > thead > th');
        const tableHeaderTexts = await tableHeader.allInnerTexts();
        console.log('All Orders Table Header Row:', tableHeaderTexts);
        // check if the Table Header row is as expected
        await expect(tableHeaderTexts).toEqual(credentials.allOrders_tableHeaderTexts);

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