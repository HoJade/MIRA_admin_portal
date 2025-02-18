import { test, expect } from '@playwright/test';
// import the configuration
import { trace } from '../playwright.config'
import * as credentials from '../config/credential'

// set the retry parameter explicitly for this test script
test.describe.configure({ retries: 0 })

/* Un-comment this section WHEN trace is not set to 'on' in the playwright.config.js

// set-up the tracing for all the tests in this file
let context
let page
let isTracingStarted = false    // track if tracking has been started

test.beforeAll(async ({ browser }) => {
    context = await browser.newContext()

    // only start tracing if it is not 'on' and it hasn't been started yet 
    if (trace !== 'on') {
        try {
            await context.tracing.start(
                {
                    snapshots: true,      // snapshot --> every actions: Action | Before | After
                    screenshots: true     // screenshot --> the screen capture during the tracing
                })
            isTracingStarted = true     // set flag to true
        } catch (error) {
            console.error('Error starting tracing:', error)

        }
    }

    // only create a new page if tracing has started
    if (isTracingStarted) {
        page = await context.newPage()
    }
})
// stop the tracing for all the tests in this file, and give the location and name of the trace file
test.afterAll(async () => {
    // only stop tracing if it was started
    if (isTracingStarted) {
        try {
            await context.tracing.stop({ path: './trace-viewer/record_trace.zip' })
            isTracingStarted = false        // reset the flag
        } catch (error) {
            console.error('Error stopping tracing:', error)
        }

    }

})
*/


test.beforeEach('Land to MIRA Admin portal login page', async ({ page }) => {
    // land to MIRA Admin portal login page
    await page.goto('/auth/sign-in');
    await expect(page.getByRole('img')).toBeVisible();
});



test.describe('MIRA Admin portal Login page', () => {

    test('check elements on MIRA Admin portal Login page', async ({ page, headless }) => {
        // check Username field
        await expect(page.locator('#mat-mdc-form-field-label-0')).toHaveText(/Username/);
        await expect(page.locator('xpath=//span[@class="mat-mdc-form-field-required-marker mdc-floating-label--required ng-tns-c2608167813-1 ng-star-inserted"]')).toBeVisible();
        await expect(page.locator('#username')).toBeVisible()
        // check Password field
        await expect(page.locator('#mat-mdc-form-field-label-2')).toHaveText(/Password/);
        await expect(page.locator('xpath=//span[@class="mat-mdc-form-field-required-marker mdc-floating-label--required ng-tns-c2608167813-2 ng-star-inserted"]')).toBeVisible();
        await expect(page.locator('mat-form-field').filter({ hasText: 'Password' }).getByRole('button')).toBeVisible()
        await expect(page.locator('#password')).toBeVisible()
        // check button
        await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible()
        // check "Forgot password" hyperlink
        await expect(page.getByRole('link', { name: 'Forgot password?' })).toBeVisible()
        await expect(page.getByRole('link', { name: 'Forgot password?' })).toHaveAttribute('href', expect.stringContaining('forgot-password'))
        // do image comparison WHEN run in headed mode
        if (headless) {
            await expect.soft(page).toHaveScreenshot()
        } else {
            console.log('Skipping screenshot comparison for headed mode.')
        }
    })

    test('check error messages for having empty field', async ({ page }) => {
        // Username field
        await page.locator('#username').fill('')
        await page.locator('label').filter({ hasText: 'Username' }).click()
        await expect(page.locator('mat-error').filter({ hasText: credentials.usernameMissing_message })).toBeVisible()
        // Password field
        await page.locator('#password').fill('')
        await page.locator('label').filter({ hasText: 'Password' }).click()
        await expect(page.locator('mat-error').filter({ hasText: credentials.passwordMissing_message })).toBeVisible()
    })

    test('login_success', async ({ page, headless }) => {

        // Username
        await page.getByLabel('Username').click();
        await page.getByLabel('Username').fill(credentials.username_true);
        console.log('Username:', credentials.username_true)

        // Password
        await page.getByLabel('Password').click();
        await page.getByLabel('Password').fill(credentials.password_true);
        console.log('Password:', credentials.password_true)

        // check password input
        await page.locator('mat-form-field').filter({ hasText: 'Password' }).getByRole('button').click();
        const revealedPassword = await page.inputValue('#password')
        expect(revealedPassword).toBe(credentials.password_true)

        // Sign-in
        await page.getByRole('button', { name: 'Sign in' }).click();

        // land to MIRA Admin portal main landing page
        await page.waitForURL(/home/)
        await expect(page).toHaveURL(/home/);
        await expect(page.locator('app-home').getByRole('img')).toBeVisible({ timeout: 20000 });
        const user_name = await page.locator('[class="user-name font-semibold"]').innerText()
        console.log('User Name:', user_name)
        await expect(page.getByRole('paragraph')).toHaveText(new RegExp('Welcome ' + user_name))
    });

    test('login_fail_username', async ({ page }) => {

        // Username
        await page.getByLabel('Username').fill(credentials.username_false);
        console.log('Username:', credentials.username_false)

        // Password
        await page.getByLabel('Password').fill(credentials.password_false);
        console.log('Password:', credentials.password_false)

        // Sign-in
        await page.getByRole('button', { name: 'Sign in' }).click();

        // check error message
        await expect(page.locator('fuse-alert div').first()).toHaveText(credentials.incorrectUsername_message);
    });

    test('login_fail_password', async ({ page }) => {

        // Username
        await page.getByLabel('Username').fill(credentials.username_true);
        console.log('Username:', credentials.username_true)

        // Password
        await page.getByLabel('Password').fill(credentials.password_false);
        console.log('Password:', credentials.password_false)

        // Sign-in
        await page.getByRole('button', { name: 'Sign in' }).click();

        // check error message
        await expect(page.locator('fuse-alert div').first()).toHaveText(credentials.incorrectPassword_message);
    });


    test.describe('Forgot Password page', () => {

        test.beforeEach('Land to Forgot password page', async ({ page }) => {
            // click "Forgot password" hyperlink
            await page.getByRole('link', { name: 'Forgot password?' }).click()
            await expect(page).toHaveURL(/\/auth\/forgot-password\/?$/)
        })


        test('check elements on Forgot Password page', async ({ page, headless }) => {
            // check Email field
            const locator_confirmNewPassword = page.locator('mat-form-field').filter({ hasText: 'Email' })
            await expect(locator_confirmNewPassword.locator('label')).toBeVisible()
            await expect(locator_confirmNewPassword.locator('label > span')).toBeVisible()
            await expect(locator_confirmNewPassword.locator('#email')).toBeVisible()
            // check button
            await expect(page.getByRole('button', { name: 'Send Reset Link' })).toBeVisible()
            // check "sign in" hyperlink
            await expect(page.getByRole('link', { name: 'sign in' })).toBeVisible()
            await expect(page.getByRole('link', { name: 'sign in' })).toHaveAttribute('href', expect.stringContaining('sign-in'))
            // do image comparison WHEN run in headed mode
            if (headless) {
                await expect.soft(page).toHaveScreenshot()
            } else {
                console.log('Skipping screenshot comparison for headed mode.')
            }
        })

        test('check error message for having empty field', async ({ page }) => {
            // Email field
            await page.locator('#email').fill('')
            await page.locator('label').filter({ hasText: 'Email' }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.emailMissingForgotPassword_message })).toBeVisible()
        })

        test('check error message for invalid Email', async ({ page }) => {
            // Email field
            await page.locator('#email').fill(credentials.emailInvalid)
            await page.locator('label').filter({ hasText: 'Email' }).click()

            // check error message
            /*  `.toHaveText()` check for exact match, and implies checking visibility 
                `.toContainText()` check for partial match
            */
            await expect(page.locator('mat-error')).toHaveText(new RegExp(credentials.emailInavlidForgotPassword_message))
        })

        test('check redirection to Sign-in page', async ({ page, headless }) => {
            // click "sign in" hyperlink
            await page.getByRole('link', { name: 'sign in' }).click()
            await expect(page).toHaveURL(/\/auth\/sign-in\/?$/)
            // do image comparison WHEN run in headed mode
            if (headless) {
                await expect.soft(page).toHaveScreenshot()
            } else {
                console.log('Skipping screenshot comparison for headed mode.')
            }
        })
    })
});



