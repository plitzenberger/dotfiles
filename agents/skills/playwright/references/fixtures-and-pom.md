# Test Fixtures and Page Object Model

## Built-in Fixtures

```typescript
import { test, expect } from '@playwright/test';

test('example', async ({
  page,        // isolated Page instance
  context,     // isolated BrowserContext
  browser,     // shared Browser instance
  request,     // API request context (for REST calls)
}) => {
  // Each test gets a fresh page and context
});
```

## Test Organization

### Describe Blocks

```typescript
test.describe('Login page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('shows form fields', async ({ page }) => {
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
  });

  test('validates empty submission', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Email is required')).toBeVisible();
  });
});
```

### Hooks

```typescript
test.beforeAll(async () => {
  // Runs once before all tests in file (e.g., seed DB)
});

test.afterAll(async () => {
  // Runs once after all tests in file (e.g., cleanup)
});

test.beforeEach(async ({ page }) => {
  // Runs before each test (e.g., navigate to page)
});

test.afterEach(async ({ page }) => {
  // Runs after each test
});
```

### Parallel Within File

```typescript
test.describe('independent tests', () => {
  test.describe.configure({ mode: 'parallel' });

  test('test A', async ({ page }) => { /* ... */ });
  test('test B', async ({ page }) => { /* ... */ });
});
```

### Serial (Order Matters)

```typescript
test.describe('ordered flow', () => {
  test.describe.configure({ mode: 'serial' });

  test('step 1: create item', async ({ page }) => { /* ... */ });
  test('step 2: edit item', async ({ page }) => { /* ... */ });
  test('step 3: delete item', async ({ page }) => { /* ... */ });
});
```

## Custom Fixtures

Extend the base `test` with custom fixtures for reusable setup:

```typescript
// fixtures.ts
import { test as base, expect } from '@playwright/test';

type MyFixtures = {
  todoPage: TodoPage;
  apiClient: APIClient;
};

export const test = base.extend<MyFixtures>({
  todoPage: async ({ page }, use) => {
    const todoPage = new TodoPage(page);
    await todoPage.goto();
    await use(todoPage);  // test runs here
    // cleanup after test (optional)
  },

  apiClient: async ({ request }, use) => {
    const client = new APIClient(request);
    await use(client);
  },
});

export { expect };
```

Use in tests:

```typescript
// tests/todo.spec.ts
import { test, expect } from './fixtures';

test('can add todo', async ({ todoPage }) => {
  await todoPage.addItem('Buy groceries');
  await expect(todoPage.items).toHaveCount(1);
});
```

## Page Object Model (POM)

Encapsulate page interactions in classes. Keep locators and actions together.

### Basic POM

```typescript
// pages/login-page.ts
import { type Locator, type Page, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign in' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}
```

### POM in Tests

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/login-page';

test('successful login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('user@example.com', 'password');
  await expect(page).toHaveURL(/.*dashboard/);
});

test('invalid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('bad@example.com', 'wrong');
  await loginPage.expectError('Invalid credentials');
});
```

### POM + Custom Fixture (Best)

```typescript
// fixtures.ts
import { test as base } from '@playwright/test';
import { LoginPage } from './pages/login-page';
import { DashboardPage } from './pages/dashboard-page';

export const test = base.extend<{
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
}>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
});
```

## POM Guidelines

- Define locators in the constructor as `readonly` properties
- Use `getByRole`/`getByLabel` for locators, not CSS selectors
- Methods should represent **user actions** (e.g., `login()`, `addItem()`)
- Include assertion helpers for common checks (e.g., `expectError()`)
- Do NOT put test logic in POM — keep tests in spec files
- One POM per page or major component
