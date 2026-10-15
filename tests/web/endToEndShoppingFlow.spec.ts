import { expect, test } from '../../fixtures/pageFixtures';
import type { CustomerDetails } from '../../pages/RegisterPage';
import { RandomDataUtil } from '../../utils/dataGenerator';
import { Helper } from '../../utils/helper';

test('End-to-end shopping flow @master @sanity @regression @web @end-to-end', async ({
  accountPage,
  cartPage,
  homePage,
  loginPage,
  logoutPage,
  page,
  productPage,
  registerPage,
  searchPage,
  successPage,
}) => {
  const customer: CustomerDetails = {
    firstName: RandomDataUtil.getFirstName(),
    lastName: RandomDataUtil.getLastName(),
    email: `journey-${Date.now()}-${RandomDataUtil.getUsername()}@example.com`,
    telephone: '9876543210',
    password: 'Journey@123',
  };
  const product = Helper.getProductDetails();
  const quantity = Number(product.productQuantity);
  const pageErrors: string[] = [];
  let productPrice = '';

  page.on('pageerror', (error) => pageErrors.push(error.message));

  await test.step('1) Open the application', async () => {
    await homePage.openHome();
    await expect(await homePage.getPageTitle()).toBe('Your Store');
  });

  await test.step('2) Register a new customer with unique data', async () => {
    await registerPage.registerCustomer(customer);
  });

  await test.step('3) Verify successful registration', async () => {
    expect(await successPage.isRegistrationSuccessful()).toBeTruthy();
  });

  await test.step('4) Log out', async () => {
    await accountPage.logout();
    expect(await logoutPage.isLoggedOut()).toBeTruthy();
  });

  await test.step('5) Log in with the new customer credentials', async () => {
    await loginPage.open();
    await loginPage.login(customer.email, customer.password);
  });

  await test.step('6) Verify successful authentication', async () => {
    expect(await accountPage.isAuthenticated()).toBeTruthy();
  });

  await test.step('7) Search for the known product', async () => {
    await searchPage.searchProduct(product.productName);
    expect(await searchPage.isProductSearchVisible(product.productName)).toBeTruthy();
  });

  await test.step('8) Open the product details page', async () => {
    await searchPage.openProductByName(product.productName);
    expect(await productPage.isProductDetailsVisible(product.productName)).toBeTruthy();
    productPrice = await productPage.getProductPrice();
    expect(productPrice).toBe(product.totalPrice);
  });

  await test.step('9) Add the product to the cart', async () => {
    await productPage.addProductToCart(product.productName, quantity);
  });

  await test.step('10) Open the shopping cart', async () => {
    await productPage.openCart();
    expect(await cartPage.isCartVisible()).toBeTruthy();
  });

  await test.step('11) Verify the correct product is in the cart', async () => {
    const cartDetails = await cartPage.getCartDetails(product.productName);
    expect(cartDetails.name).toBe(product.productName);
  });

  await test.step('12) Verify the product quantity', async () => {
    const cartDetails = await cartPage.getCartDetails(product.productName);
    expect(cartDetails.quantity).toBe(String(quantity));
  });

  await test.step('13) Verify the product price', async () => {
    const cartDetails = await cartPage.getCartDetails(product.productName);
    expect(cartDetails.unitPrice).toBe(productPrice);
    expect(cartDetails.lineTotal).toBe(productPrice);
  });

  await test.step('14) Verify the applicable cart total', async () => {
    const cartDetails = await cartPage.getCartDetails(product.productName);
    expect(cartDetails.total).toBe(product.totalPrice);
  });

  await test.step('15) Verify the journey completes without page errors', async () => {
    expect(pageErrors).toEqual([]);
  });

  console.log('✅ Completed the end-to-end shopping journey successfully.');
});
