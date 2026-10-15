import type { Locator, Page } from '@playwright/test';

export class SuccessPage {
  // Locators
  private readonly createdMessage: Locator;

  constructor(page: Page) {
    // Initialize locators with CSS selectors
    this.createdMessage = page.getByText('Your Account Has Been Created!');
  }

  /**
   * Checks whether customer registration succeeded.
   * @returns Promise<boolean> - true when the account-created message is visible
   */
  async isRegistrationSuccessful(): Promise<boolean> {
    return this.createdMessage.isVisible();
  }
}
