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



test.describe('Add User page', async () => {

    test.beforeEach('Go to Add User page', async ({ page }) => {
        // go to Add User page
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Users' }).click();
        await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'Add User' }).click();
        await expect(page).toHaveURL(/\/users\/edit-user\/\d*?$/);
    });


    test('check elements on Add User page', async ({ page, headless }) => {
        // check User Info box
        await expect(page.locator('app-view-user-info')).toHaveText(/User/)
        // check Name field
        await expect(page.locator('mat-form-field > div > div > div > label').nth(0)).toHaveText(/Name/)
        await expect(page.locator('mat-form-field > div > div > div > label > span').nth(0)).toBeVisible()
        await expect(page.locator('[formcontrolname="name"]')).toBeVisible()
        // check Initials field
        await expect(page.locator('mat-form-field > div > div > div > label').nth(1)).toHaveText(/Initials/)
        await expect(page.locator('mat-form-field > div > div > div > label > span').nth(1)).toBeVisible()
        await expect(page.locator('[formcontrolname="initials"]')).toBeVisible()
        // check Email field
        await expect(page.locator('mat-form-field > div > div > div > label').nth(2)).toHaveText(/Email/)
        await expect(page.locator('[formcontrolname="email"]')).toBeVisible()
        // check Username field
        await expect(page.locator('mat-form-field > div > div > div > label').nth(3)).toHaveText(/Username/)
        await expect(page.locator('mat-form-field > div > div > div > label > span').nth(2)).toBeVisible()
        await expect(page.locator('[formcontrolname="userName"]')).toBeVisible()
        // check Groups drop-down field
        await expect(page.locator('mat-form-field > div > div > div > label').nth(4)).toHaveText(/Groups/)
        await expect(page.locator('mat-form-field > div > div > div > label > span').nth(3)).toBeVisible()
        await expect(page.locator('[formcontrolname="groups"]')).toBeVisible()
        await expect(page.getByLabel('Groups').locator('svg')).toBeVisible()
        // check buttons
        await expect(page.getByRole('button', { name: 'Add User' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add User' })).toBeDisabled();
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
        // Name field
        await page.locator('[formcontrolname="name"]').fill('')
        await page.locator('mat-form-field > div > div > div > label').nth(0).click()
        await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.nameMissing_message))
        // Initials field
        await page.locator('[formcontrolname="initials"]').fill('')
        await page.locator('mat-form-field > div > div > div > label').nth(1).click()
        await expect(page.locator('mat-error').nth(1)).toHaveText(new RegExp(credentials.initialsMissing_message))
        // Username field
        await page.locator('[formcontrolname="userName"]').fill('')
        await page.locator('mat-form-field > div > div > div > label').nth(3).click()
        await expect(page.locator('mat-error').nth(2)).toHaveText(new RegExp(credentials.usernameMissing_message))
        // Groups field
        await page.locator('[formcontrolname="groups"]').click()
        // press the Escape key to collapse the dropdown
        await page.keyboard.press('Escape')
        await expect(page.locator('mat-error').nth(3)).toHaveText(new RegExp(credentials.groupsMissing_message))
    });


    test('check error messages for having non-alphabetical characters', async ({ page }) => {
        // Name field
        await page.locator('[formcontrolname="name"]').fill('1')
        await page.locator('mat-form-field > div > div > div > label').nth(0).click()
        await expect(page.locator('mat-error').nth(1)).toHaveText(new RegExp(credentials.nameNonAlphabetic_message))
        // Initials field
        await page.locator('[formcontrolname="initials"]').fill('1')
        await page.locator('mat-form-field > div > div > div > label').nth(1).click()
        await expect(page.locator('mat-error').nth(3)).toHaveText(new RegExp(credentials.initialsNonAlphabetic_message))
    });


    test('check error message for having non-alphanumerical characters', async ({ page }) => {
        // Username field
        await page.locator('[formcontrolname="userName"]').fill('^')
        await page.locator('mat-form-field > div > div > div > label').nth(3).click()
        await expect(page.locator('mat-error').nth(1)).toHaveText(new RegExp(credentials.usernameNonAlphanumerical_message))
    });


    test('check error messages for having less characters', async ({ page }) => {
        // Name field
        await page.locator('[formcontrolname="name"]').fill('a')
        await page.locator('mat-form-field > div > div > div > label').nth(0).click()
        await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.nameShort_message))
        // Initials field
        await page.locator('[formcontrolname="initials"]').fill('a')
        await page.locator('mat-form-field > div > div > div > label').nth(1).click()
        await expect(page.locator('mat-error').nth(1)).toHaveText(new RegExp(credentials.initialsShort_message))
        // Username field
        await page.locator('[formcontrolname="userName"]').fill('a')
        await page.locator('mat-form-field > div > div > div > label').nth(3).click()
        await expect(page.locator('mat-error').nth(2)).toHaveText(new RegExp(credentials.usernameShort_message))
    });

    /* obsoleted */
    // test('check error messages for having space character', async ({ page }) => {
    //     // Initials field
    //     await page.locator('[formcontrolname="initials"]').fill(' ')
    //     await page.locator('mat-form-field > div > div > div > label').nth(1).click()
    //     await expect(page.locator('mat-error').nth(1)).toContainText(credentials.initialsSpace_message)
    //     // Username field
    //     await page.locator('[formcontrolname="userName"]').fill(' ')
    //     await page.locator('mat-form-field > div > div > div > label').nth(1).click()
    //     await expect(page.locator('mat-error').nth(4)).toContainText(credentials.usernameSpace_message)
    // });

    test('check maximum cap for Name input field', async ({ page }) => {
        // input Name field with more than 52 characters
        await page.locator('[formcontrolname="name"]').fill(credentials.over52Char)
        // check the displayed Name
        const cap52CharName = await page.inputValue('[formcontrolname="name"]')
        await expect(cap52CharName).toBe('a'.repeat(52))
        console.log('#Try to input at Name:', credentials.over52Char)
        console.log('Length of input Name:', credentials.over52Char.length)
        console.log('Actual displayed Name:', cap52CharName)
        console.log('Length of displayed Name:', cap52CharName.length)
    });


    test('check maximum cap for Initials input field', async ({ page }) => {
        // input Initials field with more than 4 characters
        await page.locator('[formcontrolname="initials"]').fill(credentials.over4Char)
        // check the displayed Initials
        const cap4CharInitials = await page.inputValue('[formcontrolname="initials"]')
        await expect(cap4CharInitials).toBe('a'.repeat(4))
        console.log('#Try to input at Initials:', credentials.over4Char)
        console.log('Length of input Initials:', credentials.over4Char.length)
        console.log('Actual displayed Initials:', cap4CharInitials)
        console.log('Length of displayed Initials:', cap4CharInitials.length)
    });


    test('check maximum cap for Username input field', async ({ page }) => {
        // input Username field with more than 25 characters
        await page.locator('[formcontrolname="userName"]').fill(credentials.over25Char)
        // check the displayed Username
        const cap25CharUsername = await page.inputValue('[formcontrolname="userName"]')
        await expect(cap25CharUsername).toBe('a'.repeat(25))
        console.log('#Try to input at Username:', credentials.over25Char)
        console.log('Length of input Username:', credentials.over25Char.length)
        console.log('Actual displayed Username:', cap25CharUsername)
        console.log('Length of displayed Username:', cap25CharUsername.length)
    });


    test('check error message for already existing Username', async ({ page }) => {
        // Username field
        await page.locator('[formcontrolname="userName"]').fill(credentials.loginAlrExist)
        await page.locator('mat-form-field > div > div > div > label').nth(3).click()
        await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.usernameAlrExist_message))
    });


    test('check error message for invalid Email', async ({ page }) => {
        // Email field
        await page.locator('[formcontrolname="email"]').fill(credentials.emailInvalid)
        await page.locator('mat-form-field > div > div > div > label').nth(2).click()
        await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.emailInvalid_message))
    });


    test('check Groups selection', async ({ page }) => {
        await page.locator('[formcontrolname="groups"]').click()
        // select the first group option
        await page.getByRole('option').nth(0).click()
        const groups_selection = await page.getByRole('option').nth(0).innerText()
        await page.keyboard.press('Escape')
        await expect(page.locator('[formcontrolname="groups"]')).toHaveText(groups_selection)
        console.log('Selected Groups:', groups_selection)
    });


    test('check Production/Quality Team logic in Groups selection', async ({ page }) => {
        await page.locator('[formcontrolname="groups"]').click()
        // select Production
        await page.getByRole('option', { name: 'Production' }).click()
        await expect(page.getByRole('option', { name: 'Quality Team' })).toBeDisabled()
        // un-select Production
        await page.getByRole('option', { name: 'Production' }).click()
        await expect(page.getByRole('option', { name: 'Quality Team' })).toBeEnabled()
        // select Quality Team
        await page.getByRole('option', { name: 'Quality Team' }).click()
        await expect(page.getByRole('option', { name: 'Production' })).toBeDisabled()
        // un-select Quality Team
        await page.getByRole('option', { name: 'Quality Team' }).click()
        await expect(page.getByRole('option', { name: 'Production' })).toBeEnabled()
    })


    test('check Name auto-display', async ({ page }) => {
        await page.locator('[formcontrolname="name"]').fill(credentials.nameValid)
        // check the inputted Name
        const inputtedName = await page.inputValue('[formcontrolname="name"]')
        console.log('Inputted Name:', inputtedName)
        await expect(page.locator('legend')).toHaveText(inputtedName)
    })


    test('check buttons are enabled after valid input', async ({ page }) => {
        test.setTimeout(30000);             // Set timeout to 30 seconds for this test
        // input valid Name, Initials, Username, Groups
        await page.locator('[formcontrolname="name"]').fill(credentials.nameValid)
        await page.locator('[formcontrolname="initials"]').fill(credentials.initialsValid)
        await page.locator('[formcontrolname="userName"]').fill(credentials.usernameValid)
        // expand the listbox and wait for visible
        await page.locator('[formcontrolname="groups"]').click()
        await page.getByRole('listbox', { name: 'Groups' }).waitFor({ state: 'visible', timeout: 2000 });
        // select the first group option
        await page.getByRole('option').nth(0).click()
        await page.keyboard.press('Escape')
        // check the buttons
        await expect(page.getByRole('button', { name: 'Add User' })).toBeEnabled();
        await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    });


    test('check Cancel button', async ({ page }) => {
        const btn_Cancel = page.getByRole('button', { name: 'Cancel' })
        await expect(btn_Cancel).toBeVisible();
        await expect(btn_Cancel).toBeEnabled();
        await btn_Cancel.click()
        await expect(page).toHaveURL(/\/users\/all\/?$/)
    });
});



