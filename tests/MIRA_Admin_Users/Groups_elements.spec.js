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
        const tableColumn_Name = page.locator('.ng-star-inserted > div > div > div')
        await expect(tableColumn_Name.filter({ hasText: /^Administrators$/ })).toBeVisible()
        await expect(tableColumn_Name.filter({ hasText: /^Production$/ })).toBeVisible()
        await expect(tableColumn_Name.filter({ hasText: /^Quality Team$/ })).toBeVisible()
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
        const locator_groupName = page.locator('label').filter({ hasText: /^\s*Group Name\s*$/ })
        await expect(locator_groupName).toBeVisible()
        await expect(locator_groupName.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="name"]')).toBeVisible()
        // check input limit
        const input_groupName = page.locator('input[formcontrolname="name"]')
        const hintId_groupName = await input_groupName.getAttribute('aria-describedby')
        await expect(page.locator(`#${hintId_groupName}`)).toHaveText('0/50')

        // check Roles drop-down field
        const locator_roles = page.locator('label').filter({ hasText: /^\s*Roles\s*$/ })
        await expect(locator_roles).toBeVisible()
        await expect(locator_roles.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="groupRoles"]')).toBeVisible()
        await expect(page.getByLabel('Roles').locator('svg')).toBeVisible()

        // check Users drop-down field
        const locator_users = page.locator('label').filter({ hasText: /^\s*Users\s*$/ })
        await expect(locator_users).toBeVisible()
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
        await page.locator('label').filter({ hasText: /^\s*Group Name\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.groupName_missing_message) })).toBeVisible()
        // Roles field
        await page.locator('[formcontrolname="groupRoles"]').click()
        // press the Escape key to collapse the dropdown
        await page.keyboard.press('Escape')
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.roles_missing_message) })).toBeVisible()
    });


    test('check maximum cap for Group Name input field', async ({ page }) => {
        // input Username field with more than 50 characters
        await page.locator('[formcontrolname="name"]').fill(credentials.over50Char)
        // check the displayed Group Name
        const cap50Char_GroupName = await page.inputValue('[formcontrolname="name"]')
        await expect(cap50Char_GroupName).toBe('a'.repeat(50))
        console.log('#Try to input at Group Name:', credentials.over50Char)
        console.log('Length of input Group Name:', credentials.over50Char.length)
        console.log('Actual displayed Group Name:', cap50Char_GroupName)
        console.log('Length of displayed Group Name:', cap50Char_GroupName.length)
    });


    test('check Roles selection', async ({ page }) => {
        // await page.waitForLoadState('networkidle');
        const roles_dropdown = page.locator('[formcontrolname="groupRoles"]')
        await expect(roles_dropdown).toBeVisible();
        await roles_dropdown.click({ force: true })
        await page.waitForSelector('div[role="listbox"]', { state: 'attached', timeout: 8000 });
        await page.waitForSelector('mat-option', { state: 'visible', timeout: 8000 })

        // select the first role option
        const roles_option = page.getByRole('option').first()
        const roles_selection = await roles_option.innerText()
        await roles_option.click()
        // press the Escape key to collapse the dropdown
        await page.keyboard.press('Escape')
        await expect(page.locator('[formcontrolname="groupRoles"]')).toHaveText(roles_selection)
        console.log('Selected Roles:', roles_selection)
    });


    test('check Users selection', async ({ page }) => {
        // await page.waitForLoadState('networkidle');
        const users_dropdown = page.locator('[formcontrolname="userGroups"]')
        await expect(users_dropdown).toBeVisible();
        await users_dropdown.click()
        await page.waitForSelector('div[role="listbox"]', { state: 'attached', timeout: 8000 });
        await page.waitForSelector('mat-option', { state: 'visible', timeout: 8000 })

        // select the first user option
        const users_option = page.getByRole('option').first()
        const users_selection = await users_option.innerText()
        await users_option.click()
        // press the Escape key to collapse the dropdown
        await page.keyboard.press('Escape')
        await expect(page.locator('[formcontrolname="userGroups"]')).toHaveText(users_selection)
        console.log('Selected Users:', users_selection)
    });


    test('check Group Name auto-display', async ({ page }) => {
        await page.locator('[formcontrolname="name"]').fill(credentials.groupName_valid)
        // check the inputted Group Name
        const inputted_GroupName = await page.inputValue('[formcontrolname="name"]')
        console.log('Inputted Name:', inputted_GroupName)
        await expect(page.locator('legend')).toHaveText(inputted_GroupName)
    })


    test('check buttons are enabled after valid input', async ({ page }) => {
        test.setTimeout(30000);             // Set timeout to 30 seconds for this test
        // input valid Group Name, Roles
        await page.locator('[formcontrolname="name"]').fill(credentials.groupName_valid)
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