import type { Locator, Page } from '@playwright/test';

export class AccountPage {
  private readonly page: Page;

  // Locators
  private readonly logoutLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.logoutLink = page.getByRole('link', { name: 'Logout', exact: true });
  }

  /**
   * Checks whether the customer is authenticated on the account page.
   * @returns Promise<boolean> - true when the account page and logout link are visible
   */
  async isAuthenticated(): Promise<boolean> {
    return this.page.url().includes('route=account/account')
      && await this.logoutLink.first().isVisible();
  }

  /**
   * Logs out the current customer.
   */
  async logout(): Promise<void> {
    await this.logoutLink.last().click();
  }
}
