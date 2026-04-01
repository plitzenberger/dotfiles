---
name: playwright
description: |
  Browser automation and E2E testing with Playwright. Two modes:
  (1) Interactive browser automation via `playwright-cli` — navigate pages, click elements,
  fill forms, take screenshots, scrape data, manage sessions, mock network requests.
  (2) E2E test authoring with `@playwright/test` — write .spec.ts files, configure
  playwright.config.ts, use locators/assertions, fixtures, POM, authentication, CI.
  Use when the user wants to: automate a browser, interact with web pages, fill forms,
  take screenshots, scrape websites, extract page data, write E2E tests, debug failing tests,
  set up Playwright config, create page objects, mock APIs in tests, run visual regression,
  set up CI for Playwright, or shard tests.
  Also trigger on: "open a browser", "click this element", "take a screenshot",
  "write a test", "add e2e tests", "playwright config", "test this page",
  "page object", "test fixture", ".spec.ts", "playwright-cli".
  Do NOT use for Cypress, Selenium, Puppeteer, or non-Playwright frameworks.
  Do NOT use for general web scraping without browser interaction (use firecrawl instead).
allowed-tools: Bash(playwright-cli:*), Bash(npx playwright *)
---

# Playwright: Browser Automation & E2E Testing

Playwright provides two complementary workflows:

| Mode | Tool | When |
|------|------|------|
| **Interactive automation** | `playwright-cli` | Navigate, click, fill, screenshot, scrape — real-time browser control |
| **E2E test authoring** | `@playwright/test` | Write resilient `.spec.ts` tests with assertions, fixtures, CI |

---

## Mode 1: Interactive Browser Automation (`playwright-cli`)

### Quick Start

```bash
playwright-cli open https://example.com          # headless (default)
playwright-cli open https://example.com --headed  # visible browser window
playwright-cli snapshot                           # get element refs
playwright-cli click e3                           # interact by ref
playwright-cli fill e5 "user@example.com"
playwright-cli screenshot --filename=result.png
playwright-cli close
```

### Snapshots Are Your Eyes

After every command, `playwright-cli` returns a YAML snapshot with element refs (`e1`, `e2`, etc.). Always read the snapshot to find the right ref before interacting.

```bash
playwright-cli snapshot
# Output: e1 [textbox "Email"], e2 [textbox "Password"], e3 [button "Sign In"]
playwright-cli fill e1 "user@example.com"
```

### Command Reference

**Core**
```bash
playwright-cli open [url]              # open browser (add --headed for visible)
playwright-cli goto <url>              # navigate
playwright-cli click <ref>             # click element
playwright-cli dblclick <ref>          # double-click
playwright-cli fill <ref> <text>       # fill input
playwright-cli type <text>             # type into focused element
playwright-cli select <ref> <value>    # select dropdown option
playwright-cli check <ref>             # check checkbox/radio
playwright-cli uncheck <ref>           # uncheck
playwright-cli hover <ref>             # hover
playwright-cli drag <startRef> <endRef>
playwright-cli upload <file>
playwright-cli snapshot                # capture page state
playwright-cli eval <func> [ref]       # run JS
playwright-cli resize <w> <h>
playwright-cli close
```

**Navigation**: `go-back`, `go-forward`, `reload`

**Keyboard**: `press Enter`, `press ArrowDown`, `keydown Shift`, `keyup Shift`

**Mouse**: `mousemove <x> <y>`, `mousedown`, `mouseup`, `mousewheel <dx> <dy>`

**Screenshots & PDF**: `screenshot [ref]`, `screenshot --filename=page.png`, `pdf --filename=page.pdf`

**Tabs**: `tab-list`, `tab-new [url]`, `tab-close [index]`, `tab-select <index>`

**Dialogs**: `dialog-accept [text]`, `dialog-dismiss`

### Open Options

```bash
playwright-cli open --browser=chrome|firefox|webkit|msedge
playwright-cli open --headed              # visible browser
playwright-cli open --persistent          # persist profile to disk
playwright-cli open --profile=/path       # custom profile directory
playwright-cli open --config=config.json  # config file
playwright-cli open --extension           # connect via browser extension
```

### Sessions, Storage, Network, DevTools

For detailed reference on these topics, see:

