# Locators and Assertions

## Locator Priority (most to least resilient)

### 1. Role-Based (Best)

```typescript
page.getByRole('button', { name: 'Submit' });
page.getByRole('heading', { name: 'Dashboard', level: 1 });
page.getByRole('link', { name: 'Learn more' });
page.getByRole('textbox', { name: 'Email' });
page.getByRole('checkbox', { name: 'Accept terms' });
page.getByRole('combobox', { name: 'Country' });
page.getByRole('listitem');
page.getByRole('navigation');
page.getByRole('dialog');
page.getByRole('tab', { name: 'Settings', selected: true });
```

### 2. Label/Placeholder/Text

```typescript
page.getByLabel('Email address');
page.getByPlaceholder('Search...');
page.getByText('Welcome back');
page.getByText('Welcome', { exact: true }); // exact match
page.getByAltText('Company logo');
page.getByTitle('Close dialog');
```

### 3. Test ID (Stable Contract)

```typescript
page.getByTestId('checkout-button');
// Requires data-testid attribute in HTML:
// <button data-testid="checkout-button">Buy</button>

// Customize attribute name in config:
// use: { testIdAttribute: 'data-pw' }
```

### 4. CSS/XPath (Last Resort)

```typescript
page.locator('css=button.primary');
page.locator('xpath=//button[@type="submit"]');
page.locator('button:has-text("Submit")');
```

## Chaining and Filtering

```typescript
// Chain: narrow down within a container
const form = page.getByRole('form', { name: 'Login' });
await form.getByLabel('Email').fill('user@example.com');
await form.getByRole('button', { name: 'Submit' }).click();

// Filter by text
const row = page.getByRole('row').filter({ hasText: 'John Doe' });
await row.getByRole('button', { name: 'Delete' }).click();

// Filter by child locator
page.getByRole('listitem').filter({
  has: page.getByRole('heading', { name: 'Product 1' }),
});

// Filter by NOT having
page.getByRole('listitem').filter({
  hasNot: page.getByText('Out of Stock'),
});

// Nth element
page.getByRole('listitem').nth(0);   // first
page.getByRole('listitem').first();
page.getByRole('listitem').last();
```

## Locator Actions

```typescript
await locator.click();
await locator.dblclick();
await locator.fill('text');
await locator.clear();
await locator.check();              // checkbox/radio
await locator.uncheck();
await locator.selectOption('value');
await locator.selectOption({ label: 'Option A' });
await locator.hover();
await locator.focus();
await locator.press('Enter');
await locator.setInputFiles('file.pdf');
await locator.setInputFiles([]);     // clear file input
await locator.dragTo(target);
await locator.scrollIntoViewIfNeeded();
```

## Web-First Assertions (Auto-Retrying)

Always use these — they wait and retry until timeout.

### Page Assertions

```typescript
await expect(page).toHaveURL(/.*dashboard/);
await expect(page).toHaveURL('https://example.com/dashboard');
await expect(page).toHaveTitle(/Dashboard/);
```

### Locator Assertions

```typescript
// Visibility
await expect(locator).toBeVisible();
await expect(locator).toBeHidden();
await expect(locator).toBeAttached();
await expect(locator).not.toBeVisible();

// Text
await expect(locator).toHaveText('Hello');
await expect(locator).toHaveText(/hello/i);
await expect(locator).toContainText('ello');

// Multiple elements
await expect(page.getByRole('listitem')).toHaveText(['A', 'B', 'C']);
await expect(page.getByRole('listitem')).toContainText(['A', 'B']);

// Attributes
await expect(locator).toHaveAttribute('href', '/about');
await expect(locator).toHaveClass(/active/);
await expect(locator).toHaveId('main-nav');

// Form state
await expect(locator).toBeEnabled();
await expect(locator).toBeDisabled();
await expect(locator).toBeChecked();
await expect(locator).toHaveValue('hello');
await expect(locator).toHaveValues(['a', 'b']); // multi-select

// Count
await expect(page.getByRole('listitem')).toHaveCount(3);

// CSS
await expect(locator).toHaveCSS('color', 'rgb(0, 0, 0)');

// Screenshots (visual comparison)
await expect(locator).toHaveScreenshot('component.png');
await expect(page).toHaveScreenshot('full-page.png');
```

### Soft Assertions

Continue test execution after failure:

```typescript
await expect.soft(page.getByTestId('status')).toHaveText('Success');
await expect.soft(page.getByTestId('count')).toHaveText('5');
// Test continues — all failures reported at end
```

### Negation

```typescript
await expect(locator).not.toBeVisible();
await expect(locator).not.toHaveText('Error');
```

### Custom Timeout

```typescript
await expect(locator).toBeVisible({ timeout: 10_000 });
```

## Anti-Patterns

```typescript
// ❌ Non-retrying assertion
expect(await locator.isVisible()).toBe(true);

// ✅ Web-first assertion (retries automatically)
await expect(locator).toBeVisible();

// ❌ Hard-coded wait
await page.waitForTimeout(2000);

// ✅ Wait for specific condition
await expect(page.getByText('Loaded')).toBeVisible();

// ❌ Brittle CSS selector
page.locator('.MuiButton-root.css-1abc2de');

// ✅ Role-based locator
page.getByRole('button', { name: 'Submit' });
```
