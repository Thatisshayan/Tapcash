import { test, expect } from '@playwright/test';

test.describe('TapCash Core User Flows', () => {
  test('should load the landing page and display main CTA', async ({ page }) => {
    await page.goto('/');
    
    await expect(page).toHaveTitle(/TapCash/i);
    
    const signUpBtn = page.getByRole('button', { name: /Sign Up Free/i }).first();
    await expect(signUpBtn).toBeVisible();
  });

  test('should have working navigation to policy pages', async ({ page }) => {
    await page.goto('/');
    
    const privacyLink = page.getByRole('link', { name: /Privacy Policy/i }).first();
    await privacyLink.click();
    
    await expect(page).toHaveURL(/.*privacy/);
    await expect(page.locator('h1').first()).toContainText(/Privacy/i);
  });
  
  test('Dashboard should show unauthenticated hero view for guests', async ({ page }) => {
    await page.goto('/dashboard');
    
    const heroText = page.locator('text=Sign in to open your dashboard');
    await expect(heroText).toBeVisible();
    
    const signInBtn = page.getByRole('link', { name: /Sign in/i }).first();
    await expect(signInBtn).toBeVisible();
  });

  test('Referrals should show access gate for unauthenticated users', async ({ page }) => {
    await page.goto('/referrals');
    
    const accessText = page.locator('text=Access Restricted');
    await expect(accessText).toBeVisible();
    
    const signInBtn = page.getByRole('link', { name: /Sign In Now/i });
    await expect(signInBtn).toBeVisible();
    await signInBtn.click();
    
    await expect(page).toHaveURL(/.*signin/);
  });
});