- **Browser sessions** — [references/sessions-and-storage.md](references/sessions-and-storage.md)
- **Cookies, localStorage, sessionStorage** — [references/sessions-and-storage.md](references/sessions-and-storage.md)
- **Network mocking (CLI)** — [references/network-and-devtools.md](references/network-and-devtools.md)
- **DevTools, tracing, video** — [references/network-and-devtools.md](references/network-and-devtools.md)
- **Running custom Playwright code** — [references/network-and-devtools.md](references/network-and-devtools.md)
- **Test generation from CLI interactions** — [references/test-generation.md](references/test-generation.md)

---

## Mode 2: E2E Test Authoring (`@playwright/test`)

### Core Principles

1. **Test user-visible behavior** — use role/text locators, not CSS classes
2. **Keep tests isolated** — each test gets its own browser context
3. **Use web-first assertions** — `await expect(locator).toBeVisible()` (auto-retrying)
4. **No hard-coded waits** — rely on auto-waiting
5. **Mock third-party deps** — only test what you control

### Write a Test

```typescript
import { test, expect } from '@playwright/test';

test('user can log in', async ({ page }) => {
  await page.goto('/login');
  await page.getByLabel('Email').fill('user@example.com');
  await page.getByLabel('Password').fill('secret');
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/.*dashboard/);
  await expect(page.getByRole('heading', { name: 'Welcome' })).toBeVisible();
});
```

### Run Tests

```bash
npx playwright test                        # all tests
npx playwright test login.spec.ts          # specific file
npx playwright test --project=chromium     # specific browser
npx playwright test --reporter=list        # terminal output (agent-safe)
npx playwright test --trace on             # capture traces
npx playwright test --headed               # visible browser
```

### Locator Priority (most → least resilient)

```typescript
// ✅ Best — role-based
page.getByRole('button', { name: 'Submit' });
page.getByRole('heading', { name: 'Dashboard' });

// ✅ Good — user-facing text
page.getByLabel('Email address');
page.getByPlaceholder('Search...');
page.getByText('Welcome back');

// ✅ Acceptable — test IDs
page.getByTestId('checkout-button');

// ❌ Avoid — brittle selectors
page.locator('.btn-primary');
```

### Assertions (Always `await`)

```typescript
await expect(page).toHaveURL(/.*dashboard/);
await expect(locator).toBeVisible();
await expect(locator).toHaveText('Hello');
await expect(locator).toContainText('ello');
await expect(page.getByRole('listitem')).toHaveCount(3);
```

### Detailed References

- **Config** — [references/configuration.md](references/configuration.md)
- **Locators & Assertions** — [references/locators-and-assertions.md](references/locators-and-assertions.md)
- **Fixtures & POM** — [references/fixtures-and-pom.md](references/fixtures-and-pom.md)
- **Authentication** — [references/authentication.md](references/authentication.md)
- **Network mocking (tests)** — [references/network-mocking.md](references/network-mocking.md)
- **CI & Debugging** — [references/ci-and-debugging.md](references/ci-and-debugging.md)

---

## Rules

### Both Modes
- Always `playwright-cli close` or `playwright-cli close-all` when done with browser sessions
- Never leave zombie browser processes — use `playwright-cli kill-all` if needed
- Add `.playwright-cli/` to `.gitignore`

### Interactive Automation (`playwright-cli`)
- Always take a `snapshot` first to discover element refs before clicking/filling
- Use `--headed` when you need to visually verify behavior
- Default is headless — faster and sufficient for most automation
- Use `--filename=` for screenshots/snapshots that are workflow outputs
- Use named sessions (`-s=name`) to run multiple browsers concurrently

### E2E Tests (`@playwright/test`)
- Always use TypeScript (`.spec.ts`)
- Always `await` assertions — `await expect(...)` not `expect(await ...)`
- Always prefer `getByRole` > `getByLabel` > `getByText` > `getByTestId` > `locator()`
- Do NOT use `page.waitForTimeout()` — use auto-waiting or specific wait conditions
- Do NOT share state between tests — each test must work in isolation
- Do NOT run `npx playwright show-report`, `--ui`, `--debug`, or `show-trace` — these start blocking GUIs that hang agents. Use `--reporter=list` for all test runs

### Workflow: CLI → Test Generation
Use `playwright-cli` to explore a page interactively, then convert the generated Playwright code into a proper `.spec.ts` test with assertions. See [references/test-generation.md](references/test-generation.md).

## Verification

1. **CLI**: `playwright-cli snapshot` returns valid YAML with element refs
2. **Tests**: `npx playwright test --reporter=list` passes across configured browsers
3. No hard-coded waits in test code
4. Locators use role/text/label, not CSS classes
5. Browser sessions are closed after use
