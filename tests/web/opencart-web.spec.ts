import loginData from '../../testdata/opencart_logindata.json';
import { expect, test } from '../../fixtures/pageFixtures';
import type { AccountPage } from '../../pages/AccountPage';
import type { LoginPage } from '../../pages/LoginPage';
import type { CustomerDetails, RegisterPage } from '../../pages/RegisterPage';
import { RandomDataUtil } from '../../utils/dataGenerator';

const dataRows = loginData as Array<{ testName: string; email: string; password: string; expected: 'success' | 'failure' }>;

async function ensureCustomerExists(
  email: string,
  password: string,
  loginPage: LoginPage,
  registerPage: RegisterPage,
  accountPage: AccountPage,
): Promise<void> {
  await loginPage.open();
  await loginPage.login(email, password);

  if (await loginPage.isLoginFailureVisible()) {
    await registerPage.registerCustomer({
      firstName: 'Auto',
      lastName: 'Tester',
      email,
      telephone: '1234567890',
      password,
    });
  }
  await accountPage.logout();
}

test.describe('OpenCart web automation @web @opencart', () => {
  test.beforeEach(async ({ homePage }) => {
    await homePage.openHome();
  });

  test('User registration flow @smoke @registration', async ({ homePage, page, registerPage, successPage }) => {
    const customer: CustomerDetails = {
      firstName: RandomDataUtil.getFirstName(),
      lastName: RandomDataUtil.getLastName(),
      email: `auto-${Date.now()}-${RandomDataUtil.getUsername()}@example.com`,
      telephone: '1234567890',
      password: 'Test@1234',
    };

    await homePage.goToMyAccountMenu('Register');
    await registerPage.registerCustomer(customer);

    await expect(page).toHaveURL(/route=account\/success/);
    expect(await successPage.isRegistrationSuccessful()).toBeTruthy();
    await expect(page.getByRole('link', { name: 'Logout' }).first()).toBeVisible();
  });

  test('Valid login flow @smoke @login', async ({ accountPage, loginPage, page, registerPage }) => {
    const validLogin = dataRows.find((row) => row.expected === 'success') ?? dataRows[0];
    await ensureCustomerExists(validLogin.email, validLogin.password, loginPage, registerPage, accountPage);
    await loginPage.open();
    await loginPage.login(validLogin.email, validLogin.password);

    expect(await accountPage.isAuthenticated()).toBeTruthy();
    await expect(page.getByRole('heading', { name: 'My Account' }).first()).toBeVisible();
  });

  test('Invalid login flow @negative @login', async ({ loginPage, page }) => {
    const invalidLogin = dataRows.find((row) => row.expected === 'failure') ?? {
      testName: 'Invalid login',
      email: 'invalid@example.com',
      password: 'wrongpass',
      expected: 'failure' as const,
    };

    await loginPage.open();
    await loginPage.login(invalidLogin.email, invalidLogin.password);

    expect(await loginPage.isLoginFailureVisible()).toBeTruthy();
    await expect(page).toHaveURL(/route=account\/login/);
    await expect(page.getByRole('link', { name: 'Logout' })).toHaveCount(0);
  });

  test('Logout flow @smoke @logout', async ({
    accountPage,
    loginPage,
    logoutPage,
    page,
    registerPage,
  }) => {
    const validLogin = dataRows.find((row) => row.expected === 'success') ?? dataRows[0];
    await ensureCustomerExists(validLogin.email, validLogin.password, loginPage, registerPage, accountPage);
    await loginPage.open();
    await loginPage.login(validLogin.email, validLogin.password);
    expect(await accountPage.isAuthenticated()).toBeTruthy();

    await accountPage.logout();
    expect(await logoutPage.isLoggedOut()).toBeTruthy();
    await logoutPage.continueToHome();

    await expect(page.getByRole('link', { name: 'Login' }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: 'Register' }).first()).toBeVisible();
  });

  test('Product search flow @smoke @search', async ({ page, searchPage }) => {
    await searchPage.searchProduct('MacBook');

    await expect(page).toHaveURL(/route=product\/search/);
    expect(await searchPage.isProductSearchVisible('MacBook')).toBeTruthy();
  });

  test('Add product to cart @smoke @cart', async ({ cartPage, page, productPage, searchPage }) => {
    await searchPage.searchProduct('MacBook');
    await searchPage.openProductByName('MacBook');

    await expect(page.getByRole('heading', { name: 'MacBook' })).toBeVisible();
    await productPage.addProductToCart('MacBook', 2);
    await productPage.openCart();

    expect(await cartPage.isCartVisible()).toBeTruthy();
    const cartDetails = await cartPage.getCartDetails('MacBook');
    expect(cartDetails.name).toBe('MacBook');
    expect(cartDetails.quantity).toBe('2');
    expect(cartDetails.unitPrice).toBe('$602.00');
    expect(cartDetails.lineTotal).toBe('$1,204.00');
    expect(cartDetails.total).toBe('$1,204.00');
  });

  for (const [index, row] of dataRows.entries()) {
    const scenarioName = row.testName + (dataRows.filter((candidate) => candidate.testName === row.testName).length > 1 ? ` ${index + 1}` : '');

    test(`Login flow data-driven: ${scenarioName} @data @login`, async ({ loginPage, page }) => {
      await loginPage.open();
      await loginPage.login(row.email, row.password);

      if (row.expected === 'success') {
        await expect(page).toHaveURL(/route=account\/account/);
        await expect(page.getByRole('heading', { name: 'My Account' }).first()).toBeVisible();
      } else {
        expect(await loginPage.isLoginFailureVisible()).toBeTruthy();
        await expect(page).toHaveURL(/route=account\/login/);
      }
    });
  }
});
