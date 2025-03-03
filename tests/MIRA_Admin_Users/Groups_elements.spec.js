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



test.describe('Groups page', async () => {

    test.beforeEach('Go to Groups page', async ({ page }) => {
        // go to Groups page
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Users' }).click();
        await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'Groups' }).click();
        await page.waitForURL(/\/users\/groups\/all\/?$/)
    });


    test('check elements on Groups page', async ({ page }) => {
        await expect(page).toHaveURL(/\/users\/groups\/all\/?$/);
        // check button
        await expect(page.getByRole('button', { name: 'Add Group' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add Group' })).toBeEnabled();
        // check filter field
        await expect(page.locator('mat-form-field')).toHaveText(/Filter/);
        await expect(page.locator('mat-form-field')).toBeVisible();

        // check the redirection to Add Group page
        await page.getByRole('button', { name: 'Add Group' }).click();
        await page.waitForURL(/\/users\/groups\/edit-group\/\d*?$/)
        await expect(page).toHaveURL(/\/users\/groups\/edit-group\/\d*?$/);
    });


    test('check Administrators, Production, Quality Team Group', async ({ page }) => {
        await expect(page).toHaveURL(/\/users\/groups\/all\/?$/);
        await expect(page.locator('.ng-star-inserted > div > div > div').filter({ hasText: /^Administrators$/ })).toBeVisible()
        await expect(page.locator('.ng-star-inserted > div > div > div').filter({ hasText: /^Production$/ }).nth(0)).toBeVisible()
        await expect(page.locator('.ng-star-inserted > div > div > div').filter({ hasText: /^Quality Team$/ })).toBeVisible()
    })
});



test.describe('Add Group sub-page', async () => {

    test.beforeEach('Go to Add Group sub-page', async ({ page }) => {
        // go to Add Group sub-page
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Users' }).click();
        await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'Groups' }).click();
        await page.waitForURL(/\/users\/groups\/all\/?$/)
        await page.getByRole('button', { name: 'Add Group' }).click();
        await page.waitForURL(/\/users\/groups\/edit-group\/\d*?$/)
    });


    test('check elements on Add Group sub-page', async ({ page, headless }) => {
        await expect(page).toHaveURL(/\/users\/groups\/edit-group\/\d*?$/);
        // check Group Info box
        await expect(page.locator('.card')).toHaveText(/Group/)
        // check Group Name field
        await expect(page.locator('mat-form-field > div > div > div > label').nth(0)).toHaveText(/Group Name/)
        await expect(page.locator('mat-form-field > div > div > div > label > span').nth(0)).toBeVisible()
        await expect(page.locator('[formcontrolname="name"]')).toBeVisible()
        // check Roles drop-down field
        await expect(page.locator('mat-form-field > div > div > div > label').nth(1)).toHaveText(/Roles/)
        await expect(page.locator('mat-form-field > div > div > div > label > span').nth(1)).toBeVisible()
        await expect(page.locator('[formcontrolname="groupRoles"]')).toBeVisible()
        await expect(page.getByLabel('Roles').locator('svg')).toBeVisible()
        // check Users drop-down field
        await expect(page.locator('mat-form-field > div > div > div > label').nth(2)).toHaveText(/Users/)
        await expect(page.locator('[formcontrolname="userGroups"]')).toBeVisible()
        await expect(page.getByLabel('Users').locator('svg')).toBeVisible()
        // check button
        await expect(page.getByRole('button', { name: 'Add Group' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add Group' })).toBeDisabled();
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
        // Group Name field
        await page.locator('[formcontrolname="name"]').fill('')
        await page.locator('mat-form-field > div > div > div > label').nth(0).click()
        await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.groupNameMissing_message))
        // Roles field
        await page.locator('[formcontrolname="groupRoles"]').click()
        // press the Escape key to collapse the dropdown
        await page.keyboard.press('Escape')
        await expect(page.locator('mat-error').nth(1)).toHaveText(new RegExp(credentials.rolesMissing_message))
    });


    test('check maximum cap for Group Name input field', async ({ page }) => {
        // input Username field with more than 50 characters
        await page.locator('[formcontrolname="name"]').fill(credentials.over50Char)
        // check the displayed Group Name
        const cap50CharGroupName = await page.inputValue('[formcontrolname="name"]')
        await expect(cap50CharGroupName).toBe('a'.repeat(50))
        console.log('#Try to input at Group Name:', credentials.over50Char)
        console.log('Length of input Group Name:', credentials.over50Char.length)
        console.log('Actual displayed Group Name:', cap50CharGroupName)
        console.log('Length of displayed Group Name:', cap50CharGroupName.length)
    });


    test('check Roles selection', async ({ page }) => {
        await page.locator('[formcontrolname="groupRoles"]').click()
        // select the first role option
        await page.getByRole('option').nth(0).click()
        const roles_selection = await page.getByRole('option').nth(0).innerText()
        await page.keyboard.press('Escape')
        await expect(page.locator('[formcontrolname="groupRoles"]')).toHaveText(roles_selection)
        console.log('Selected Roles:', roles_selection)
    });


    test('check Users selection', async ({ page }) => {
        await page.locator('[formcontrolname="userGroups"]').click()
        // select the first user option
        await page.getByRole('option').nth(0).click()
        const users_selection = await page.getByRole('option').nth(0).innerText()
        await page.keyboard.press('Escape')
        await expect(page.locator('[formcontrolname="userGroups"]')).toHaveText(users_selection)
        console.log('Selected Users:', users_selection)
    });


    test('check Group Name auto-display', async ({ page }) => {
        await page.locator('[formcontrolname="name"]').fill(credentials.groupNameValid)
        // check the inputted Group Name
        const inputtedGroupName = await page.inputValue('[formcontrolname="name"]')
        console.log('Inputted Name:', inputtedGroupName)
        await expect(page.locator('legend')).toHaveText(inputtedGroupName)
    })


    test('check buttons are enabled after valid input', async ({ page }) => {
        test.setTimeout(30000);             // Set timeout to 30 seconds for this test
        // input valid Group Name, Roles
        await page.locator('[formcontrolname="name"]').fill(credentials.groupNameValid)
        // select the first role option
        await page.locator('[formcontrolname="groupRoles"]').click()
        await page.getByRole('option').nth(0).click()
        await page.keyboard.press('Escape')
        // check the buttons
        await expect(page.getByRole('button', { name: 'Add Group' })).toBeEnabled();
        await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    });


    test('check Cancel button', async ({ page }) => {
        const btn_Cancel = page.getByRole('button', { name: 'Cancel' })
        await expect(btn_Cancel).toBeVisible();
        await expect(btn_Cancel).toBeEnabled();
        await btn_Cancel.click()
        await expect(page).toHaveURL(/\/users\/groups\/all\/?$/)
    });
});