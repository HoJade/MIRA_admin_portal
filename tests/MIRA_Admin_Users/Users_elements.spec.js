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
        const locator_name = page.locator('label').filter({ hasText: /^\s*Name\s*$/ })
        await expect(locator_name).toBeVisible()
        await expect(locator_name.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="name"]')).toBeVisible()
        // check input limit
        const input_name = page.locator('input[formcontrolname="name"]')
        const hintId_name = await input_name.getAttribute('aria-describedby')
        await expect(page.locator(`#${hintId_name}`)).toHaveText('0/52')

        // check Initials field
        const locator_initials = page.locator('label').filter({ hasText: /^\s*Initials\s*$/ })
        await expect(locator_initials).toBeVisible()
        await expect(locator_initials.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="initials"]')).toBeVisible()
        // check input limit
        const input_initials = page.locator('input[formcontrolname="initials"]')
        const hintId_initials = await input_initials.getAttribute('aria-describedby')
        await expect(page.locator(`#${hintId_initials}`)).toHaveText('0/4')

        // check Email field
        await expect(page.locator('label').filter({ hasText: /^\s*Email\s*$/ })).toBeVisible()
        await expect(page.locator('[formcontrolname="email"]')).toBeVisible()

        // check Username field
        const locator_userName = page.locator('label').filter({ hasText: /^\s*Username\s*$/ })
        await expect(locator_userName).toBeVisible()
        await expect(locator_userName.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="userName"]')).toBeVisible()
        // check input limit
        const input_userName = page.locator('input[formcontrolname="userName"]')
        const hintId_userName = await input_userName.getAttribute('aria-describedby')
        await expect(page.locator(`#${hintId_userName}`)).toHaveText('0/25')

        // check Groups drop-down field
        const locator_groups = page.locator('label').filter({ hasText: /^\s*Groups\s*$/ })
        await expect(locator_groups).toBeVisible()
        await expect(locator_groups.locator('span')).toBeVisible()
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
        await page.locator('label').filter({ hasText: /^\s*Name\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.name_missing_message) })).toBeVisible()
        // Initials field
        await page.locator('[formcontrolname="initials"]').fill('')
        await page.locator('label').filter({ hasText: /^\s*Initials\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.initials_missing_message) })).toBeVisible()
        // Username field
        await page.locator('[formcontrolname="userName"]').fill('')
        await page.locator('label').filter({ hasText: /^\s*Username\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.username_missing_message) })).toBeVisible()

        // Groups field
        await page.locator('[formcontrolname="groups"]').click()
        // press the Escape key to collapse the dropdown
        await page.keyboard.press('Escape')
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.groups_missing_message) })).toBeVisible()
    });


    test('check error messages for having non-alphabetical characters', async ({ page }) => {
        // Name field
        await page.locator('[formcontrolname="name"]').fill('1')
        await page.locator('label').filter({ hasText: /^\s*Name\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.name_nonAlphabetic_message) })).toBeVisible()
        // Initials field
        await page.locator('[formcontrolname="initials"]').fill('1')
        await page.locator('label').filter({ hasText: /^\s*Initials\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.initials_nonAlphabetic_message) })).toBeVisible()
    });


    test('check error message for having non-alphanumerical characters', async ({ page }) => {
        // Username field
        await page.locator('[formcontrolname="userName"]').fill('^')
        await page.locator('label').filter({ hasText: /^\s*Username\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.username_nonAlphanumerical_message) })).toBeVisible()
    });


    test('check error messages for having less characters', async ({ page }) => {
        // Name field
        await page.locator('[formcontrolname="name"]').fill('a')
        await page.locator('label').filter({ hasText: /^\s*Name\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.name_short_message) })).toBeVisible()
        // Initials field
        await page.locator('[formcontrolname="initials"]').fill('a')
        await page.locator('label').filter({ hasText: /^\s*Initials\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.initials_short_message) })).toBeVisible()
        // Username field
        await page.locator('[formcontrolname="userName"]').fill('a')
        await page.locator('label').filter({ hasText: /^\s*Username\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.username_short_message) })).toBeVisible()
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
        const cap52Char_Name = await page.inputValue('[formcontrolname="name"]')
        await expect(cap52Char_Name).toBe('a'.repeat(52))
        console.log('#Try to input at Name:', credentials.over52Char)
        console.log('Length of input Name:', credentials.over52Char.length)
        console.log('Actual displayed Name:', cap52Char_Name)
        console.log('Length of displayed Name:', cap52Char_Name.length)
    });


    test('check maximum cap for Initials input field', async ({ page }) => {
        // input Initials field with more than 4 characters
        await page.locator('[formcontrolname="initials"]').fill(credentials.over4Char)
        // check the displayed Initials
        const cap4Char_Initials = await page.inputValue('[formcontrolname="initials"]')
        await expect(cap4Char_Initials).toBe('a'.repeat(4))
        console.log('#Try to input at Initials:', credentials.over4Char)
        console.log('Length of input Initials:', credentials.over4Char.length)
        console.log('Actual displayed Initials:', cap4Char_Initials)
        console.log('Length of displayed Initials:', cap4Char_Initials.length)
    });


    test('check maximum cap for Username input field', async ({ page }) => {
        // input Username field with more than 25 characters
        await page.locator('[formcontrolname="userName"]').fill(credentials.over25Char)
        // check the displayed Username
        const cap25Char_Username = await page.inputValue('[formcontrolname="userName"]')
        await expect(cap25Char_Username).toBe('a'.repeat(25))
        console.log('#Try to input at Username:', credentials.over25Char)
        console.log('Length of input Username:', credentials.over25Char.length)
        console.log('Actual displayed Username:', cap25Char_Username)
        console.log('Length of displayed Username:', cap25Char_Username.length)
    });


    test('check error message for already existing Username', async ({ page }) => {
        // Username field
        await page.locator('[formcontrolname="userName"]').fill(credentials.login_alrExist)
        await page.locator('label').filter({ hasText: /^\s*Username\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.username_alrExist_message) })).toBeVisible()
    });


    test('check error message for invalid Email', async ({ page }) => {
        // Email field
        await page.locator('[formcontrolname="email"]').fill(credentials.email_invalid)
        await page.locator('label').filter({ hasText: /^\s*Email\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.email_invalid_message) })).toBeVisible()
    });


    test('check Groups selection', async ({ page }) => {
        const groups_dropdown = page.locator('[formcontrolname="groups"]')
        await expect(groups_dropdown).toBeVisible();
        await groups_dropdown.click()
        await page.waitForSelector('mat-option', { state: 'visible', timeout: 8000 })

        // select the first group option
        const groups_option = page.getByRole('option').first()
        const groups_selection = await groups_option.innerText()
        await groups_option.click()
        // press the Escape key to collapse the dropdown
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
        await page.locator('[formcontrolname="name"]').fill(credentials.name_valid)
        // check the inputted Name
        const inputted_Name = await page.inputValue('[formcontrolname="name"]')
        console.log('Inputted Name:', inputted_Name)
        await expect(page.locator('legend')).toHaveText(inputted_Name)
    })


    test('check buttons are enabled after valid input', async ({ page }) => {
        test.setTimeout(30000);             // Set timeout to 30 seconds for this test
        // input valid Name, Initials, Username, Groups
        await page.locator('[formcontrolname="name"]').fill(credentials.name_valid)
        await page.locator('[formcontrolname="initials"]').fill(credentials.initials_valid)
        await page.locator('[formcontrolname="userName"]').fill(credentials.username_valid)
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