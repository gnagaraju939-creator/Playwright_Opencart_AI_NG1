import type { Locator, Page } from '@playwright/test';

export class LogoutPage {
  private readonly page: Page;

  // Locators
  private readonly logoutHeading: Locator;
  private readonly continueLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.logoutHeading = page.getByRole('heading', { name: 'Account Logout' });
    this.continueLink = page.getByRole('link', { name: 'Continue' });
  }

  /**
   * Checks whether the account logout confirmation is displayed.
   * @returns Promise<boolean> - true when logout has completed
   */
  async isLoggedOut(): Promise<boolean> {
    return this.page.url().includes('route=account/logout')
      && await this.logoutHeading.isVisible();
  }

  /**
   * Continues from the logout confirmation page.
   */
  async continueToHome(): Promise<void> {
    await this.continueLink.click();
  }
}
