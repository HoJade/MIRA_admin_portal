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



test.describe('Navigation Bar', () => {

    test('Navigation Bar Items', async ({ page }) => {

        // locate all Navigation Item name
        const navigationBarItems = await page.locator('[class="fuse-horizontal-navigation-item-title"]').allInnerTexts()
        // trim the whitespaces from each item
        const trimmed_navigationBarItems = navigationBarItems.map(item => item.trim());
        console.log('Navigation Bar Items:', trimmed_navigationBarItems)
        await expect(trimmed_navigationBarItems).toEqual(credentials.navigationBarItems)
    });


    test('Customers Menu', async ({ page }) => {

        // click on the Customers Navigation button
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: /^\s*Customers\s*$/ }).click();
        // locate all the corresponding Menu Items
        const menuItems = await page.locator('span > fuse-horizontal-navigation-basic-item');
        const allMenuTexts = await menuItems.allInnerTexts();
        const trimmed_allMenuTexts = allMenuTexts.map(item => item.trim());
        console.log('Menu Items:', trimmed_allMenuTexts);
        // check if the Menu Items are as expected
        await expect(trimmed_allMenuTexts).toEqual(credentials.customersMenuItems);
    });


    test('Orders Menu', async ({ page }) => {

        // click on the Users Navigation button
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Orders' }).click();
        // locate all the corresponding Menu Items
        const menuItems = await page.locator('span > fuse-horizontal-navigation-basic-item');
        const allMenuTexts = await menuItems.allInnerTexts();
        const trimmed_allMenuTexts = allMenuTexts.map(item => item.trim());
        console.log('Menu Items:', trimmed_allMenuTexts);
        // check if the Menu Items are as expected
        await expect(trimmed_allMenuTexts).toEqual(credentials.ordersMenuItems);
    });


    test('Records Menu', async ({ page }) => {

        // click on the Customers Navigation button
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: /^\s*Records\s*$/ }).click();
        // locate all the corresponding Menu Items
        const menuItems = await page.locator('span > fuse-horizontal-navigation-basic-item');
        const allMenuTexts = await menuItems.allInnerTexts();
        const trimmed_allMenuTexts = allMenuTexts.map(item => item.trim());
        console.log('Menu Items:', trimmed_allMenuTexts);
        // check if the Menu Items are as expected
        await expect(trimmed_allMenuTexts).toEqual(credentials.recordsMenuItems);
    });


    test('Users Menu', async ({ page }) => {

        // click on the Users Navigation button
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Users' }).click();
        // locate all the corresponding Menu Items
        const menuItems = await page.locator('span > fuse-horizontal-navigation-basic-item');
        const allMenuTexts = await menuItems.allInnerTexts();
        const trimmed_allMenuTexts = allMenuTexts.map(item => item.trim());
        console.log('Menu Items:', trimmed_allMenuTexts);
        // check if the Menu Items are as expected
        await expect(trimmed_allMenuTexts).toEqual(credentials.usersMenuItems);
    });


    test('Account Menu', async ({ page }) => {

        // click on the Account section
        await page.locator('.flex > .mat-mdc-menu-trigger').click();
        // locate all the corresponding Menu Items
        const menuItems = await page.locator('div > button');
        const allMenuTexts = await menuItems.allInnerTexts();
        const trimmed_allMenuTexts = allMenuTexts.map(item => item.trim());
        console.log('Menu Items:', trimmed_allMenuTexts);
        // check if the Menu Items are as expected
        await expect(trimmed_allMenuTexts).toEqual(credentials.accountMenuItems);
    });


    test('Home Button', async ({ page }) => {

        // Pre-requisite: on any page other than the main landing page
        await page.goto(`${credentials.mira_admin_baseURL}/profile/change-password`)
        // click on the Home button
        await page.click('[class="hidden lg:flex cursor-pointer"]')
        // check if directed to the main landing page
        await expect(page).toHaveURL(/home/);
    });
});