test.describe('Navigation Bar', () => {

    test.beforeEach('Login to MIRA Admin portal', async ({ page }) => {
        await page.getByLabel('Username').fill(credentials.username_true);
        await page.getByLabel('Password').fill(credentials.password_true);
        await page.getByRole('button', { name: 'Sign in' }).click();
        // wait to land to MIRA Admin portal main landing page
        await page.waitForSelector('app-home img', { state: 'visible', timeout: 20000 });
    });


    test('Navigation Bar Items', async ({ page }) => {

        // locate all Navigation Item name
        const navigationBarItems = await page.locator('[class="fuse-horizontal-navigation-item-title"]').allInnerTexts()
        console.log('Navigation Bar Items:', navigationBarItems)
        await expect(navigationBarItems).toEqual(credentials.navigationBarItems)
    });

    test('Customers Menu', async ({ page }) => {

        // click on the Customers Navigation button
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Customers' }).click();
        // locate all the corresponding Menu Items
        const menuItems = await page.locator('span > fuse-horizontal-navigation-basic-item');
        const allMenuTexts = await menuItems.allInnerTexts();
        console.log('Menu Items:', allMenuTexts);
        // check if the Menu Items are as expected
        await expect(allMenuTexts).toEqual(credentials.customersMenuItems);
    });

    test('Users Menu', async ({ page }) => {

        // click on the Users Navigation button
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Users' }).click();
        // locate all the corresponding Menu Items
        const menuItems = await page.locator('span > fuse-horizontal-navigation-basic-item');
        const allMenuTexts = await menuItems.allInnerTexts();
        console.log('Menu Items:', allMenuTexts);
        // check if the Menu Items are as expected
        await expect(allMenuTexts).toEqual(credentials.usersMenuItems);
    });

    test('Orders Menu', async ({ page }) => {

        // click on the Users Navigation button
        await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Orders' }).click();
        // locate all the corresponding Menu Items
        const menuItems = await page.locator('span > fuse-horizontal-navigation-basic-item');
        const allMenuTexts = await menuItems.allInnerTexts();
        console.log('Menu Items:', allMenuTexts);
        // check if the Menu Items are as expected
        await expect(allMenuTexts).toEqual(credentials.ordersMenuItems);
    });

    test('Account Menu', async ({ page }) => {

        // click on the Account section
        await page.locator('.flex > .mat-mdc-menu-trigger').click();
        // locate all the corresponding Menu Items
        const menuItems = await page.locator('div > button');
        const allMenuTexts = await menuItems.allInnerTexts();
        console.log('Menu Items:', allMenuTexts);
        // check if the Menu Items are as expected
        await expect(allMenuTexts).toEqual(credentials.accountMenuItems);
    });

    test('Home Button', async ({ page }) => {

        // Pre-requisite: on any page other than the main landing page
        await page.goto('/profile/change-password')
        // click on the Home button
        await page.click('[class="hidden lg:flex cursor-pointer"]')
        // check if directed to the main landing page
        await expect(page).toHaveURL(/home/);
    });
});



