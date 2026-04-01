# Authentication Patterns

## Strategy: Setup Project (Recommended)

Authenticate once in a setup file, save state, reuse across all tests.

### 1. Create Setup File

```typescript
// tests/auth.setup.ts
import { test as setup, expect } from '@playwright/test';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('password');
  await page.getByRole('button', { name: 'Sign in' }).click();

  // Wait for redirect after login
  await page.waitForURL('**/dashboard');
  await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();

  // Save signed-in state
  await page.context().storageState({ path: authFile });
});
```

### 2. Configure Projects

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    // Setup project — runs first
    { name: 'setup', testMatch: /.*\.setup\.ts/ },

    // Test projects — depend on setup
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
    {
      name: 'firefox',
      use: {
        ...devices['Desktop Firefox'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

### 3. Gitignore Auth State

```
# .gitignore
playwright/.auth/
```

## Multiple Roles

```typescript
// tests/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate as admin', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('admin@example.com');
  await page.getByLabel('Password').fill('admin-pass');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/admin');
  await page.context().storageState({ path: 'playwright/.auth/admin.json' });
});

setup('authenticate as user', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('user-pass');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await page.waitForURL('**/dashboard');
  await page.context().storageState({ path: 'playwright/.auth/user.json' });
});
```

```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'admin-tests',
      testMatch: /.*admin.*\.spec\.ts/,
      use: { storageState: 'playwright/.auth/admin.json' },
      dependencies: ['setup'],
    },
    {
      name: 'user-tests',
      testMatch: /.*user.*\.spec\.ts/,
      use: { storageState: 'playwright/.auth/user.json' },
      dependencies: ['setup'],
    },
  ],
});
```

## API-Based Authentication (Faster)

Skip the UI for login — call the API directly:

```typescript
// tests/auth.setup.ts
import { test as setup } from '@playwright/test';

setup('authenticate via API', async ({ request }) => {
  const response = await request.post('/api/auth/login', {
    data: {
      email: 'user@example.com',
      password: 'password',
    },
  });

  // Save state (cookies from API response are captured)
  await request.storageState({ path: 'playwright/.auth/user.json' });
});
```

## Unauthenticated Tests

Override storage state for tests that require no auth:

```typescript
test.describe('public pages', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading')).toContainText('Welcome');
  });
});
```

## Token-Based Auth (JWT)

When cookies aren't enough (e.g., `Authorization` header):

```typescript
// fixtures.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  authenticatedPage: async ({ browser }, use) => {
    const context = await browser.newContext({
      extraHTTPHeaders: {
        Authorization: `Bearer ${process.env.TEST_TOKEN}`,
      },
    });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});
```
