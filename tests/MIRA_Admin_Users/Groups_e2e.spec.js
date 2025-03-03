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


test.beforeEach('Go to Groups page', async ({ page }) => {
    // go to Groups page
    await page.locator('fuse-horizontal-navigation-branch-item').filter({ hasText: 'Users' }).click();
    await page.locator('fuse-horizontal-navigation-basic-item').filter({ hasText: 'Groups' }).click();
    await page.waitForURL(/\/users\/groups\/all\/?$/)
});


test.beforeEach('Go to Add Group sub-page', async ({ page }) => {
    await expect(page).toHaveURL(/\/users\/groups\/all\/?$/);
    // go to Add Group sub-page
    await page.getByRole('button', { name: 'Add Group' }).click();
    await page.waitForURL(/\/users\/groups\/edit-group\/\d*?$/)
});



test('create and delete a new Group w/o Users', async ({ page, headless }) => {
    await expect(page).toHaveURL(/\/users\/groups\/edit-group\/\d*?$/);

    // input valid Group Name
    await page.locator('[formcontrolname="name"]').fill(credentials.groupNameValid)
    // select the first role option
    await page.locator('[formcontrolname="groupRoles"]').click()
    await page.getByRole('option').nth(0).click()
    await page.keyboard.press('Escape')
    // check [Add Group] button
    await expect(page.getByRole('button', { name: 'Add Group' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Group' })).toBeEnabled();
    // click [Add Group]
    await page.getByRole('button', { name: 'Add Group' }).click()
    // redirect to Group page
    await page.waitForURL(/\/users\/groups\/all\/?$/)
    await expect(page).toHaveURL(/\/users\/groups\/all\/?$/);
    // locate the newly created Group
    const newGroup = await page.locator('[class="border-b border-gray-200 p-4 hover:bg-gray-100 ng-star-inserted"]').filter({ hasText: credentials.groupNameValid })
    await expect(newGroup).toBeVisible()
    // click [Delete Group] button
    await newGroup.getByRole('button', { name: 'Delete Group' }).click()
    
    // check error pop-up window
    const error_popupWindow = page.locator('fuse-confirmation-dialog > div')
    await expect(error_popupWindow).toBeVisible()
    // do image comparison WHEN run in headed mode
    if (headless) {
        await expect.soft(error_popupWindow).toHaveScreenshot({
            threshold: 0.02     // Allows minor per-pixel color changes
        })
    } else {
        console.log('Skipping screenshot comparison for headed mode.')
    }
    await error_popupWindow.getByRole('button', { name: 'Delete' }).click()
    await expect(error_popupWindow).not.toBeAttached()
    // check the newly created Group should be deleted
    await expect(newGroup).not.toBeVisible()
});


test.fixme('create and delete a new Group w/ Users', async ({ page }) => {
    await expect(page).toHaveURL(/\/users\/groups\/edit-group\/\d*?$/);

    // input valid Group Name
    await page.locator('[formcontrolname="name"]').fill(credentials.groupNameValid)
    // select the first role option
    await page.locator('[formcontrolname="groupRoles"]').click()
    await page.getByRole('option').nth(0).click()
    await page.keyboard.press('Escape')
    // select the first user option
    await page.locator('[formcontrolname="userGroups"]').click()
    await page.getByRole('option').nth(0).click()
    await page.keyboard.press('Escape')
    // check [Add Group] button
    await expect(page.getByRole('button', { name: 'Add Group' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add Group' })).toBeEnabled();
    // click [Add Group]
    await page.getByRole('button', { name: 'Add Group' }).click()
    // redirect to Group page
    await page.waitForURL(/\/users\/groups\/all\/?$/)
    await expect(page).toHaveURL(/\/users\/groups\/all\/?$/);
    // locate the newly created Group
    await expect(page.getByText(credentials.groupNameValid)).toBeVisible()
    // click [Delete Group] button
    await page.getByRole('button', { name: 'Delete Group' }).last()
});