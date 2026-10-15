import type { Locator, Page } from '@playwright/test';

export type CustomerDetails = {
  firstName: string;
  lastName: string;
  email: string;
  telephone: string;
  password: string;
};

export class RegisterPage {
  private readonly page: Page;

  // Locators
  private readonly firstNameInput: Locator;
  private readonly lastNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly telephoneInput: Locator;
  private readonly passwordInput: Locator;
  private readonly passwordConfirmInput: Locator;
  private readonly privacyPolicyCheckbox: Locator;
  private readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Initialize locators with CSS selectors
    this.firstNameInput = page.locator('#input-firstname');
    this.lastNameInput = page.locator('#input-lastname');
    this.emailInput = page.locator('#input-email');
    this.telephoneInput = page.locator('#input-telephone');
    this.passwordInput = page.locator('#input-password');
    this.passwordConfirmInput = page.locator('#input-confirm');
    this.privacyPolicyCheckbox = page.locator('input[name="agree"]');
    this.submitButton = page.locator('input[type="submit"]');
  }

  /**
   * Opens the customer registration page.
   */
  async open(): Promise<void> {
    await this.page.goto('http://localhost/opencart/upload/index.php?route=account/register');
  }

  /**
   * Fills and submits the customer registration form.
   * @param details - New customer details
   */
  async registerCustomer(details: CustomerDetails): Promise<void> {
    await this.open();
    await this.firstNameInput.fill(details.firstName);
    await this.lastNameInput.fill(details.lastName);
    await this.emailInput.fill(details.email);
    await this.telephoneInput.fill(details.telephone);
    await this.passwordInput.fill(details.password);
    await this.passwordConfirmInput.fill(details.password);
    await this.privacyPolicyCheckbox.check();
    await this.submitButton.click();
  }
}
