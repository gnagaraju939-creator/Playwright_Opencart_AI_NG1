import type { Locator, Page } from '@playwright/test';

export class ProductPage {
  private readonly page: Page;

  // Locators
  private readonly productPrice: Locator;
  private readonly quantityInput: Locator;
  private readonly addToCartButton: Locator;
  private readonly cartLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.productPrice = page.getByRole('heading', { level: 2 });
    this.quantityInput = page.locator('#input-quantity');
    this.addToCartButton = page.locator('#button-cart');
    this.cartLink = page.locator('a[href*="route=checkout/cart"]').first();
  }

  /**
   * Checks whether the requested product details are displayed.
   * @param productName - Expected product
   * @returns Promise<boolean> - true when the product heading is visible
   */
  async isProductDetailsVisible(productName: string): Promise<boolean> {
    return this.page.getByRole('heading', { name: productName, exact: true, level: 1 }).isVisible();
  }

  /**
   * Reads the displayed product price.
   * @returns Promise<string> - Product price including currency formatting
   */
  async getProductPrice(): Promise<string> {
    return (await this.productPrice.innerText()).trim();
  }

  /**
   * Adds the requested product and waits for OpenCart's success confirmation.
   * @param productName - Product expected in the confirmation message
   * @param quantity - Quantity to add
   */
  async addProductToCart(productName: string, quantity = 1): Promise<void> {
    await this.quantityInput.fill(String(quantity));
    await this.addToCartButton.click();
    await this.page.getByText(
      `Success: You have added ${productName} to your shopping cart!`,
      { exact: false },
    ).waitFor({ state: 'visible' });
  }

  /**
   * Opens the shopping cart from the storefront header.
   */
  async openCart(): Promise<void> {
    await this.cartLink.click();
  }
}