test.describe('View Users page', async () => {

    test.beforeEach('Go to View Users page', async ({ page }) => {
        // go to View Users page
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Users' }).click();
        await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'View Users' }).click();
        await expect(page).toHaveURL(/\/users\/all\/?$/);
    });


    test('check elements on View Users page', async ({ page }) => {
        // check button
        await expect(page.getByRole('button', { name: 'Add User' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add User' })).toBeEnabled();
        // check filter field
        await expect(page.locator('mat-form-field')).toHaveText(/Filter/);
        await expect(page.locator('mat-form-field')).toBeVisible();

        // check the redirection to Add Customer page
        await page.getByRole('button', { name: 'Add User' }).click();
        await expect(page).toHaveURL(/\/users\/edit-user\/\d*?$/);
    });
});






test.describe('Training Report page', async () => {

    test.beforeEach('Go to Training Report page', async ({ page }) => {
        // go to View Users page
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Users' }).click();
        await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'Training Report' }).click();
        await expect(page).toHaveURL(/\/users\/training-report\/?$/);
    });


    test('check elements on Training Report page', async ({ page, headless }) => {
        // check header
        await expect(page.locator('.tracking-tight')).toHaveText(/Training Report/)
        // check print button
        await expect(page.getByRole('button', { name: 'Print' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Print' })).toBeEnabled();
        // check drop-dowm list field
        await expect(page.locator('mat-form-field > div > div > div > label')).toBeVisible()
        await expect(page.getByLabel('Select Product')).toBeVisible()
        // check generate report button
        await expect(page.getByRole('button', { name: 'Generate Report' })).toBeVisible()
        await expect(page.getByRole('button', { name: 'Generate Report' })).toBeDisabled()

        // do image comparison WHEN run in headed mode
        if (headless) {
            await expect.soft(page).toHaveScreenshot({
                maxDiffPixelRatio: 0.02     // Allows up to 2% of pixels to differ
            })
        } else {
            console.log('Skipping screenshot comparison for headed mode.')
        }
    });
});