import { test, expect } from '@playwright/test';
// import the configuration
import * as credentials from '../../config/credential'
import exp from 'constants';
import { info } from 'console';

// set the retry parameter explicitly for this test script
// test.describe.configure({ retries: 0 })



test.beforeEach('Login to MIRA Admin portal', async ({ page }) => {
    // land to MIRA Admin portal login page
    await page.goto(`${credentials.mira_admin_baseURL}/auth/sign-in`);
    await expect(page.getByRole('img')).toBeVisible();
    await page.getByLabel('Username').fill(credentials.username_true);
    await page.getByLabel('Password').fill(credentials.password_true);
    await Promise.all([
        // wait to land to MIRA Admin portal main landing page
        page.waitForSelector('app-home img', { state: 'visible', timeout: 20000 }),
        // click on the Login button
        page.getByRole('button', { name: 'Sign in' }).click(),
    ])
});



test.describe('Add Customer page', async () => {

    test.beforeEach('Go to Add Customer page', async ({ page }) => {
        // go to Add Customer page
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Customers' }).click();
        await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'Add Customer' }).click();
        await expect(page).toHaveURL(/\/customers\/edit-customer\/\d*?$/);
    });


    test('check elements on Add Customer page', async ({ page, headless }) => {
        // check Customer Info box
        await expect(page.locator('app-view-info')).toHaveText(/Customer/)
        // check Name field
        const locator_name = page.locator('label').filter({ hasText: /^\s*Name\s*$/ })
        await expect(locator_name).toBeVisible()
        await expect(locator_name.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="customerName"]')).toBeVisible()
        // check input limit
        const input_name = page.locator('input[formcontrolname="customerName"]')
        const hintId_name = await input_name.getAttribute('aria-describedby')
        await expect(page.locator(`#${hintId_name}`)).toHaveText('0/50')

        // check Login field
        const locator_login = page.locator('label').filter({ hasText: /^\s*Login\s*$/ })
        await expect(locator_login).toBeVisible()
        await expect(locator_login.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="login"]')).toBeVisible()
        // check input limit
        const input_login = page.locator('input[formcontrolname="login"]')
        const hintId_login = await input_login.getAttribute('aria-describedby')
        await expect(page.locator(`#${hintId_login}`)).toHaveText('0/20')

        // check Password field
        const locator_password = page.locator('label').filter({ hasText: /^\s*Password\s*$/ })
        await expect(locator_password).toBeVisible()
        await expect(locator_password.locator('span')).toBeVisible()
        await expect(page.locator('[formcontrolname="password"]')).toBeVisible()
        // check reveal button
        await expect(page.locator('mat-form-field').filter({ hasText: 'Password' }).getByRole('button')).toBeVisible()
        // check input limit
        const input_password = page.locator('input[formcontrolname="password"]')
        const hintId_password = await input_password.getAttribute('aria-describedby')
        await expect(page.locator(`#${hintId_password}`)).toHaveText('0/25')

        // check button
        await expect(page.getByRole('button', { name: 'Add Customer' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add Customer' })).toBeDisabled();

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
        await page.locator('[formcontrolname="customerName"]').fill('')
        await page.locator('label').filter({ hasText: /^\s*Name\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.name_missing_message) })).toBeVisible()
        // Login field
        await page.locator('[formcontrolname="login"]').fill('')
        await page.locator('label').filter({ hasText: /^\s*Login\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.login_missing_message) })).toBeVisible()
        // Password field
        await page.locator('[formcontrolname="password"]').fill('')
        await page.locator('label').filter({ hasText: /^\s*Password\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.password_missing_message) })).toBeVisible()
    });


    test('check error messages for having less characters', async ({ page }) => {
        // Login field
        await page.locator('[formcontrolname="login"]').fill('1')
        await page.locator('label').filter({ hasText: /^\s*Login\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.login_short_message) })).toBeVisible()
        // Password field
        await page.locator('[formcontrolname="password"]').fill('1')
        await page.locator('label').filter({ hasText: /^\s*Password\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.password_short_message) })).toBeVisible()
    });


    test('check error messages for having space character', async ({ page }) => {
        // Login field
        await page.locator('[formcontrolname="login"]').fill(' ')
        await page.locator('label').filter({ hasText: /^\s*Login\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.login_space_message) })).toBeVisible()
        // Password field
        await page.locator('[formcontrolname="password"]').fill(' ')
        await page.locator('label').filter({ hasText: /^\s*Password\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.password_space_message) })).toBeVisible()
    });


    test('check error message for already existing Login', async ({ page }) => {
        // Login field
        await page.locator('[formcontrolname="login"]').fill(credentials.login_alrExist)
        await page.locator('label').filter({ hasText: /^\s*Login\s*$/ }).click()
        await expect(page.locator('mat-error').filter({ hasText: new RegExp(credentials.login_alrExist_message) })).toBeVisible()
    });


    test('check maximum cap for Name input field', async ({ page }) => {
        // input Name field with more than 50 characters
        await page.locator('[formcontrolname="customerName"]').fill(credentials.over50Char)
        // check the displayed Name
        const cap50Char_Name = await page.inputValue('[formcontrolname="customerName"]')
        expect(cap50Char_Name).toBe('a'.repeat(50))
        console.log('#Try to input at Name:', credentials.over50Char)
        console.log('Length of input Name:', credentials.over50Char.length)
        console.log('Actual displayed Name:', cap50Char_Name)
        console.log('Length of displayed Name:', cap50Char_Name.length)

        // check input limit that is should be capped at 50 character
        const input_name = page.getByLabel('Name')
        const hintId_name = await input_name.getAttribute('aria-describedby')
        await expect(page.locator(`#${hintId_name}`)).toHaveText('50/50')
    });


    test('check maximum cap for Login input field', async ({ page }) => {
        // input Login field with more than 20 characters
        await page.locator('[formcontrolname="login"]').fill(credentials.over20Char)
        // check the displayed Login
        const cap20Char_Login = await page.inputValue('[formcontrolname="login"]')
        expect(cap20Char_Login).toBe('a'.repeat(20))
        console.log('#Try to input at Login:', credentials.over20Char)
        console.log('Length of input Login:', credentials.over20Char.length)
        console.log('Actual displayed Login:', cap20Char_Login)
        console.log('Length of displayed Name:', cap20Char_Login.length)

        // check input limit that is should be capped at 20 character
        const input_login = page.getByLabel('Login')
        const hintId_login = await input_login.getAttribute('aria-describedby')
        await expect(page.locator(`#${hintId_login}`)).toHaveText('20/20')
    });


    test('check maximum cap for Password input field', async ({ page }) => {
        // input Password field with more than 25 characters
        await page.locator('[formcontrolname="password"]').fill(credentials.over25Char)
        // check the displayed Login
        const cap25Char_Password = await page.inputValue('[formcontrolname="password"]')
        expect(cap25Char_Password).toBe('a'.repeat(25))
        console.log('#Try to input at Login:', credentials.over25Char)
        console.log('Length of input Login:', credentials.over25Char.length)
        console.log('Actual displayed Login:', cap25Char_Password)
        console.log('Length of displayed Name:', cap25Char_Password.length)

        // check input limit that is should be capped at 25 character
        const input_password = page.getByLabel('Password')
        const hintId_password = await input_password.getAttribute('aria-describedby')
        await expect(page.locator(`#${hintId_password}`)).toHaveText('25/25')
    });


    test('check valid Password input before/after revealing', async ({ page }) => {
        // input valid Password
        await page.locator('[formcontrolname="password"]').fill(credentials.password_valid)
        // check the icon
        const icon_reveal = page.locator('mat-form-field').filter({ hasText: 'Password' }).getByRole('button')
        await expect(icon_reveal.locator('mat-icon')).toHaveAttribute('data-mat-icon-name', 'eye')
        // click to reveal
        await icon_reveal.click();
        const revealedPassword = await page.inputValue('[formcontrolname="password"]')
        expect(revealedPassword).toBe(credentials.password_valid)
        // check the icon
        const icon_conceal = page.locator('mat-form-field').filter({ hasText: 'Password' }).getByRole('button')
        await expect(icon_conceal.locator('mat-icon')).toHaveAttribute('data-mat-icon-name', 'eye-slash')
    });


    test('check button is enabled after valid input', async ({ page }) => {
        // input valid Name, Login, Password
        await page.locator('[formcontrolname="customerName"]').fill(credentials.name_valid)
        await page.locator('[formcontrolname="login"]').fill(credentials.login_valid)
        await page.locator('[formcontrolname="password"]').fill(credentials.password_valid)
        await expect(page.getByRole('button', { name: 'Add Customer' })).toBeEnabled();
    });
});



