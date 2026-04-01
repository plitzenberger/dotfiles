# Test Generation: CLI → spec.ts

Every `playwright-cli` action generates corresponding Playwright TypeScript code in its output. Use this to bootstrap test files.

## Workflow

```bash
# 1. Explore the page
playwright-cli open https://example.com/login
playwright-cli snapshot
# Output: e1 [textbox "Email"], e2 [textbox "Password"], e3 [button "Sign In"]

# 2. Interact — each command shows generated code
playwright-cli fill e1 "user@example.com"
# Ran Playwright code:
# await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');

playwright-cli fill e2 "password123"
# Ran Playwright code:
# await page.getByRole('textbox', { name: 'Password' }).fill('password123');

playwright-cli click e3
# Ran Playwright code:
# await page.getByRole('button', { name: 'Sign In' }).click();

playwright-cli close
```

## 3. Assemble into a Test

Collect the generated code and add assertions:

```typescript
import { test, expect } from '@playwright/test';

test('login flow', async ({ page }) => {
  await page.goto('https://example.com/login');
  await page.getByRole('textbox', { name: 'Email' }).fill('user@example.com');
  await page.getByRole('textbox', { name: 'Password' }).fill('password123');
  await page.getByRole('button', { name: 'Sign In' }).click();

  // Add assertions manually — CLI doesn't generate these
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
```

## Tips

1. **Explore before recording** — take snapshots to understand page structure
2. **Generated locators are semantic** — `getByRole`, `getByLabel` (resilient, not CSS)
3. **Always add assertions** — CLI captures actions but not expectations
4. **Use `--headed`** to see what's happening while you explore