test.describe('Account Menu', () => {

    test.describe('Change Password page', async () => {

        test.beforeEach('Land on Change Password page', async ({ page }) => {
            // go to Change Password page
            await page.locator('.flex > .mat-mdc-menu-trigger').click();
            await page.getByRole('menuitem', { name: 'Change Password' }).click()
            await expect(page).toHaveURL(/\/profile\/change-password\/?$/)
        });


        test('check elements on Change Password page', async ({ page, headless }) => {

            // check Current Password field
            const locator_currentPassword = page.locator('mat-form-field').nth(0)
            await expect(locator_currentPassword.locator('label')).toHaveText(/Current Password/)
            await expect(locator_currentPassword.locator('label > span')).toBeVisible()
            await expect(locator_currentPassword.locator('#currentPassword')).toBeVisible()
            await expect(locator_currentPassword.getByRole('button')).toBeVisible()

            // check New Password field
            const locator_newPassword = page.locator('mat-form-field').nth(1)
            await expect(locator_newPassword.locator('label')).toHaveText(/^New Password$/)
            await expect(locator_newPassword.locator('label > span')).toBeVisible()
            await expect(locator_newPassword.locator('#newPassword')).toBeVisible()
            await expect(locator_newPassword.getByRole('button')).toBeVisible()

            // check Confirm New Password field
            const locator_confirmNewPassword = page.locator('mat-form-field').filter({ hasText: 'Confirm New Password' })
            await expect(locator_confirmNewPassword.locator('label')).toBeVisible()
            await expect(locator_confirmNewPassword.locator('label > span')).toBeVisible()
            await expect(locator_confirmNewPassword.locator('#confirmPassword')).toBeVisible()
            await expect(locator_confirmNewPassword.getByRole('button')).toBeVisible()

            // check button
            await expect(page.getByRole('button', { name: 'Change Password' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Change Password' })).toBeDisabled();

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
            // Current Password field
            await page.locator('#currentPassword').fill('')
            await page.locator('label').filter({ hasText: /^Current Password$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.currentPassword_missing_message })).toBeVisible()
            // New Password field
            await page.locator('#newPassword').fill('')
            await page.locator('label').filter({ hasText: /^New Password$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.newPassword_missing_message })).toBeVisible()
            // Confirm New Password
            await page.locator('#confirmPassword').fill('')
            await page.locator('label').filter({ hasText: /^Confirm New Password$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.confirmNewPassword_missing_message })).toBeVisible()
        });


        test('check error message for having less character', async ({ page }) => {
            // New Password field
            await page.locator('#newPassword').fill('1')
            await page.locator('label').filter({ hasText: /^New Password$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.newPassword_short_message })).toBeVisible()
        });


        test('check error message for having space character', async ({ page }) => {
            // New Password field
            await page.locator('#newPassword').fill(' ')
            await page.locator('label').filter({ hasText: /^New Password$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.newPassword_space_message })).toBeVisible()
        });


        test('check New Password and Confirm New Password match or not', async ({ page }) => {
            // New Password field
            await page.locator('#newPassword').fill('1')
            // Confirm New Password field
            await page.locator('#confirmPassword').fill('2')
            await page.locator('label').filter({ hasText: /^Confirm New Password$/ }).click()
            await expect(page.locator('mat-form-field').filter({ hasText: 'Confirm New Password' }).locator('mat-error')).toHaveText(new RegExp(credentials.confirmNewPassword_notMatch_message))
        });


        test('check input before/after revealing', async ({ page }) => {

            // input valid Current Password
            await page.locator('#currentPassword').fill(credentials.password_true)
            // click to reveal
            await page.locator('mat-form-field').filter({ hasText: 'Current Password' }).getByRole('button').click();
            const revealedCurrentPassword = await page.inputValue('#currentPassword')
            expect(revealedCurrentPassword).toBe(credentials.password_true)

            await page.getByRole('textbox', { name: 'New Password', exact: true }).fill(credentials.password_valid)
            await page.locator('mat-form-field').nth(1).getByRole('button').click()
            const revealedNewPassword = await page.inputValue('#newPassword')
            expect(revealedNewPassword).toBe(credentials.password_valid)

            await page.getByRole('textbox', { name: 'Confirm New Password', exact: true }).fill(credentials.password_valid)
            await page.locator('mat-form-field').filter({ hasText: 'Confirm New Password' }).getByRole('button').click()
            const revealedConfirmNewPassword = await page.inputValue('#confirmPassword')
            expect(revealedConfirmNewPassword).toBe(credentials.password_valid)
        });


        test('check button is enabled after valid input', async ({ page }) => {
            // input valid Current Password, New Password, Confirm New Password
            await page.locator('#currentPassword').fill(credentials.password_true)
            await page.locator('#newPassword').fill(credentials.password_valid)
            await page.locator('#confirmPassword').fill(credentials.password_valid)
            await expect(page.getByRole('button', { name: 'Change Password' })).toBeEnabled()
        });


        test('check error tooltip for incorrect Current Password', async ({ page, headless }) => {
            // input incorrect Current Password
            await page.locator('#currentPassword').fill(credentials.password_false)
            await page.locator('#newPassword').fill(credentials.password_valid)
            await page.locator('#confirmPassword').fill(credentials.password_valid)
            await page.getByRole('button', { name: 'Change Password' }).click()
            // check error tooltip
            await expect(page.locator('fuse-alert')).toBeVisible()
            const error_tooltip = page.locator('fuse-alert > div')
            // await error_tooltip.waitFor({ state: 'visible' })        // redundant code
            await expect(error_tooltip).toHaveText(new RegExp(credentials.incorrectPassword_reset_tooltip))
            // do image comparison WHEN run in headed mode
            if (headless) {
                await expect.soft(error_tooltip).toHaveScreenshot({
                    maxDiffPixelRatio: 0.02     // Allows up to 2% of pixels to differ
                });
            } else {
                console.log('Skipping screenshot comparison for headed mode.')
            }
        });


        test('check Forgot Password redirection AFTER login', async ({ page }) => {
            // check "Forgot Password" instruction
            await expect(page.locator('text = Forgot Password')).toBeVisible()
            // check "log out" portal entry point
            await expect(page.getByText('log out')).toBeVisible()
            await page.getByText('log out').click()
            await expect(page).toHaveURL(/\/auth\/sign-in\/?$/)
        });
    });



    test.describe('Logout MIRA Admin portal', async () => {

        test('Logout', async ({ page }) => {
            // expand Account Menu
            await page.locator('.flex > .mat-mdc-menu-trigger').click();
            // click "Logout"
            await page.getByRole('menuitem', { name: 'Logout' }).click()
            await expect(page).toHaveURL(/\/auth\/sign-in\/?$/)
        })
    })
});