test.describe('View Customers page', async () => {

    test.beforeEach('Go to View Customers page', async ({ page }) => {
        // go to View Customers page
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Customers' }).click();
        await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'View Customers' }).click();
        await expect(page).toHaveURL(/\/customers\/all\/?$/);
    });


    test('check elements on View Customers page', async ({ page }) => {
        // check button
        await expect(page.getByRole('button', { name: 'Add Customer' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Add Customer' })).toBeEnabled();
        // check filter field
        await expect(page.locator('mat-form-field')).toHaveText(/Filter/);
        await expect(page.locator('mat-form-field')).toBeVisible();

        // check the redirection to Add Customer page
        await page.getByRole('button', { name: 'Add Customer' }).click();
        await expect(page).toHaveURL(/\/customers\/edit-customer\/\d*?$/);
    });
});



test.describe('Customer details page', async () => {

    test.beforeEach('Go to View Customers page', async ({ page }) => {
        // go to View Customers page
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Customers' }).click();
        await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'View Customers' }).click();
        await expect(page).toHaveURL(/\/customers\/all\/?$/);
    });

    test.beforeEach('Go to the desired Customer details page', async ({ page }) => {
        // select the desired Customer
        await page.locator(`[title = "${credentials.customer_name}"]`).click();
        await expect(page).toHaveURL(/\/customers\/edit-customer\/\d*\?view=overview$/);
    });


    test('check elements on Customers details page', async ({ page }) => {
        // assert only Overview sidebar tab is active
        const sidebar_Overview = page.locator('.fuse-vertical-navigation-item-active');
        await expect(sidebar_Overview).toHaveText(/Overview/);
        await expect(page.getByRole('link', { name: 'Overview' })).toHaveAttribute('href', expect.stringContaining('view=overview'));


        // check Customer Name title
        const title_customerName = page.locator('app-customer-overview > div > div');
        await expect(title_customerName).toBeVisible();
        await expect(title_customerName).toHaveText(credentials.customer_name);

        // check Customer Info box
        const infoBox_customer = page.locator('app-list-info');
        await expect(infoBox_customer).toBeVisible();
        // locate the Customer Name field
        const customerName = infoBox_customer.locator('div > div').filter({ hasText: /^\s*Customer Name:\s*/ });
        await expect(customerName).toBeVisible();
        const customerName_Text = customerName.locator('.text-right');
        console.log('Product Description:', (await customerName_Text.innerText()).trim());
        await expect(customerName_Text).toHaveText(credentials.customer_name);
        // locate the Login field
        const customerLogin = infoBox_customer.locator('div > div').filter({ hasText: /^\s*Login:\s*/ });
        await expect(customerLogin).toBeVisible();
        const customerLogin_Text = (await customerLogin.locator('.text-right').innerText()).trim();
        console.log('Product Requested Quantity:', customerLogin_Text);

        // check sidebar
        const sidebar = page.locator('fuse-vertical-navigation');
        await expect(sidebar).toBeVisible();
        const sidebar_changeName = sidebar.locator('fuse-vertical-navigation-basic-item').filter({ hasText: 'Change Name' });
        await expect(sidebar_changeName).toBeVisible();
        const sidebar_changeLogin = sidebar.locator('fuse-vertical-navigation-basic-item').filter({ hasText: 'Change Login' });
        await expect(sidebar_changeLogin).toBeVisible();
        const sidebar_changePassword = sidebar.locator('fuse-vertical-navigation-basic-item').filter({ hasText: 'Change Password' });
        await expect(sidebar_changePassword).toBeVisible();

        // check "Customers" hyper-link
        const navHeader = page.getByRole('link', { name: 'Customers' })
        await expect(navHeader).toBeVisible();
        await expect(navHeader).toHaveAttribute('href', expect.stringContaining('customers'));
    });


    test('return to View Customers page', async ({ page }) => {
        // click on the [Customers] hyper-link
        await page.getByRole('link', { name: 'Customers' }).click();
        await expect(page).toHaveURL(/\/customers\/all\/?$/);
    });



    test.describe('Change Name', async () => {

        test.beforeEach('Click to change Customer Name', async ({ page }) => {
            // click on the Change Name sidebar tab
            await page.locator('fuse-vertical-navigation-basic-item').filter({ hasText: 'Change Name' }).click();
            await expect(page.getByRole('dialog')).toBeVisible();
        });


        test('check elements on Change Name dialog box', async ({ page }) => {
            // check Customer Name field
            const locator_customerName = page.locator('label').filter({ hasText: /^\s*Customer Name\s*$/ })
            await expect(locator_customerName).toBeVisible()
            await expect(locator_customerName.locator('span')).toBeVisible()
            await expect(page.getByLabel('Customer Name')).toBeVisible()

            // check input limit
            const input_customerName = page.getByLabel('Customer Name')
            const hintId_customerName = await input_customerName.getAttribute('aria-describedby')
            await expect(page.locator(`#${hintId_customerName}`)).toContainText('/50')

            // check button
            await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();

            // close the dialog box
            await page.getByRole('button', { name: 'Cancel' }).click();
            await expect(page.getByRole('dialog')).not.toBeAttached();
        });


        test('check error message for having empty field', async ({ page }) => {
            // Customer Name field
            await page.getByLabel('Customer Name').fill('')
            await page.locator('label').filter({ hasText: /^Customer Name$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.customerNameOrLogin_missing_message })).toBeVisible()
        });


        test('check error message for not modifying Name', async ({ page }) => {
            // Customer Name field
            await page.locator('label').filter({ hasText: /^Customer Name$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.customerNameOrLogin_doNotModified_message })).toBeVisible()
        });


        test('check maximum cap for Customer Name input field', async ({ page }) => {
            // input Customer Name field with more than 50 characters
            await page.getByLabel(/^Customer Name$/).fill(credentials.over50Char)

            // check the displayed Customer Name
            const cap50Char_CustomerName = await page.inputValue('[formcontrolname="value"]')
            expect(cap50Char_CustomerName).toBe('a'.repeat(50))
            console.log('#Try to input at Customer Name:', credentials.over50Char)
            console.log('Length of input Customer Name:', credentials.over50Char.length)
            console.log('Actual displayed Customer Name:', cap50Char_CustomerName)
            console.log('Length of displayed Customer Name:', cap50Char_CustomerName.length)

            // check input limit that is should be capped at 50 character
            const input_customerName = page.getByLabel('Customer Name')
            const hintId_customerName = await input_customerName.getAttribute('aria-describedby')
            await expect(page.locator(`#${hintId_customerName}`)).toHaveText('50/50')
        });


        test('check Save button is enabled after valid input', async ({ page }) => {
            // input valid Customer Name
            await page.getByLabel('Customer Name').fill(credentials.name_valid)
            await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();
        });
    });



    test.describe('Change Login', async () => {

        test.beforeEach('Click to change Login', async ({ page }) => {
            // click on the Change Login sidebar tab
            await page.locator('fuse-vertical-navigation-basic-item').filter({ hasText: 'Change Login' }).click();
            await expect(page.getByRole('dialog')).toBeVisible();
        });


        test('check elements on Change Login dialog box', async ({ page }) => {
            // check Login field
            const locator_login = page.locator('label').filter({ hasText: /^\s*Login\s*$/ })
            await expect(locator_login).toBeVisible()
            await expect(locator_login.locator('span')).toBeVisible()
            await expect(page.getByLabel('Login')).toBeVisible()

            // check input limit
            const input_login = page.getByLabel('Login')
            const hintId_login = await input_login.getAttribute('aria-describedby')
            await expect(page.locator(`#${hintId_login}`)).toContainText('/50')

            // check button
            await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();

            // close the dialog box
            await page.getByRole('button', { name: 'Cancel' }).click();
            await expect(page.getByRole('dialog')).not.toBeAttached();
        });


        test('check error message for having empty field', async ({ page }) => {
            // Login field
            await page.getByLabel('Login').fill('')
            await page.locator('label').filter({ hasText: /^Login$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.customerNameOrLogin_missing_message })).toBeVisible()
        });


        test('check error message for not modifying Name', async ({ page }) => {
            // Login field
            await page.locator('label').filter({ hasText: /^Login$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.customerNameOrLogin_doNotModified_message })).toBeVisible()
        });


        test('check maximum cap for Login input field', async ({ page }) => {
            // input Login field with more than 50 characters
            await page.getByLabel(/^Login$/).fill(credentials.over50Char)

            // check the displayed Login
            const cap50Char_Login = await page.inputValue('[formcontrolname="value"]')
            expect(cap50Char_Login).toBe('a'.repeat(50))
            console.log('#Try to input at Login:', credentials.over50Char)
            console.log('Length of input Login:', credentials.over50Char.length)
            console.log('Actual displayed Login:', cap50Char_Login)
            console.log('Length of displayed Login:', cap50Char_Login.length)

            // check input limit that is should be capped at 50 character
            const input_login = page.getByLabel('Login')
            const hintId_login = await input_login.getAttribute('aria-describedby')
            await expect(page.locator(`#${hintId_login}`)).toHaveText('50/50')
        });


        test('check Save button is enabled after valid input', async ({ page }) => {
            // input valid Login
            await page.getByLabel('Login').fill(credentials.login_valid)
            await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();
        });
    });



    test.describe('Change Password', async () => {

        test.beforeEach('Click to change Password', async ({ page }) => {
            // click on the Change Password sidebar tab
            await page.locator('fuse-vertical-navigation-basic-item').filter({ hasText: 'Change Password' }).click();
            await expect(page.getByRole('dialog')).toBeVisible();
        });


        test('check elements on Change Password dialog box', async ({ page }) => {
            // check New Password field
            const locator_newPassword = page.locator('label').filter({ hasText: /^\s*New Password\s*$/ })
            await expect(locator_newPassword).toBeVisible()
            await expect(locator_newPassword.locator('span')).toBeVisible()
            await expect(page.getByLabel('New Password')).toBeVisible()
            // check input limit
            const input_newPassword = page.getByLabel('New Password')
            const hintId_newPassword = await input_newPassword.getAttribute('aria-describedby')
            await expect(page.locator(`#${hintId_newPassword}`)).toHaveText('0/25')

            // check Confirm Password field
            const locator_confirmPassword = page.locator('label').filter({ hasText: /^\s*Confirm Password\s*$/ })
            await expect(locator_confirmPassword).toBeVisible()
            await expect(locator_confirmPassword.locator('span')).toBeVisible()
            await expect(page.getByLabel('Confirm Password')).toBeVisible()

            // check button
            await expect(page.getByRole('button', { name: 'Reset Password' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Reset Password' })).toBeDisabled();
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();

            // close the dialog box
            await page.getByRole('button', { name: 'Cancel' }).click();
            await expect(page.getByRole('dialog')).not.toBeAttached();
        });


        test('check error message for having empty field', async ({ page }) => {
            // New Password field
            await page.getByLabel(/^New Password$/).fill('')
            await page.locator('label').filter({ hasText: /^New Password$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.customerPassword_missing_message })).toBeVisible()
        });


        test('check error message for having less character', async ({ page }) => {
            // New Password field
            await page.getByLabel(/^New Password$/).fill('1')
            await page.locator('label').filter({ hasText: /^New Password$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.password_short_message })).toBeVisible()
        });


        test('check maximum cap for New Password input field', async ({ page }) => {
            // input New Password field with more than 25 characters
            await page.getByLabel(/^New Password$/).fill('a'.repeat(30))

            // check input limit that is should be capped at 25 character
            const input_newPassword = page.getByLabel('New Password')
            const hintId_newPassword = await input_newPassword.getAttribute('aria-describedby')
            await expect(page.locator(`#${hintId_newPassword}`)).toHaveText('25/25')
        });


        test('check matching passwords', async ({ page }) => {
            // fill New Password field
            await page.getByLabel(/^New Password$/).fill(credentials.password_valid)
            // fill Confirm Password field
            await page.getByLabel(/^Confirm Password$/).fill(credentials.password_false)
            // check Confirm Password field
            await expect(page.locator('mat-error').filter({ hasText: credentials.confirmNewPassword_notMatch_message })).toBeVisible()
        });


        test('check Save button is enabled after valid input', async ({ page }) => {
            // input valid New Password and Confirm Password
            await page.getByLabel(/^New Password$/).fill(credentials.password_valid)
            await page.getByLabel(/^Confirm Password$/).fill(credentials.password_valid)
            await expect(page.getByRole('button', { name: 'Reset Password' })).toBeEnabled();
        });
    });



    test.describe('check Add Product button', async () => {

        test.beforeEach('Click to add product', async ({ page }) => {
            // click on Add Product sidebar tile under Products section
            await page.locator('fuse-vertical-navigation-basic-item').filter({ hasText: 'Add Product' }).click();
            await expect(page.getByRole('dialog')).toBeVisible();
        });


        test('check elements on Add Product dialog box', async ({ page }) => {
            // check Part Number field
            const locator_partNumber = page.locator('label').filter({ hasText: /^\s*Part Number\s*$/ })
            await expect(locator_partNumber).toBeVisible()
            await expect(locator_partNumber.locator('span')).toBeVisible()
            await expect(page.getByLabel('Part Number')).toBeVisible()
            // check input limit
            const input_partNumber = page.getByLabel('Part Number')
            const hintId_partNumber = await input_partNumber.getAttribute('aria-describedby')
            await expect(page.locator(`#${hintId_partNumber}`)).toHaveText('0/80')

            // check Description field
            const locator_description = page.locator('label').filter({ hasText: /^\s*Description\s*$/ })
            await expect(locator_description).toBeVisible()
            await expect(locator_description.locator('span')).toBeVisible()
            await expect(page.getByLabel('Description')).toBeVisible()
            // check input limit
            const input_description = page.getByLabel('Description')
            const hintId_description = await input_description.getAttribute('aria-describedby')
            await expect(page.locator(`#${hintId_description}`)).toHaveText('0/1000')

            // check button
            await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();

            // close the dialog box
            await page.getByRole('button', { name: 'Cancel' }).click();
            await expect(page.getByRole('dialog')).not.toBeAttached();
        });


        test('check error messages for having empty field', async ({ page }) => {
            // Part Number field
            await page.getByLabel(/^Part Number$/).fill('')
            await page.locator('label').filter({ hasText: /^Part Number$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.partNumber_missing_message })).toBeVisible()
            // Description field
            await page.getByLabel(/^Description$/).fill('')
            await page.locator('label').filter({ hasText: /^Description$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.description_missing_message })).toBeVisible()
        });


        test('check maximum cap for Part Number input field', async ({ page }) => {
            // input Part Number field with more than 80 characters
            await page.getByLabel(/^Part Number$/).fill(credentials.over80Char)

            // check the displayed Part Number
            const cap80Char_PartNumber = await page.inputValue('[formcontrolname="partNumber"]')
            expect(cap80Char_PartNumber).toBe('a'.repeat(80))
            console.log('#Try to input at Part Number:', credentials.over80Char)
            console.log('Length of input Part Number:', credentials.over80Char.length)
            console.log('Actual displayed Part Number:', cap80Char_PartNumber)
            console.log('Length of displayed Part Number:', cap80Char_PartNumber.length)

            // check input limit that is should be capped at 80 character
            const input_partNumber = page.getByLabel('Part Number')
            const hintId_partNumber = await input_partNumber.getAttribute('aria-describedby')
            await expect(page.locator(`#${hintId_partNumber}`)).toHaveText('80/80')
        });


        test('check maximum cap for Description field', async ({ page }) => {
            // input Description field with more than 1000 characters
            await page.getByLabel(/^Description$/).fill(credentials.over1000Char)

            // check the displayed Part Number
            const cap1000Char_Description = await page.inputValue('[formcontrolname="description"]')
            expect(cap1000Char_Description).toBe('a'.repeat(1000))
            console.log('#Try to input at Description:', credentials.over1000Char)
            console.log('Length of input Description:', credentials.over1000Char.length)
            console.log('Actual displayed Description:', cap1000Char_Description)
            console.log('Length of displayed Description:', cap1000Char_Description.length)

            // check input limit that is should be capped at 1000 character
            const input_description = page.getByLabel('Description')
            const hintId_description = await input_description.getAttribute('aria-describedby')
            await expect(page.locator(`#${hintId_description}`)).toHaveText('1000/1000')
        });


        test('check Save button is enabled after valid input', async ({ page }) => {
            // input valid Part Number and Description
            await page.getByLabel(/^Part Number$/).fill(credentials.partNumber_valid)
            await page.getByLabel(/^Description$/).fill(credentials.description_valid)
            await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled();
        });
    });
});