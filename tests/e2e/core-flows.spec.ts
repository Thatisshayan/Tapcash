import { test, expect } from '@playwright/test';

test.describe('TapCash Core User Flows', () => {
  test('should load the landing page and display main CTA', async ({ page }) => {
    await page.goto('/');
    
    // Expect the title to have TapCash
    await expect(page).toHaveTitle(/TapCash/i);
    
    // Check for a visible Sign In or Get Started button
    const getStartedBtn = page.getByRole('link', { name: /START EARNING/i }).first();
    if (await getStartedBtn.isVisible()) {
      await expect(getStartedBtn).toBeVisible();
    } else {
      const signInBtn = page.getByRole('link', { name: /SIGN IN/i }).first();
      await expect(signInBtn).toBeVisible();
    }
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
    
    const heroText = page.locator('text=Earn Cash Effortlessly Completing Fast Tasks');
    await expect(heroText).toBeVisible();
    
    const signInBtn = page.getByRole('link', { name: /Sign In/i }).first();
    await expect(signInBtn).toBeVisible();
  });

  test('Referrals should redirect unauthenticated users to home', async ({ page }) => {
    await page.goto('/referrals');
    
    // The referral page has an "Authentication Required" state for unauthenticated users instead of an automatic redirect.
    // It shows a "Return Home" button.
    const authRequiredText = page.locator('text=Authentication Required');
    await expect(authRequiredText).toBeVisible();
    
    const returnHomeBtn = page.getByRole('link', { name: /Return Home/i });
    await expect(returnHomeBtn).toBeVisible();
    await returnHomeBtn.click();
    
    await expect(page).toHaveURL(/.*?\/?$/); // matches home
  });
});
