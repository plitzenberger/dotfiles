# Playwright Configuration

## Basic Config

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,       // fail CI if test.only left in
  retries: process.env.CI ? 2 : 0,    // retry on CI only
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? 'blob' : 'list', // never 'html' — show-report blocks agents

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',          // capture trace on retry
    screenshot: 'only-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile viewports
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  // Start local dev server before tests
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

## Key Options

| Option | Description | Default |
|--------|-------------|---------|
| `testDir` | Directory containing test files | `./tests` |
| `testMatch` | Glob pattern for test files | `**/*.@(spec\|test).?(c\|m)[jt]s?(x)` |
| `fullyParallel` | Run tests in parallel across files | `false` |
| `workers` | Number of parallel workers | 50% of CPU cores |
| `retries` | Retry failed tests N times | `0` |
| `timeout` | Per-test timeout (ms) | `30000` |
| `expect.timeout` | Per-assertion timeout (ms) | `5000` |
| `forbidOnly` | Fail if `test.only` present | `false` |
| `reporter` | Reporter type(s) | `'list'` |

## use Options (Applied to All Tests)

| Option | Description |
|--------|-------------|
| `baseURL` | Base URL for `page.goto('/')` |
| `trace` | `'on'`, `'off'`, `'on-first-retry'`, `'retain-on-failure'` |
| `screenshot` | `'off'`, `'on'`, `'only-on-failure'` |
| `video` | `'off'`, `'on'`, `'on-first-retry'`, `'retain-on-failure'` |
| `headless` | Run in headless mode | `true` |
| `viewport` | `{ width: 1280, height: 720 }` |
| `storageState` | Path to storage state file (for auth) |
| `ignoreHTTPSErrors` | Ignore HTTPS errors | `false` |
| `locale` | Browser locale | `'en-US'` |
| `timezoneId` | Timezone | system default |
| `permissions` | Browser permissions (`['geolocation']`) |
| `colorScheme` | `'light'`, `'dark'`, `'no-preference'` |
| `extraHTTPHeaders` | Headers sent with every request |

## Reporters

```typescript
export default defineConfig({
  // Single reporter (non-blocking)
  reporter: 'list',

  // Multiple reporters — use open: 'never' if you include html
  reporter: [
    ['list'],
    ['html', { open: 'never' }], // open: 'never' prevents blocking server
    ['json', { outputFile: 'test-results.json' }],
    ['junit', { outputFile: 'results.xml' }],
  ],
});
```

## Web Server

```typescript
export default defineConfig({
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000, // 2 min startup
    stdout: 'pipe',
    stderr: 'pipe',
  },
});
```

Multiple servers:

```typescript
export default defineConfig({
  webServer: [
    { command: 'npm run dev', url: 'http://localhost:3000' },
    { command: 'npm run api', url: 'http://localhost:4000' },
  ],
});
```

## Projects with Dependencies (Setup)

```typescript
export default defineConfig({
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: 'playwright/.auth/user.json',
      },
      dependencies: ['setup'],
    },
  ],
});
```

## Environment Variables

```typescript
// Use dotenv or process.env
export default defineConfig({
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
  },
});
```

## Global Setup/Teardown

```typescript
export default defineConfig({
  globalSetup: require.resolve('./global-setup'),
  globalTeardown: require.resolve('./global-teardown'),
});
```
