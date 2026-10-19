import type { Locator, Page } from '@playwright/test';

export class LoginPage {
  private readonly page: Page;

  // Locators
  private readonly emailInput: Locator;
  private readonly passwordInput: Locator;
  private readonly submitButton: Locator;
  private readonly failureWarning: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.emailInput = page.locator('#input-email');
    this.passwordInput = page.locator('#input-password');
    this.submitButton = page.locator('input[type="submit"]');
    this.failureWarning = page.getByText('Warning: No match for E-Mail Address and/or Password.');
  }

  /**
   * Opens the customer login page.
   */
  async open(): Promise<void> {
    await this.page.goto('http://localhost/opencart/upload/index.php?route=account/login');
  }

  /**
   * Fills and submits the login form.
   * @param email - Customer email
   * @param password - Customer password
   */
  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email.trim() ? email : '');
    await this.passwordInput.fill(password.trim() ? password : '');
    await this.submitButton.click();
  }

  /**
   * Checks for the invalid-credentials warning.
   * @returns Promise<boolean> - true when the warning is visible
   */
  async isLoginFailureVisible(): Promise<boolean> {
    return this.failureWarning.isVisible();
  }
}
