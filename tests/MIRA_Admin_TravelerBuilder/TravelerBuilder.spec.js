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



test.describe('Traveler Builder', () => {

    test.describe('Traveler Builder Overview page', async () => {

        test.beforeEach('Go to Traveler Builder page', async ({ page }) => {
            // go to Traveler Builder Template listing page
            await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'Traveler Builder' }).click();
            await expect(page).toHaveURL(/\/templates\/all\/?$/);
        });


        test('check elements on Traveler Templates Overview page', async ({ page }) => {
            // check button
            await expect(page.getByRole('button', { name: 'Create Template' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Create Template' })).toBeEnabled();
            // check filter field
            await expect(page.locator('mat-form-field')).toHaveText(/Filter/);
            await expect(page.locator('mat-form-field')).toBeVisible();
            await expect(page.getByRole('group', { name: 'Status' })).toBeVisible();
            // check the presence of the "Add Template" pop-up window
            await page.getByRole('button', { name: 'Create Template' }).click();
            await expect(page.locator('mat-dialog-container')).toBeVisible()
            await expect(page.getByRole('heading', { name: 'Add Template' })).toBeVisible()
        });
    });



    test.describe('Add Template pop-up window', async () => {

        test.beforeEach('prompt Add Template pop-up window', async ({ page }) => {
            // prompt Add Template pop-up window
            await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'Traveler Builder' }).click();
            await expect(page).toHaveURL(/\/templates\/all\/?$/);
            await page.getByRole('button', { name: 'Create Template' }).click();
            await page.waitForSelector('mat-dialog-container', { state: 'visible' })
        });


        test('check elements on Add Template pop-up window', async ({ page }) => {
            await expect(page.locator('mat-dialog-container')).toBeVisible()

            // check heading
            await expect(page.getByRole('heading', { name: 'Add Template' })).toBeVisible()

            /* obsoleted */
            // // check Customer drop-down field
            // const locator_customer = page.locator('label').filter({ hasText: 'Customer' })
            // await expect(locator_customer).toBeVisible()
            // await expect(locator_customer.locator('span')).toBeVisible()
            // await expect(page.locator('[formcontrolname="customer"]')).toBeVisible()
            // await expect(page.getByLabel('Customer').locator('svg')).toBeVisible()
            // // check Product drop-down field
            // const locator_product = page.locator('label').filter({ hasText: 'Product' })
            // await expect(locator_product).toBeVisible()
            // await expect(locator_product.locator('span')).toBeVisible()
            // await expect(page.locator('[formcontrolname="product"]')).toBeVisible()
            // await expect(page.getByLabel('Product').locator('svg')).toBeVisible()

            // check Template Type radio button field
            const locator_templateType = page.getByRole('radiogroup').filter({ hasText: 'Template Type' })
            await expect(locator_templateType).toBeVisible()
            await expect(locator_templateType.locator('mat-radio-button').filter({ hasText: /^\s*Serial Number\s*$/ })).toBeVisible()
            await expect(locator_templateType.locator('mat-radio-button').filter({ hasText: /^\s*Batch Number\s*$/ })).toBeVisible()
            await expect(locator_templateType.locator('mat-radio-button').filter({ hasText: 'Component Serial Number' })).toBeVisible()
            await expect(locator_templateType.locator('mat-radio-button').filter({ hasText: 'Component Batch Number' })).toBeVisible()
            /* approach style 1 */
            await expect(locator_templateType.locator('mat-radio-button').filter({ hasText: /^Serial Number$/ }).getByRole('radio')).toBeVisible()
            await expect(locator_templateType.locator('mat-radio-button').filter({ hasText: /^Serial Number$/ }).getByRole('radio')).not.toBeChecked()
            /* approach style 2 */
            await expect(page.getByLabel(/^Batch Number$/)).toBeVisible()
            await expect(page.getByLabel(/^Batch Number$/)).not.toBeChecked()
            /* approach style 3 */
            await expect(page.getByRole('radio', { name: 'Component Serial Number' })).toBeVisible()
            await expect(page.getByRole('radio', { name: 'Component Serial Number' })).not.toBeChecked()
            await expect(page.getByRole('radio', { name: 'Component Batch Number' })).toBeVisible()
            await expect(page.getByRole('radio', { name: 'Component Batch Number' })).not.toBeChecked()

            // check Template ID field
            const locator_templateID = page.locator('label').filter({ hasText: 'Template ID' })
            await expect(locator_templateID).toBeVisible()
            await expect(locator_templateID.locator('span')).toBeVisible()
            await expect(page.locator('[formcontrolname="templateName"]')).toBeVisible()
            // check input limit
            const input_templateID = page.locator('input[formcontrolname="templateName"]')
            const hintId_templateID = await input_templateID.getAttribute('aria-describedby')
            await expect(page.locator(`#${hintId_templateID}`)).toHaveText('0/80')

            // check Template Revision field
            const locator_templateRevision = page.locator('label').filter({ hasText: 'Template Revision' })
            await expect(locator_templateRevision).toBeVisible()
            await expect(locator_templateRevision.locator('span')).toBeVisible()
            await expect(page.locator('[formcontrolname="templateRev"]')).toBeVisible()
            // check input limit
            const input_templateRevision = page.locator('input[formcontrolname="templateRev"]')
            const hintId_templateRevision = await input_templateRevision.getAttribute('aria-describedby')
            await expect(page.locator(`#${hintId_templateRevision}`)).toHaveText('0/9')

            // check Template Description field
            const locator_templateDescription = page.locator('label').filter({ hasText: 'Template Description' })
            await expect(locator_templateDescription).toBeVisible()
            await expect(locator_templateDescription.locator('span')).toBeVisible()
            await expect(page.locator('[formcontrolname="description"]')).toBeVisible()
            // check input limit
            const input_templateDescription = page.locator('input[formcontrolname="description"]')
            const hintId_templateDescription = await input_templateDescription.getAttribute('aria-describedby')
            await expect(page.locator(`#${hintId_templateDescription}`)).toHaveText('0/1000')

            // check button
            await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();
        });


        test('check error messages for having empty field', async ({ page }) => {

            /* obsoleted */
            // // Customer field
            // await page.locator('[formcontrolname="customer"]').click()
            // await page.getByRole('listbox').waitFor()
            // await page.keyboard.press('Escape')
            // await expect(page.locator('mat-error').filter({ hasText: credentials.customer_missing_message })).toBeVisible()
            // // Product field
            // await page.locator('[formcontrolname="product"]').click()
            // await page.keyboard.press('Escape')
            // await expect(page.locator('mat-error').filter({ hasText: credentials.product_missing_message })).toBeVisible()

            // Template Type
            await page.locator('mat-label', { hasText: 'Template Type' }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.templateType_missing_message })).toBeVisible()
            // Template ID field
            await page.locator('[formcontrolname="templateName"]').fill('')
            await page.locator('label').filter({ hasText: 'Template ID' }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.templateID_missing_message })).toBeVisible()
            // Template Revision field
            await page.locator('[formcontrolname="templateRev"]').fill('')
            await page.locator('label').filter({ hasText: 'Template Revision' }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.templateRevision_missing_message })).toBeVisible()
            // Template Description field
            await page.locator('[formcontrolname="description"]').fill('')
            await page.locator('label').filter({ hasText: 'Template Description' }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.templateDescription_missing_message })).toBeVisible()
        });


        test('check error window for already existing Template ID and Revision', async ({ page, headless }) => {

            /* obsoleted */
            // // fill in already exists Template ID and Revision
            // // Customer field
            // await page.locator('[formcontrolname="customer"]').click()
            // await page.getByRole('listbox').waitFor()
            // await page.getByRole('option').filter({ hasText: credentials.customer_alrExist }).click()
            // // Product field
            // await page.locator('[formcontrolname="product"]').click()
            // await page.getByRole('option').filter({ hasText: credentials.product_alrExist }).click()

            // Template Type
            await page.getByLabel(/^Serial Number$/).check()
            // Template ID field
            await page.locator('[formcontrolname="templateName"]').fill(credentials.templateID_alrExist)
            // Template Revision field
            await page.locator('[formcontrolname="templateRev"]').fill(credentials.templateRevision_alrExist)
            // Template Description field
            await page.locator('[formcontrolname="description"]').fill(credentials.templateDescription)
            await page.getByRole('button', { name: 'Save' }).click()

            // check error pop-up window
            const error_popupWindow = page.locator('fuse-confirmation-dialog > div')
            await expect(error_popupWindow).toBeVisible()
            // do image comparison WHEN run in headed mode
            if (headless) {
                await expect.soft(error_popupWindow).toHaveScreenshot({
                    maxDiffPixelRatio: 0.02     // Allows up to 2% of pixels to differ
                })
            } else {
                console.log('Skipping screenshot comparison for headed mode.')
            }
            await error_popupWindow.getByRole('button', { name: 'Ok' }).click()
            await expect(error_popupWindow).not.toBeAttached()
        });


        test('check buttons are enabled after valid input', async ({ page }) => {
            await expect(page.locator('mat-dialog-container')).toBeVisible()
            // input valid Customer, Product, Template Type, Template ID, Template Revision, Template Description

            /* obsoleted */
            // await page.locator('[formcontrolname="customer"]').click()
            // await page.getByRole('option').filter({ hasText: credentials.customer_alrExist }).click()
            // await page.locator('[formcontrolname="product"]').click()
            // await page.getByRole('option').filter({ hasText: credentials.product_alrExist }).click()

            // select "Serial Number" for Template Type
            await page.getByLabel(/^Serial Number$/).check()
            await page.locator('[formcontrolname="templateName"]').fill(credentials.templateID_alrExist)
            await page.locator('[formcontrolname="templateRev"]').fill(credentials.templateRevision_alrExist)
            await page.locator('[formcontrolname="description"]').fill(credentials.templateDescription)
            // check the buttons
            await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled()
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled()
        });
    });
});