test.describe('Customers', () => {

    test.beforeEach('Login to MIRA Admin portal', async ({ page }) => {
        await page.getByLabel('Username').fill(credentials.username_true);
        await page.getByLabel('Password').fill(credentials.password_true);
        await page.getByRole('button', { name: 'Sign in' }).click();
        // wait to land to MIRA Admin portal main landing page
        await page.waitForSelector('app-home img', { state: 'visible', timeout: 20000 });
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
            await expect(page.locator('mat-form-field > div > div > div > label').nth(0)).toHaveText(/Name/)
            await expect(page.locator('mat-form-field > div > div > div > label > span').nth(0)).toBeVisible()
            await expect(page.locator('[formcontrolname="customerName"]')).toBeVisible()
            // check Login field
            await expect(page.locator('mat-form-field > div > div > div > label').nth(1)).toHaveText(/Login/)
            await expect(page.locator('mat-form-field > div > div > div > label > span').nth(1)).toBeVisible()
            await expect(page.locator('[formcontrolname="login"]')).toBeVisible()
            // check Password field
            await expect(page.locator('mat-form-field > div > div > div > label').nth(2)).toHaveText(/Password/)
            await expect(page.locator('mat-form-field > div > div > div > label > span').nth(2)).toBeVisible()
            await expect(page.locator('[formcontrolname="password"]')).toBeVisible()
            await expect(page.locator('form').getByRole('button')).toBeVisible()
            // check button
            await expect(page.getByRole('button', { name: 'Add Customer' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Add Customer' })).toBeDisabled();

            // do image comparison WHEN run in headed mode
            if (headless) {
                await expect.soft(page).toHaveScreenshot()
            } else {
                console.log('Skipping screenshot comparison for headed mode.')
            }
        });

        test('check error messages for having empty field', async ({ page }) => {
            // Name field
            await page.locator('[formcontrolname="customerName"]').fill('')
            await page.locator('mat-form-field > div > div > div > label').nth(0).click()
            await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.nameMissing_message))
            // Login field
            await page.locator('[formcontrolname="login"]').fill('')
            await page.locator('mat-form-field > div > div > div > label').nth(1).click()
            await expect(page.locator('mat-error').nth(1)).toHaveText(new RegExp(credentials.loginMissing_message))
            // Password field
            await page.locator('[formcontrolname="password"]').fill('')
            await page.locator('mat-form-field > div > div > div > label').nth(2).click()
            await expect(page.locator('mat-error').nth(2)).toHaveText(new RegExp(credentials.passwordMissing_message))
        });

        test('check error messages for having less characters', async ({ page }) => {
            // Login field
            await page.locator('[formcontrolname="login"]').fill('1')
            await page.locator('mat-form-field > div > div > div > label').nth(1).click()
            await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.loginShort_message))
            // Password field
            await page.locator('[formcontrolname="password"]').fill('1')
            await page.locator('mat-form-field > div > div > div > label').nth(2).click()
            await expect(page.locator('mat-error').nth(1)).toHaveText(new RegExp(credentials.passwordShort_message))
        });

        test('check error messages for having space character', async ({ page }) => {
            // Login field
            await page.locator('[formcontrolname="login"]').fill(' ')
            await page.locator('mat-form-field > div > div > div > label').nth(1).click()
            await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.loginSpace_message))
            // Password field
            await page.locator('[formcontrolname="password"]').fill(' ')
            await page.locator('mat-form-field > div > div > div > label').nth(2).click()
            await expect(page.locator('mat-error').nth(3)).toHaveText(new RegExp(credentials.passwordSpace_message))
        });

        test('check error message for already existing Login', async ({ page }) => {
            // Login field
            await page.locator('[formcontrolname="login"]').fill(credentials.loginAlrExist)
            await page.locator('mat-form-field > div > div > div > label').nth(1).click()
            await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.loginAlrExist_message))
        });

        test('check maximum cap for Name input field', async ({ page }) => {
            // input Name field with more than 50 characters
            await page.locator('[formcontrolname="customerName"]').fill(credentials.over50Char)
            // check the displayed Name
            const cap50CharName = await page.inputValue('[formcontrolname="customerName"]')
            await expect(cap50CharName).toBe('a'.repeat(50))
            console.log('#Try to input at Name:', credentials.over50Char)
            console.log('Length of input Name:', credentials.over50Char.length)
            console.log('Actual displayed Name:', cap50CharName)
            console.log('Length of displayed Name:', cap50CharName.length)
        });

        test('check maximum cap for Login input field', async ({ page }) => {
            // input Login field with more than 20 characters
            await page.locator('[formcontrolname="login"]').fill(credentials.over20Char)
            // check the displayed Login
            const cap20CharLogin = await page.inputValue('[formcontrolname="login"]')
            await expect(cap20CharLogin).toBe('a'.repeat(20))
            console.log('#Try to input at Login:', credentials.over20Char)
            console.log('Length of input Login:', credentials.over20Char.length)
            console.log('Actual displayed Login:', cap20CharLogin)
            console.log('Length of displayed Name:', cap20CharLogin.length)
        });

        test('check valid Password input before/after revealing', async ({ page }) => {
            // input valid Password
            await page.locator('[formcontrolname="password"]').fill(credentials.passwordValid)
            // click to reveal
            await page.locator('mat-form-field').filter({ hasText: 'Password' }).getByRole('button').click();
            const revealedPassword = await page.inputValue('[formcontrolname="password"]')
            expect(revealedPassword).toBe(credentials.passwordValid)
        });

        test('check button is enabled after valid input', async ({ page }) => {
            // input valid Name, Login, Password
            await page.locator('[formcontrolname="customerName"]').fill(credentials.nameValid)
            await page.locator('[formcontrolname="login"]').fill(credentials.loginValid)
            await page.locator('[formcontrolname="password"]').fill(credentials.passwordValid)
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
});



