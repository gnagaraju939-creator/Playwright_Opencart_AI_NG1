import { resolve } from 'node:path';
import { expect, test } from '../../fixtures/pageFixtures';
import type { AccountPage } from '../../pages/AccountPage';
import type { LoginPage } from '../../pages/LoginPage';
import type { CustomerDetails, RegisterPage } from '../../pages/RegisterPage';
import { DataProvider } from '../../utils/DataReader';
import { RandomDataUtil } from '../../utils/dataGenerator';

type LoginDataRow = {
  testName: string;
  email: string;
  password: string;
  expected: 'success' | 'failure';
};

const dataRows = DataProvider.readJson(
  resolve(__dirname, '../../testdata/opencart_logindata.json'),
) as LoginDataRow[];
const validLogin = dataRows.find((row) => row.expected === 'success');
const invalidLogin = dataRows.find((row) => row.expected === 'failure');
const loginFailureWarning = /Warning: (No match for E-Mail Address and\/or Password|Your account has exceeded allowed number of login attempts)/;

if (!validLogin || !invalidLogin) {
  throw new Error('Login test data must include at least one success row and one failure row.');
}

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
    await registerPage.open();
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

  test('User registration flow @master @sanity @registration @web', async ({
    homePage,
    page,
    registerPage,
    successPage,
  }) => {
    const customer: CustomerDetails = {
      firstName: RandomDataUtil.getFirstName(),
      lastName: RandomDataUtil.getLastName(),
      email: `auto-${Date.now()}-${RandomDataUtil.getUsername()}@example.com`,
      telephone: '1234567890',
      password: 'Test@1234',
    };

    await test.step('1) Navigate to My Account and open Register', async () => {
      await homePage.goToMyAccountMenu('Register');
    });

    await test.step('2) Verify the registration page is displayed', async () => {
      expect(await registerPage.isRegistrationPageVisible()).toBeTruthy();
    });

    await test.step('3) Submit a new customer registration', async () => {
      await registerPage.registerCustomer(customer);
    });

    await test.step('4) Verify registration confirmation and account navigation', async () => {
      await expect(page).toHaveURL(/route=account\/success/);
      expect(await successPage.isRegistrationSuccessful()).toBeTruthy();
      await expect(page.getByRole('link', { name: 'Logout' }).first()).toBeVisible();
    });

    console.log('Completed the customer registration flow.');
  });

  test('Valid login flow @master @sanity @login @web', async ({
    accountPage,
    homePage,
    loginPage,
    page,
    registerPage,
  }) => {
    await ensureCustomerExists(validLogin.email, validLogin.password, loginPage, registerPage, accountPage);

    await test.step('1) Navigate to My Account and open Login', async () => {
      await homePage.goToMyAccountMenu('Login');
      await expect(page).toHaveURL(/route=account\/login/);
    });

    await test.step('2) Log in with configured valid credentials', async () => {
      await loginPage.login(validLogin.email, validLogin.password);
    });

    await test.step('3) Verify authenticated My Account page', async () => {
      await expect(page).toHaveURL(/route=account\/account/);
      expect(await accountPage.isAuthenticated()).toBeTruthy();
      await expect(page.getByRole('heading', { name: 'My Account' }).first()).toBeVisible();
    });

    console.log('Completed the valid login flow.');
  });

  test('Invalid login flow @master @regression @login @web', async ({ homePage, loginPage, page }) => {
    await test.step('1) Navigate to My Account and open Login', async () => {
      await homePage.goToMyAccountMenu('Login');
      await expect(page).toHaveURL(/route=account\/login/);
    });

    await test.step('2) Submit configured invalid credentials', async () => {
      await loginPage.login(invalidLogin.email, invalidLogin.password);
    });

    await test.step('3) Verify authentication failure and warning', async () => {
      await expect(page.getByText(loginFailureWarning)).toBeVisible();
      await expect(page).toHaveURL(/route=account\/login/);
      await expect(page.getByRole('link', { name: 'Logout' })).toHaveCount(0);
    });

    console.log('Completed the invalid login flow.');
  });

  test('Logout flow @master @sanity @logout @web', async ({
    accountPage,
    homePage,
    loginPage,
    logoutPage,
    page,
    registerPage,
  }) => {
    await ensureCustomerExists(validLogin.email, validLogin.password, loginPage, registerPage, accountPage);

    await test.step('1) Log in with configured valid credentials', async () => {
      await homePage.goToMyAccountMenu('Login');
      await loginPage.login(validLogin.email, validLogin.password);
      expect(await accountPage.isAuthenticated()).toBeTruthy();
    });

    await test.step('2) Log out and verify the confirmation page', async () => {
      await accountPage.logout();
      expect(await logoutPage.isLoggedOut()).toBeTruthy();
    });

    await test.step('3) Continue to the homepage and verify logged-out navigation', async () => {
      await logoutPage.continueToHome();
      await expect(page).toHaveURL(/route=common\/home/);
      await homePage.goToMyAccountMenu('Login');
      await expect(page).toHaveURL(/route=account\/login/);
      await expect(page.getByRole('link', { name: 'Register' }).first()).toBeVisible();
    });

    console.log('Completed the logout flow.');
  });

  test('Product search flow @master @sanity @search @web', async ({ page, searchPage }) => {
    await test.step('1) Search for the known MacBook product', async () => {
      await searchPage.searchProduct('MacBook');
    });

    await test.step('2) Verify the matching product appears in search results', async () => {
      await expect(page).toHaveURL(/route=product\/search/);
      expect(await searchPage.isProductSearchVisible('MacBook')).toBeTruthy();
      await expect(page.getByRole('link', { name: 'MacBook', exact: true }).first()).toBeVisible();
    });

    console.log('Completed the product search flow.');
  });

  test('Add product to cart @master @sanity @cart @web', async ({ cartPage, page, productPage, searchPage }) => {
    await test.step('1) Search for MacBook and open its product details', async () => {
      await searchPage.searchProduct('MacBook');
      await searchPage.openProductByName('MacBook');
      await expect(page.getByRole('heading', { name: 'MacBook' })).toBeVisible();
    });

    await test.step('2) Add quantity two and verify confirmation', async () => {
      await productPage.addProductToCart('MacBook', 2);
    });

    await test.step('3) Verify product and quantity in the shopping cart', async () => {
      await productPage.openCart();
      expect(await cartPage.isCartVisible()).toBeTruthy();
      const cartDetails = await cartPage.getCartDetails('MacBook');
      expect(cartDetails.name).toBe('MacBook');
      expect(cartDetails.quantity).toBe('2');
      expect(cartDetails.unitPrice).toBe('$602.00');
      expect(cartDetails.lineTotal).toBe('$1,204.00');
      expect(cartDetails.total).toBe('$1,204.00');
    });

    console.log('Completed the add-to-cart flow.');
  });

  for (const [index, row] of dataRows.entries()) {
    test(`Login flow data-driven: ${row.testName} [${index + 1}] @master @regression @datadriven @login @web`, async ({
      loginPage,
      page,
    }) => {
      await test.step('1) Open the login page and submit the supplied data row', async () => {
        await loginPage.open();
        await loginPage.login(row.email, row.password);
      });

      await test.step('2) Verify the result matches the expected outcome', async () => {
        if (row.expected === 'success') {
          await expect(page).toHaveURL(/route=account\/account/);
          await expect(page.getByRole('heading', { name: 'My Account' }).first()).toBeVisible();
        } else {
          await expect(page).toHaveURL(/route=account\/login/);
          await expect(page.getByText(loginFailureWarning)).toBeVisible();
        }
      });

      console.log(`Completed data-driven login case: ${row.testName}.`);
    });
  }
});
