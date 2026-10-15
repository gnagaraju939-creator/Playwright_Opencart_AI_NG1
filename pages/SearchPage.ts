import type { Locator, Page } from '@playwright/test';

export class SearchPage {
  private readonly page: Page;

  // Locators
  private readonly searchInput: Locator;
  private readonly searchButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.searchInput = page.locator('input[name="search"]').first();
    this.searchButton = page.locator('button.btn.btn-default.btn-lg');
  }

  /**
   * Searches the storefront for a product.
   * @param productName - Product to search for
   */
  async searchProduct(productName: string): Promise<void> {
    await this.searchInput.fill(productName);
    await this.searchButton.click();
  }

  /**
   * Checks whether the expected product is displayed in search results.
   * @param productName - Product used in the search
   * @returns Promise<boolean> - true when the search heading and product link are visible
   */
  async isProductSearchVisible(productName: string): Promise<boolean> {
    return this.page.url().includes('route=product/search')
      && await this.page.getByRole('heading', { name: `Search - ${productName}` }).isVisible()
      && await this.page.getByRole('link', { name: productName, exact: true }).first().isVisible();
  }

  /**
   * Opens the matching product details page.
   * @param productName - Product to open
   */
  async openProductByName(productName: string): Promise<void> {
    await this.page.getByRole('link', { name: productName, exact: true }).first().click();
  }
}
