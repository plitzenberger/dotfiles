# Network Mocking in Tests

## Basic Route Interception

```typescript
import { test, expect } from '@playwright/test';

test('displays mocked data', async ({ page }) => {
  // Mock API before navigation
  await page.route('**/api/users', route =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify([
        { id: 1, name: 'Alice' },
        { id: 2, name: 'Bob' },
      ]),
    })
  );

  await page.goto('/users');
  await expect(page.getByRole('listitem')).toHaveCount(2);
});
```

## URL Patterns

```typescript
'**/api/users'             // matches any origin, path /api/users
'**/api/users?page=*'      // matches with query params
'**/api/users/**'           // matches any subpath
'https://api.example.com/**' // specific origin
```

## Modify Real Responses

Fetch the real response, then modify it:

```typescript
test('shows premium features', async ({ page }) => {
  await page.route('**/api/user/profile', async route => {
    const response = await route.fetch();
    const json = await response.json();
    json.isPremium = true;
    await route.fulfill({ response, json });
  });

  await page.goto('/profile');
  await expect(page.getByText('Premium Member')).toBeVisible();
});
```

## Simulate Errors

```typescript
test('handles server error', async ({ page }) => {
  await page.route('**/api/data', route =>
    route.fulfill({
      status: 500,
      contentType: 'application/json',
      body: JSON.stringify({ error: 'Internal Server Error' }),
    })
  );

  await page.goto('/dashboard');
  await expect(page.getByText('Something went wrong')).toBeVisible();
});

test('handles network failure', async ({ page }) => {
  await page.route('**/api/data', route => route.abort('internetdisconnected'));

  await page.goto('/dashboard');
  await expect(page.getByText('Network error')).toBeVisible();
});
```

Abort reasons: `connectionrefused`, `timedout`, `connectionreset`, `internetdisconnected`

## Simulate Slow Responses

```typescript
test('shows loading state', async ({ page }) => {
  await page.route('**/api/data', async route => {
    await new Promise(resolve => setTimeout(resolve, 3000));
    await route.fulfill({
      status: 200,
      body: JSON.stringify({ items: [] }),
    });
  });

  await page.goto('/dashboard');
  await expect(page.getByText('Loading...')).toBeVisible();
});
```

## Conditional Mocking

```typescript
test('handles pagination', async ({ page }) => {
  let callCount = 0;

  await page.route('**/api/items*', route => {
    callCount++;
    const items = callCount === 1
      ? [{ id: 1, name: 'First' }]
      : [{ id: 2, name: 'Second' }];

    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ items, hasMore: callCount === 1 }),
    });
  });

  await page.goto('/items');
  await expect(page.getByText('First')).toBeVisible();
});
```

## Wait for API Response

```typescript
test('submits form', async ({ page }) => {
  await page.goto('/contact');
  await page.getByLabel('Message').fill('Hello');

  // Wait for the API call triggered by form submission
  const responsePromise = page.waitForResponse('**/api/contact');
  await page.getByRole('button', { name: 'Send' }).click();
  const response = await responsePromise;

  expect(response.status()).toBe(200);
  await expect(page.getByText('Message sent')).toBeVisible();
});
```

## Block Resources (Speed Up Tests)

```typescript
test('fast page load', async ({ page }) => {
  // Block images and fonts
  await page.route('**/*.{png,jpg,jpeg,gif,svg,woff,woff2}', route =>
    route.abort()
  );

  await page.goto('/heavy-page');
});
```

## HAR Recording (Record & Replay)

```typescript
// Record network to HAR file
test('record network', async ({ page }) => {
  await page.routeFromHAR('tests/data/api.har', { update: true });
  await page.goto('/dashboard');
  // Perform actions — network is recorded to api.har
});

// Replay from HAR file
test('replay from HAR', async ({ page }) => {
  await page.routeFromHAR('tests/data/api.har');
  await page.goto('/dashboard');
  // API responses come from the HAR file
});
```

## API Testing (No Browser)

```typescript
import { test, expect } from '@playwright/test';

test('API: create user', async ({ request }) => {
  const response = await request.post('/api/users', {
    data: { name: 'Alice', email: 'alice@example.com' },
  });

  expect(response.ok()).toBeTruthy();
  const user = await response.json();
  expect(user.name).toBe('Alice');
});

test('API: list users', async ({ request }) => {
  const response = await request.get('/api/users');
  expect(response.ok()).toBeTruthy();
  const users = await response.json();
  expect(users.length).toBeGreaterThan(0);
});
```
