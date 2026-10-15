import type { Locator, Page } from '@playwright/test';

export class HomePage {
  private readonly page: Page;

  // Locators
  private readonly myAccountLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.myAccountLink = page.getByRole('link', { name: 'My Account' }).first();
  }

  /**
   * Opens the OpenCart storefront.
   */
  async openHome(): Promise<void> {
    await this.page.goto('http://localhost/opencart/upload/');
  }

  /**
   * Reads the current document title.
   * @returns Promise<string> - Current page title
   */
  async getPageTitle(): Promise<string> {
    return this.page.title();
  }

  /**
   * Opens an account page from the My Account menu.
   * @param option - Account page to open
   */
  async goToMyAccountMenu(option: 'Login' | 'Register'): Promise<void> {
    await this.myAccountLink.click();
    await this.page.getByRole('link', { name: option }).first().click();
  }
}
