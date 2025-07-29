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



test.describe('Landing', async () => {

    test('check elements on Landing', async ({ page }) => {
        // check Customer Name box
        const customer_name = await (await page.locator('[data-pc-section="start"] > div').innerText()).trim()
        console.log('Customer Name:', customer_name)
        const escapeRegExp = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        await expect(page.locator('p-menu')).toHaveText(new RegExp(escapeRegExp(customer_name)))
        // check Menu field
        await expect(page.locator('p-menu')).toBeVisible()
        // check Menu items
        const menuitem_1 = page.getByRole('menuitem', { name: 'Products' })
        await expect(menuitem_1).toBeVisible()
        await expect(menuitem_1.getByRole('link', { name: 'Products' })).toHaveAttribute('href', expect.stringContaining('products'))
        // const menuitem_2 = page.getByRole('menuitem', { name: 'All Orders' })
        // await expect(menuitem_2).toBeVisible()
        // await expect(menuitem_2.getByRole('link', { name: 'All Orders' })).toHaveAttribute('href', expect.stringContaining('orders'))
        await expect(page.locator('p-menu > div > div > button')).toBeVisible()
        // check [Sign out] button
        await expect(page.getByRole('button', { name: 'Sign out' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Sign out' })).toBeEnabled()
        // check breadcrumb
        await expect(page.getByRole('navigation')).toBeVisible()
        await expect(page.locator('[data-pc-section="home"]')).toBeVisible()
    })


    test('check collapse/expand of Menu', async ({ page }) => {
        await page.locator('p-menu > div > div > button').hover()
        await expect(page.locator('[class*="pi-angle-left"]')).toBeEnabled()
        await expect(page.locator('p-menu > div > div').locator('[class="ng-star-inserted"]')).not.toBeHidden()
        await page.locator('p-menu > div > div > button').click()
        await expect(page.locator('p-menu > div > div').locator('[class="ng-star-inserted"]')).toBeHidden()
        await page.locator('p-menu > div > div > button').hover()
        await expect(page.locator('.pi-angle-right')).toBeEnabled()
        await page.locator('p-menu > div > div > button').click()
        await expect(page.locator('p-menu > div > div').locator('[class="ng-star-inserted"]')).not.toBeHidden()
    })
})