test.describe('Users', () => {

    test.beforeEach('Login to MIRA Admin portal', async ({ page }) => {
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
                await expect.soft(page).toHaveScreenshot()
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


    test.describe('Groups page', async () => {

        test.beforeEach('Go to Groups page', async ({ page }) => {
            // go to View Users page
            await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Users' }).click();
            await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'Groups' }).click();
            await expect(page).toHaveURL(/\/users\/groups\/all\/?$/);
        });


        test('check elements on Groups page', async ({ page }) => {
            // check button
            await expect(page.getByRole('button', { name: 'Add Group' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Add Group' })).toBeEnabled();
            // check filter field
            await expect(page.locator('mat-form-field')).toHaveText(/Filter/);
            await expect(page.locator('mat-form-field')).toBeVisible();

            // check the redirection to Add Customer page
            await page.getByRole('button', { name: 'Add Group' }).click();
            await expect(page).toHaveURL(/\/users\/groups\/edit-group\/\d*?$/);
        });
    });


    test.describe('Add Group sub-page', async () => {

        test.beforeEach('Go to Add Group sub-page', async ({ page }) => {
            // go to Add Group sub-page
            await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Users' }).click();
            await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'Groups' }).click();
            await expect(page).toHaveURL(/\/users\/groups\/all\/?$/);
            await page.getByRole('button', { name: 'Add Group' }).click();
            await expect(page).toHaveURL(/\/users\/groups\/edit-group\/\d*?$/);
        });


        test('check elements on Add Group sub-page', async ({ page, headless }) => {
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
                await expect.soft(page).toHaveScreenshot()
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
                await expect.soft(page).toHaveScreenshot()
            } else {
                console.log('Skipping screenshot comparison for headed mode.')
            }
        });
    });
});



