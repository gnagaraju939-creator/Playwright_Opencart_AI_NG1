import type { Locator, Page } from '@playwright/test';

export type CartDetails = {
  name: string;
  quantity: string;
  unitPrice: string;
  lineTotal: string;
  total: string;
};

export class CartPage {
  private readonly page: Page;

  // Locators
  private readonly cartHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.cartHeading = page.getByRole('heading', { name: /Shopping Cart/ });
  }

  /**
   * Checks whether the shopping cart page is displayed.
   * @returns Promise<boolean> - true when the shopping cart heading is visible
   */
  async isCartVisible(): Promise<boolean> {
    return this.cartHeading.isVisible();
  }

  /**
   * Reads product and total details from the shopping cart.
   * @param productName - Product expected in the cart
   * @returns Promise<CartDetails> - Product and cart pricing details
   */
  async getCartDetails(productName: string): Promise<CartDetails> {
    const productRow = this.page.getByRole('row').filter({
      has: this.page.getByRole('link', { name: productName, exact: true }),
    });
    const cells = productRow.getByRole('cell');
    const totalRow = this.page.getByRole('row').filter({
      has: this.page.getByText('Total:', { exact: true }),
    });

    return {
      name: (await productRow.getByRole('link', { name: productName, exact: true }).last().innerText()).trim(),
      quantity: await productRow.getByRole('textbox').inputValue(),
      unitPrice: (await cells.nth(4).innerText()).trim(),
      lineTotal: (await cells.nth(5).innerText()).trim(),
      total: (await totalRow.getByRole('cell').last().innerText()).trim(),
    };
  }
}
