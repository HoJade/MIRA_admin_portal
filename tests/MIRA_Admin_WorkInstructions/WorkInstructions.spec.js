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



test.describe('View Work Instructions page', async () => {

    test.beforeEach('Go to View Work Instructions page', async ({ page }) => {
        // go to View Work Instructions page
        await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: /^\s*Work Instructions\s*$/ }).click();
        await expect(page).toHaveURL(/\/wi\/?$/);
    });


    test('check elements on Work Instructions page', async ({ page }) => {
        // check button
        await expect(page.getByRole('button', { name: 'Add Work Instruction' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add Work Instruction' })).toBeEnabled();
        // check filter field
        await expect(page.locator('mat-form-field')).toHaveText(/Filter/);
        await expect(page.locator('mat-form-field')).toBeVisible();

        // check the redirection to Add Work Instruction page
        await page.getByRole('button', { name: 'Add Work Instruction' }).click();
        await expect(page).toHaveURL(/\/wi\/new-wi\/?$/);
    });
});



test.describe('Add Work Instruction page', async () => {

    test.beforeEach('Go to Add Work Instruction page', async ({ page }) => {
        // go to Add Work Instruction page
        await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: /^\s*Work Instructions\s*$/ }).click();
        await page.getByRole('button', { name: 'Add Work Instruction' }).click();
        await expect(page).toHaveURL(/\/wi\/new-wi\/?$/);
    });


    test('check elements on Add Work Instruction page', async ({ page, headless }) => {
        // check Work Instruction Info box
        await expect(page.locator('app-new-wi')).toHaveText(/New Work Instruction/)
        // check Work Instruction ID field
        const locator_workInstructionID = page.locator('label').filter({ hasText: /^\s*Work Instruction ID\s*$/ })
        await expect(locator_workInstructionID).toBeVisible()
        await expect(locator_workInstructionID.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="name"]')).toBeVisible()
        // check input limit
        const input_workInstructionID = page.locator('input[formcontrolname="name"]')
        const hintId_workInstructionID = await input_workInstructionID.getAttribute('aria-describedby')
        await expect(page.locator(`#${hintId_workInstructionID}`)).toHaveText('0/80')

        // check Revision field
        const locator_revision = page.locator('label').filter({ hasText: /^\s*Revision\s*$/ })
        await expect(locator_revision).toBeVisible()
        await expect(locator_revision.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="revision"]')).toBeVisible()
        // check input limit
        const input_revision = page.locator('input[formcontrolname="revision"]')
        const hintId_revision = await input_revision.getAttribute('aria-describedby')
        await expect(page.locator(`#${hintId_revision}`)).toHaveText('0/9')

        // check Description field
        const locator_description = page.locator('label').filter({ hasText: /^\s*Description\s*$/ })
        await expect(locator_description).toBeVisible()
        await expect(locator_description.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="revision"]')).toBeVisible()
        // check input limnit
        const input_description = page.locator('input[formcontrolname="description"]')
        const hintId_description = await input_description.getAttribute('aria-describedby')
        await expect(page.locator(`#${hintId_description}`)).toHaveText('0/1000')

        // check PDF upload button
        await expect(page.getByRole('button', { name: 'Upload PDF' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Upload PDF' })).toBeEnabled();

        // check button
        await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
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
        // Work Instruction ID field
        await page.locator('[formcontrolname="name"]').fill('')
        await page.locator('label').filter({ hasText: /^\s*Work Instruction ID\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.workInstructionID_missing_message) })).toBeVisible()
        // Revision field
        await page.locator('[formcontrolname="revision"]').fill('')
        await page.locator('label').filter({ hasText: /^\s*Revision\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.revision_missing_message) })).toBeVisible()
        // Description field
        await page.locator('[formcontrolname="description"]').fill('')
        await page.locator('label').filter({ hasText: /^\s*Description\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: (new RegExp(credentials.description_missing_message)) })).toBeVisible()
    });


    test('check prohibition of having space character', async ({ page }) => {
        // Work Instruction ID field
        await page.locator('[formcontrolname="name"]').fill('')
        // check input limit
        const input_workInstructionID = page.locator('input[formcontrolname="name"]')
        const hintId_workInstructionID = await input_workInstructionID.getAttribute('aria-describedby')
        await expect(page.locator(`#${hintId_workInstructionID}`)).toHaveText('0/80')
    });


    test('check error message for already existing Work Instruction ID', async ({ page }) => {
        // Work Instruction ID field
        await page.locator('[formcontrolname="name"]').fill(credentials.workInstructionID_alrExist)
        await page.locator('label').filter({ hasText: /^\s*Work Instruction ID\s*$/ }).click()
        await expect(page.locator('mat-error')).toHaveText(new RegExp(credentials.workInstructionID_alrExist_message))
    });


    test('check maximum cap for Work Instruction ID input field', async ({ page }) => {
        // input Work Instruction ID field with more than 80 characters
        await page.locator('[formcontrolname="name"]').fill(credentials.over80Char)
        // check the displayed Work Instruction ID
        const cap80Char_WorkInstructionID = await page.inputValue('[formcontrolname="name"]')
        expect(cap80Char_WorkInstructionID).toBe('a'.repeat(80))
        console.log('#Try to input at Work Instruction ID:', credentials.over80Char)
        console.log('Length of input Work Instruction ID:', credentials.over80Char.length)
        console.log('Actual displayed Name:', cap80Char_WorkInstructionID)
        console.log('Length of displayed Name:', cap80Char_WorkInstructionID.length)
    });


    test('check maximum cap for Revision input field', async ({ page }) => {
        // input Revision field with more than 9 characters
        await page.locator('[formcontrolname="revision"]').fill(credentials.over9Char)
        // check the displayed Revision
        const cap9Char_Revision = await page.inputValue('[formcontrolname="revision"]')
        expect(cap9Char_Revision).toBe('a'.repeat(9))
        console.log('#Try to input at Login:', credentials.over9Char)
        console.log('Length of input Login:', credentials.over9Char.length)
        console.log('Actual displayed Login:', cap9Char_Revision)
        console.log('Length of displayed Name:', cap9Char_Revision.length)
    });


    test('check maximum cap for Description input field', async ({ page }) => {
        // input Description field with more than 1000 characters
        await page.locator('[formcontrolname="description"]').fill(credentials.over1000Char)
        // check the displayed Description
        const cap1000Char_Description = await page.inputValue('[formcontrolname="description"]')
        expect(cap1000Char_Description).toBe('a'.repeat(1000))
        console.log('#Try to input at Login:', credentials.over1000Char)
        console.log('Length of input Login:', credentials.over1000Char.length)
        console.log('Actual displayed Login:', cap1000Char_Description)
        console.log('Length of displayed Name:', cap1000Char_Description.length)
    });


    test('check PDF upload', async ({ page }) => {
        // check PDF upload button
        await expect(page.getByRole('button', { name: 'Upload PDF' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Upload PDF' })).toBeEnabled();
        
        // check the file upload dialog
        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),
            // click PDF upload button
            page.getByRole('button', { name: 'Upload PDF' }).click()
        ]);
        // select the file to upload
        await fileChooser.setFiles(credentials.pdfFilePath);
    });


    test('check button is enabled after valid input', async ({ page }) => {
        // input valid Work Instruction ID, Revision, Description, PDF
        await page.locator('[formcontrolname="name"]').fill(credentials.workInstructionID_valid)
        await page.locator('[formcontrolname="revision"]').fill(credentials.revision_valid)
        await page.locator('[formcontrolname="description"]').fill(credentials.description_valid)

        // check the file upload dialog
        const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser'),                           // start waiting for the event
            page.getByRole('button', { name: 'Upload PDF' }).click()    // trigger the event
        ]);
        // select the file to upload
        await fileChooser.setFiles(credentials.pdfFilePath);

        // check the buttons
        await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();
        await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();
    });


    test('check Cancel button', async ({ page }) => {
        const btn_Cancel = page.getByRole('button', { name: 'Cancel' })
        await expect(btn_Cancel).toBeVisible();
        await expect(btn_Cancel).toBeEnabled();
        await btn_Cancel.click()
        await expect(page).toHaveURL(/\/wi\/?$/)
    });
});