test.describe('Orders', () => {

    test.beforeEach('Login to MIRA Admin portal', async ({ page }) => {
        await page.getByLabel('Username').fill(credentials.username_true);
        await page.getByLabel('Password').fill(credentials.password_true);
        await page.getByRole('button', { name: 'Sign in' }).click();
        // wait to land to MIRA Admin portal main landing page
        await page.waitForSelector('app-home img', { state: 'visible', timeout: 20000 });
    });


    test.describe('Add Order page', async () => {

        test.beforeEach('Go to Add Order page', async ({ page }) => {
            // go to Add Order page
            await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Orders' }).click();
            await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'Add Order' }).click();
            await expect(page).toHaveURL(/\/orders\/edit-order\/\d*?$/);
        });


        test('check elements on Add Order page', async ({ page, headless }) => {
            // check Order Info box
            await expect(page.locator('.card')).toHaveText(/Order/)
            // check Customer drop-down field
            await expect(page.locator('mat-form-field > div > div > div > label').nth(0)).toHaveText(/Customer/)
            await expect(page.locator('[formcontrolname="customer"]')).toBeVisible()
            await expect(page.getByLabel('Customer').locator('svg')).toBeVisible()
            // check Product drop-down field
            await expect(page.locator('mat-form-field > div > div > div > label').nth(1)).toHaveText(/Product/)
            await expect(page.locator('mat-form-field > div > div > div > label > span').nth(0)).toBeVisible()
            await expect(page.locator('[formcontrolname="productId"]')).toBeVisible()
            await expect(page.getByLabel('Product').locator('svg')).toBeVisible()
            // check Order Number field
            await expect(page.locator('mat-form-field > div > div > div > label').nth(2)).toHaveText(/Order Number/)
            await expect(page.locator('mat-form-field > div > div > div > label > span').nth(1)).toBeVisible()
            await expect(page.locator('[formcontrolname="orderNumber"]')).toBeVisible()
            // check Quantity field
            await expect(page.locator('mat-form-field > div > div > div > label').nth(3)).toHaveText(/Quantity/)
            await expect(page.locator('mat-form-field > div > div > div > label > span').nth(2)).toBeVisible()
            await expect(page.locator('[formcontrolname="qtyRequested"]')).toBeVisible()
            // check Due Date field
            await expect(page.locator('mat-form-field > div > div > div > label').nth(4)).toHaveText(/Due date/)
            await expect(page.locator('mat-form-field > div > div > div > label > span').nth(3)).toBeVisible()
            await expect(page.locator('[formcontrolname="dueDate"]')).toBeVisible()
            await expect(page.locator('form').getByRole('button')).toBeVisible()
            // check button
            await expect(page.getByRole('button', { name: 'Add Order' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Add Order' })).toBeDisabled();
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();

            // do image comparison WHEN run in headed mode
            if (headless) {
                await expect.soft(page).toHaveScreenshot()
            } else {
                console.log('Skipping screenshot comparison for headed mode.')
            }
        });

        test('check error messages for having empty field', async ({ page }) => {
            // Product field
            await page.locator('[formcontrolname="productId"]').click()
            await page.keyboard.press('Escape')
            await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.productMissing_message))
            // Order Number field
            await page.locator('[formcontrolname="orderNumber"]').fill('')
            await page.locator('mat-form-field > div > div > div > label').nth(2).click()
            await expect(page.locator('mat-error').nth(1)).toHaveText(new RegExp(credentials.orderNumberMissing_message))
            // Quantity field
            await page.locator('[formcontrolname="qtyRequested"]').fill('')
            await page.locator('mat-form-field > div > div > div > label').nth(3).click()
            await expect(page.locator('mat-error').nth(2)).toHaveText(new RegExp(credentials.quantityMissing_message))
            // Due Date field
            await page.locator('[formcontrolname="dueDate"]').click()
            await page.keyboard.press('Escape')
            await expect(page.locator('mat-error').nth(3)).toHaveText(new RegExp(credentials.dueDateMissing_message))
        });

        test('check error messages for inputting 0', async ({ page }) => {
            // Order Number field
            await page.locator('[formcontrolname="orderNumber"]').fill('0')
            await page.locator('mat-form-field > div > div > div > label').nth(2).click()
            await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.orderNumberCannotBeZero_message))
            // Quantity field
            await page.locator('[formcontrolname="qtyRequested"]').fill('0')
            await page.locator('mat-form-field > div > div > div > label').nth(3).click()
            await expect(page.locator('mat-error').nth(1)).toHaveText(new RegExp(credentials.quantityCannotBeZero_message))
        });

        test('check maximum cap for Order Number input field', async ({ page }) => {
            // input Order Number field with more than 9 digits
            await page.locator('[formcontrolname="orderNumber"]').fill(credentials.over9Dig)
            // check the displayed Order Number
            const cap9DigOrderNumber = await page.inputValue('[formcontrolname="orderNumber"]')
            await expect(cap9DigOrderNumber).toBe('1'.repeat(9))
            console.log('#Try to input at Order Number:', credentials.over9Dig)
            console.log('Length of input Order Number:', credentials.over9Dig.length)
            console.log('Actual displayed Order Number:', cap9DigOrderNumber)
            console.log('Length of displayed Order Number:', cap9DigOrderNumber.length)
        });

        test('check maximum cap for Quantity input field', async ({ page }) => {
            // input Quantity field with more than 5 digits
            await page.locator('[formcontrolname="qtyRequested"]').fill(credentials.over5Dig)
            // check the displayed Quantity
            const cap5DigOrderNumber = await page.inputValue('[formcontrolname="qtyRequested"]')
            await expect(cap5DigOrderNumber).toBe('1'.repeat(5))
            console.log('#Try to input at Quantity:', credentials.over5Dig)
            console.log('Length of input Quantity:', credentials.over5Dig.length)
            console.log('Actual displayed Quantity:', cap5DigOrderNumber)
            console.log('Length of displayed Quantity:', cap5DigOrderNumber.length)
        });

        test('check error message for already existing Order Number', async ({ page }) => {
            // Order Number field
            await page.locator('[formcontrolname="orderNumber"]').fill(credentials.orderNumberAlrExist)
            await page.locator('mat-form-field > div > div > div > label').nth(2).click()
            await expect(page.locator('mat-error').nth(0)).toHaveText(new RegExp(credentials.orderNumberAlrExist_message))
        });

        test('check Customer selection', async ({ page }) => {
            await page.locator('[formcontrolname="customer"]').click()
            // select the first customer option
            const customer_selection = await page.getByRole('option').nth(0).innerText()
            await page.getByRole('option').nth(0).click()
            await expect(page.locator('[formcontrolname="customer"]')).toHaveText(customer_selection)
            console.log('Selected Customer:', customer_selection)
        });

        test('check Product selection', async ({ page }) => {
            await page.locator('[formcontrolname="productId"]').click()
            // select the first product option
            const product_selection = await page.getByRole('option').nth(0).innerText()
            await page.getByRole('option').nth(0).click()
            await expect(page.locator('[formcontrolname="productId"]')).toHaveText(product_selection)
            console.log('Selected Product:', product_selection)
        });

        test('check Due Date selection', async ({ page }) => {
            await page.locator('[formcontrolname="dueDate"]').click()
            // select the desired Due Date option
            await page.locator('.mat-calendar-body-today').click()
            await expect(page.locator('mat-calendar')).not.toBeAttached()
        });

        test('check Order Number auto-display', async ({ page }) => {
            await page.locator('[formcontrolname="orderNumber"]').fill(credentials.orderNumberValid)
            // check the inputted Order Number
            const inputtedOrderNumber = await page.inputValue('[formcontrolname="orderNumber"]')
            console.log('Inputted Order Number:', inputtedOrderNumber)
            await expect(page.locator('legend')).toHaveText(inputtedOrderNumber)
        })

        test('check buttons are enabled after valid input', async ({ page }) => {
            test.setTimeout(30000);             // Set timeout to 30 seconds for this test
            // select the first valid Product option
            await page.locator('[formcontrolname="productId"]').click()
            await page.getByRole('option').nth(0).click()
            // input valid Order Number
            await page.locator('[formcontrolname="orderNumber"]').fill(credentials.orderNumberValid)
            // input valid Quantity
            await page.locator('[formcontrolname="qtyRequested"]').fill(credentials.quantityValid)
            // select valid Due Date
            await page.locator('[formcontrolname="dueDate"]').click()
            await page.locator('.mat-calendar-body-today').click()
            // check the buttons
            await expect(page.getByRole('button', { name: 'Add Order' })).toBeEnabled();
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();
        });

        test('check Cancel button', async ({ page }) => {
            const btn_Cancel = page.getByRole('button', { name: 'Cancel' })
            await expect(btn_Cancel).toBeVisible();
            await expect(btn_Cancel).toBeEnabled();
            await btn_Cancel.click()
            await expect(page).toHaveURL(/\/orders\/all-orders\/?$/)
        });
    });


    test.describe('View Order page', async () => {

        test.beforeEach('Go to View Order page', async ({ page }) => {
            // go to Add Order page
            await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Orders' }).click();
            await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'View Orders' }).click();
            await expect(page).toHaveURL(/\/orders\/all-orders\/?$/);
        });


        test('check elements on View Orders page', async ({ page }) => {
            // check button
            await expect(page.getByRole('button', { name: 'Add Order' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Add Order' })).toBeEnabled();
            // check filter field
            await expect(page.locator('mat-form-field')).toHaveText(/Filter/);
            await expect(page.locator('mat-form-field')).toBeVisible();

            // check the redirection to Add Order page
            await page.getByRole('button', { name: 'Add Order' }).click();
            await expect(page).toHaveURL(/\/orders\/edit-order\/\d*?$/);
        });
    });
});



