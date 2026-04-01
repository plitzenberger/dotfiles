# CI Integration and Debugging

## GitHub Actions

```yaml
# .github/workflows/playwright.yml
name: Playwright Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium
        # Only install browsers you test against

      - name: Run Playwright tests
        run: npx playwright test

      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: playwright-report
          path: playwright-report/
          retention-days: 30
```

## Sharding (Parallel CI)

Split tests across multiple machines for faster CI:

```yaml
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false
      matrix:
        shard: [1/4, 2/4, 3/4, 4/4]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npx playwright test --shard=${{ matrix.shard }}
      - uses: actions/upload-artifact@v4
        if: ${{ !cancelled() }}
        with:
          name: blob-report-${{ strategy.job-index }}
          path: blob-report/
          retention-days: 1

  merge-reports:
    if: ${{ !cancelled() }}
    needs: [test]
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: lts/*
      - run: npm ci
      - uses: actions/download-artifact@v4
        with:
          path: all-blob-reports
          pattern: blob-report-*
          merge-multiple: true
      - run: npx playwright merge-reports --reporter html ./all-blob-reports
      - uses: actions/upload-artifact@v4
        with:
          name: html-report
          path: playwright-report/
          retention-days: 14
```

Config for sharding:

```typescript
// playwright.config.ts
export default defineConfig({
  reporter: process.env.CI ? 'blob' : 'html',
});
```

## Debugging Locally

> **⚠️ Agent-safe commands only.** The following commands start blocking servers or
> GUIs that will hang a non-interactive agent session. NEVER run them from an agent:
> - `npx playwright show-report` — starts HTTP server, waits for Ctrl+C
> - `npx playwright test --ui` — opens interactive UI, blocks
> - `npx playwright test --debug` — opens Playwright Inspector GUI, blocks
> - `npx playwright show-trace` — opens trace viewer GUI, blocks
>
> These are for **human developers only** (VS Code, terminal). Agents must use
> `--reporter=list` (or `line`, `dot`, `json`) for all test runs.

### Agent-Safe Test Runs

```bash
# Standard run with terminal output
npx playwright test --reporter=list

# JSON output for parsing
npx playwright test --reporter=json

# Capture traces (writes files, does NOT open viewer)
npx playwright test --trace on --reporter=list

# Headed mode (ok for agents that can handle browser windows)
npx playwright test --headed --reporter=list
```

### Verbose Logging

```bash
DEBUG=pw:api npx playwright test --reporter=list   # API call logs
DEBUG=pw:browser npx playwright test --reporter=list  # browser logs
```

### Human-Only Debugging (NOT for agents)

These commands are documented for human developers to use in their terminal/IDE:

```bash
# Step-through debugger (GUI — blocks)
npx playwright test --debug

# Interactive UI mode (GUI — blocks)
npx playwright test --ui

# View HTML report (HTTP server — blocks)
npx playwright show-report

# View trace file (GUI — blocks)
npx playwright show-trace test-results/trace.zip
```

### VS Code Extension

Install "Playwright Test for VS Code":
- Click play button next to tests to run
- Set breakpoints and debug with F5
- Pick locators from the browser
- View trace in editor

## Debugging on CI

### 1. Trace on First Retry (Default Strategy)

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0,
  use: {
    trace: 'on-first-retry',
  },
});
```

### 2. Always Capture Traces

For persistent flaky test debugging:

```typescript
use: {
  trace: 'retain-on-failure',  // keep trace only on failure
}
```

### 3. Screenshots on Failure

```typescript
use: {
  screenshot: 'only-on-failure',
}
```

### 4. Video on Failure

```typescript
use: {
  video: 'retain-on-failure',
}
```

## Handling Flaky Tests

### Retry Strategy

```typescript
// Global retries
export default defineConfig({
  retries: 2,
});

// Per-test retry
test('flaky network test', async ({ page }) => {
  test.info().annotations.push({ type: 'flaky', description: 'network dependent' });
  // ...
});
```

### Identify Flaky Tests

```bash
# Run tests multiple times to detect flakes
npx playwright test --repeat-each=5
```

### Tag and Skip

```typescript
test('experimental feature @flaky', async ({ page }) => {
  test.skip(process.env.CI === 'true', 'Skipping flaky test on CI');
  // ...
});

// Run only tagged tests
// npx playwright test --grep @smoke
// npx playwright test --grep-invert @flaky
```

## Performance Tips

- Install only needed browsers: `npx playwright install chromium --with-deps`
- Use `fullyParallel: true` in config
- Use sharding for large suites (4+ shards)
- Use `storageState` for auth (skip login UI)
- Block unnecessary resources (images, fonts) in tests where UI appearance doesn't matter
- Use `webServer.reuseExistingServer` locally
- Use Linux runners on CI (cheaper, faster)