test.describe('Traveler Builder', () => {

    test.beforeEach('Login to MIRA Admin portal', async ({ page }) => {
        await page.getByLabel('Username').fill(credentials.username_true);
        await page.getByLabel('Password').fill(credentials.password_true);
        await page.getByRole('button', { name: 'Sign in' }).click();
        // wait to land to MIRA Admin portal main landing page
        await page.waitForSelector('app-home img', { state: 'visible', timeout: 20000 });
    });


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

            // check heading
            await expect(page.getByRole('heading', { name: 'Add Template' })).toBeVisible()

            // check Customer drop-down field
            const locator_customer = page.locator('label').filter({ hasText: 'Customer' })
            await expect(locator_customer).toBeVisible()
            await expect(locator_customer.locator('span')).toBeVisible()
            await expect(page.locator('[formcontrolname="customer"]')).toBeVisible()
            await expect(page.getByLabel('Customer').locator('svg')).toBeVisible()
            // check Product drop-down field
            const locator_product = page.locator('label').filter({ hasText: 'Product' })
            await expect(locator_product).toBeVisible()
            await expect(locator_product.locator('span')).toBeVisible()
            await expect(page.locator('[formcontrolname="product"]')).toBeVisible()
            await expect(page.getByLabel('Product').locator('svg')).toBeVisible()

            // check Template Type radio button field
            const locator_templateType = page.getByRole('radiogroup').filter({ hasText: 'Template Type' })
            await expect(locator_templateType).toBeVisible()
            await expect(locator_templateType.locator('mat-radio-button').filter({ hasText: 'Serial Number' })).toBeVisible()
            await expect(locator_templateType.locator('mat-radio-button').filter({ hasText: 'Batch Number' })).toBeVisible()
            /* approach style 1 */
            await expect(locator_templateType.locator('mat-radio-button').filter({ hasText: 'Serial Number' }).getByRole('radio')).toBeVisible()
            await expect(locator_templateType.locator('mat-radio-button').filter({ hasText: 'Serial Number' }).getByRole('radio')).not.toBeChecked()
            /* approach style 2 */
            await expect(page.getByLabel('Batch Number')).toBeVisible()
            await expect(page.getByLabel('Batch Number')).not.toBeChecked()

            // check Template ID field
            const locator_templateID = page.locator('label').filter({ hasText: 'Template ID' })
            await expect(locator_templateID).toBeVisible()
            await expect(locator_templateID.locator('span')).toBeVisible()
            await expect(page.locator('[formcontrolname="templateName"]')).toBeVisible()
            // check Template Revision field
            const locator_templateRevision = page.locator('label').filter({ hasText: 'Template Revision' })
            await expect(locator_templateRevision).toBeVisible()
            await expect(locator_templateRevision.locator('span')).toBeVisible()
            await expect(page.locator('[formcontrolname="templateRev"]')).toBeVisible()
            // check Template Description field
            const locator_templateDescription = page.locator('label').filter({ hasText: 'Template Description' })
            await expect(locator_templateDescription).toBeVisible()
            await expect(locator_templateDescription.locator('span')).toBeVisible()
            await expect(page.locator('[formcontrolname="description"]')).toBeVisible()

            // check button
            await expect(page.getByRole('button', { name: 'Save' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Save' })).toBeDisabled();
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible();
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled();
        });

        test('check error messages for having empty field', async ({ page }) => {

            // Customer field
            await page.locator('[formcontrolname="customer"]').click()
            await page.keyboard.press('Escape')
            await expect(page.locator('mat-error').filter({ hasText: credentials.customerMissing_message })).toBeVisible()
            // Product field
            await page.locator('[formcontrolname="product"]').click()
            await page.keyboard.press('Escape')
            await expect(page.locator('mat-error').filter({ hasText: credentials.productMissing_message })).toBeVisible()

            // Template ID field
            await page.locator('[formcontrolname="templateName"]').fill('')
            await page.locator('label').filter({ hasText: 'Template ID' }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.templateIDMissing_message })).toBeVisible()
            // Template Revision field
            await page.locator('[formcontrolname="templateRev"]').fill('')
            await page.locator('label').filter({ hasText: 'Template Revision' }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.templateRevisionMissing_message })).toBeVisible()
            // Template Description field
            await page.locator('[formcontrolname="description"]').fill('')
            await page.locator('label').filter({ hasText: 'Template Description' }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.templateDescriptionMissing_message })).toBeVisible()
        });

        test('check error window for already existing Template ID and Revision', async ({ page, headless }) => {
            // fill in already exists Template ID and Revision
            // Customer field
            await page.locator('[formcontrolname="customer"]').click()
            await page.getByRole('option').filter({ hasText: credentials.customerAlrExist }).click()
            // Product field
            await page.locator('[formcontrolname="product"]').click()
            await page.getByRole('option').filter({ hasText: credentials.productAlrExist }).click()
            // Template Type
            await page.getByLabel('Serial Number').check()
            // Template ID field
            await page.locator('[formcontrolname="templateName"]').fill(credentials.templateIDAlrExist)
            // Template Revision field
            await page.locator('[formcontrolname="templateRev"]').fill(credentials.templateRevisionAlrExist)
            // Template Description field
            await page.locator('[formcontrolname="description"]').fill(credentials.templateDescription)
            await page.getByRole('button', { name: 'Save' }).click()
            await expect(page.locator('fuse-confirmation-dialog > div')).toBeVisible()
            // check error pop-up window
            const error_popupWindow = page.locator('fuse-confirmation-dialog > div')
            // do image comparison WHEN run in headed mode
            if (headless) {
                await expect.soft(error_popupWindow).toHaveScreenshot({
                    threshold: 0.02
                })
            } else {
                console.log('Skipping screenshot comparison for headed mode.')
            }
            await error_popupWindow.getByRole('button', { name: 'Ok' }).click()
            await expect(error_popupWindow).not.toBeAttached()
        });

        test('check buttons are enabled after valid input', async ({ page }) => {
            // input valid Customer, Product, Template Type, Template ID, Template Revision, Template Description
            await page.locator('[formcontrolname="customer"]').click()
            await page.getByRole('option').filter({ hasText: credentials.customerAlrExist }).click()
            await page.locator('[formcontrolname="product"]').click()
            await page.getByRole('option').filter({ hasText: credentials.productAlrExist }).click()
            // select "Serial Number" for Template Type
            await page.getByLabel('Serial Number').check()
            await page.locator('[formcontrolname="templateName"]').fill(credentials.templateIDAlrExist)
            await page.locator('[formcontrolname="templateRev"]').fill(credentials.templateRevisionAlrExist)
            await page.locator('[formcontrolname="description"]').fill(credentials.templateDescription)
            // check the buttons
            await expect(page.getByRole('button', { name: 'Save' })).toBeEnabled()
            await expect(page.getByRole('button', { name: 'Cancel' })).toBeEnabled()
        });
    });
});



test.describe('Account Menu', () => {

    test.beforeEach('Login to MIRA Admin portal', async ({ page }) => {
        await page.getByLabel('Username').fill(credentials.username_true);
        await page.getByLabel('Password').fill(credentials.password_true);
        await page.getByRole('button', { name: 'Sign in' }).click();
        // wait to land to MIRA Admin portal main landing page
        await page.waitForSelector('app-home img', { state: 'visible', timeout: 20000 });
    });


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
                await expect.soft(page).toHaveScreenshot()
            } else {
                console.log('Skipping screenshot comparison for headed mode.')
            }
        });

        test('check error messages for having empty field', async ({ page }) => {
            // Current Password field
            await page.locator('#currentPassword').fill('')
            await page.locator('label').filter({ hasText: /^Current Password$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.currentPasswordMissing_message })).toBeVisible()
            // New Password field
            await page.locator('#newPassword').fill('')
            await page.locator('label').filter({ hasText: /^New Password$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.newPasswordMissing_message })).toBeVisible()
            // Confirm New Password
            await page.locator('#confirmPassword').fill('')
            await page.locator('label').filter({ hasText: /^Confirm New Password$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.confirmNewPasswordMissing_message })).toBeVisible()
        });

        test('check error message for having less character', async ({ page }) => {
            // New Password field
            await page.locator('#newPassword').fill('1')
            await page.locator('label').filter({ hasText: /^New Password$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.newPasswordShort_message })).toBeVisible()
        });

        test('check error message for having space character', async ({ page }) => {
            // New Password field
            await page.locator('#newPassword').fill(' ')
            await page.locator('label').filter({ hasText: /^New Password$/ }).click()
            await expect(page.locator('mat-error').filter({ hasText: credentials.newPasswordSpace_message })).toBeVisible()
        });

        test('check New Password and Confirm New Password match or not', async ({ page }) => {
            // New Password field
            await page.locator('#newPassword').fill('1')
            // Confirm New Password field
            await page.locator('#confirmPassword').fill('2')
            await page.locator('label').filter({ hasText: /^Confirm New Password$/ }).click()
            await expect(page.locator('mat-form-field').filter({ hasText: 'Confirm New Password' }).locator('mat-error')).toHaveText(new RegExp(credentials.confirmNewPasswordNotMatch_message))
        });

        test('check input before/after revealing', async ({ page }) => {

            // input valid Current Password
            await page.locator('#currentPassword').fill(credentials.password_true)
            // click to reveal
            await page.locator('mat-form-field').filter({ hasText: 'Current Password' }).getByRole('button').click();
            const revealedCurrentPassword = await page.inputValue('#currentPassword')
            expect(revealedCurrentPassword).toBe(credentials.password_true)

            await page.getByRole('textbox', { name: 'New Password', exact: true }).fill(credentials.passwordValid)
            await page.locator('mat-form-field').nth(1).getByRole('button').click()
            const revealedNewPassword = await page.inputValue('#newPassword')
            expect(revealedNewPassword).toBe(credentials.passwordValid)

            await page.getByRole('textbox', { name: 'Confirm New Password', exact: true }).fill(credentials.passwordValid)
            await page.locator('mat-form-field').filter({ hasText: 'Confirm New Password' }).getByRole('button').click()
            const revealedConfirmNewPassword = await page.inputValue('#confirmPassword')
            expect(revealedConfirmNewPassword).toBe(credentials.passwordValid)
        });

        test('check button is enabled after valid input', async ({ page }) => {
            // input valid Current Password, New Password, Confirm New Password
            await page.locator('#currentPassword').fill(credentials.password_true)
            await page.locator('#newPassword').fill(credentials.passwordValid)
            await page.locator('#confirmPassword').fill(credentials.passwordValid)
            await expect(page.getByRole('button', { name: 'Change Password' })).toBeEnabled()
        });

        test('check error tooltip for incorrect Current Password', async ({ page, headless }) => {
            // input incorrect Current Password
            await page.locator('#currentPassword').fill(credentials.password_false)
            await page.locator('#newPassword').fill(credentials.passwordValid)
            await page.locator('#confirmPassword').fill(credentials.passwordValid)
            await page.getByRole('button', { name: 'Change Password' }).click()
            // check error tooltip
            await expect(page.locator('fuse-alert')).toBeVisible()
            const error_tooltip = page.locator('fuse-alert > div')
            // await error_tooltip.waitFor({ state: 'visible' })        // redundant code
            await expect(error_tooltip).toHaveText(new RegExp(credentials.incorrectPasswordReset_tooltip))
            // do image comparison WHEN run in headed mode
            if (headless) {
                await expect.soft(error_tooltip).toHaveScreenshot({
                    threshold: 0.02
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