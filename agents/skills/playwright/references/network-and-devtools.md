# Network Mocking, DevTools & Custom Code (CLI)

## CLI Route Commands

```bash
# Mock with status
playwright-cli route "**/*.jpg" --status=404

# Mock with JSON body
playwright-cli route "**/api/users" --body='[{"id":1,"name":"Alice"}]' --content-type=application/json

# Mock with custom headers
playwright-cli route "**/api/data" --body='{"ok":true}' --header="X-Custom: value"

# Remove headers from requests
playwright-cli route "**/*" --remove-header=cookie,authorization

# Manage routes
playwright-cli route-list
playwright-cli unroute "**/*.jpg"
playwright-cli unroute                    # remove all routes
```

### URL Patterns

```
**/api/users           exact path
**/api/*/details       wildcard in path
**/*.{png,jpg,jpeg}    file extensions
**/search?q=*          query parameters
```

## Advanced Mocking with run-code

### Conditional Response

```bash
playwright-cli run-code "async page => {
  await page.route('**/api/login', route => {
    const body = route.request().postDataJSON();
    if (body.username === 'admin') {
      route.fulfill({ body: JSON.stringify({ token: 'mock-token' }) });
    } else {
      route.fulfill({ status: 401, body: JSON.stringify({ error: 'Invalid' }) });
    }
  });
}"
```

### Modify Real Response

```bash
playwright-cli run-code "async page => {
  await page.route('**/api/user', async route => {
    const response = await route.fetch();
    const json = await response.json();
    json.isPremium = true;
    await route.fulfill({ response, json });
  });
}"
```

### Simulate Network Failures

```bash
playwright-cli run-code "async page => {
  await page.route('**/api/offline', route => route.abort('internetdisconnected'));
}"
# Options: connectionrefused, timedout, connectionreset, internetdisconnected
```

### Delayed Response

```bash
playwright-cli run-code "async page => {
  await page.route('**/api/slow', async route => {
    await new Promise(r => setTimeout(r, 3000));
    route.fulfill({ body: JSON.stringify({ data: 'loaded' }) });
  });
}"
```

---

## Running Custom Playwright Code

Use `run-code` for advanced scenarios not covered by CLI commands:

```bash
playwright-cli run-code "async page => {
  // Full access to page and page.context()
}"
```

### Geolocation & Permissions

```bash
playwright-cli run-code "async page => {
  await page.context().grantPermissions(['geolocation']);
  await page.context().setGeolocation({ latitude: 37.7749, longitude: -122.4194 });
}"

playwright-cli run-code "async page => {
  await page.context().grantPermissions(['geolocation', 'notifications', 'camera', 'microphone']);
}"
```

### Media Emulation

```bash
playwright-cli run-code "async page => { await page.emulateMedia({ colorScheme: 'dark' }); }"
playwright-cli run-code "async page => { await page.emulateMedia({ reducedMotion: 'reduce' }); }"
playwright-cli run-code "async page => { await page.emulateMedia({ media: 'print' }); }"
```

### Wait Strategies

```bash
playwright-cli run-code "async page => { await page.waitForLoadState('networkidle'); }"
playwright-cli run-code "async page => { await page.waitForSelector('.loading', { state: 'hidden' }); }"
playwright-cli run-code "async page => { await page.waitForFunction(() => window.appReady === true); }"
```

### Frames & Iframes

```bash
playwright-cli run-code "async page => {
  const frame = page.locator('iframe#my-iframe').contentFrame();
  await frame.locator('button').click();
}"
```

### File Downloads

```bash
playwright-cli run-code "async page => {
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.click('a.download-link')
  ]);
  await download.saveAs('./downloaded-file.pdf');
  return download.suggestedFilename();
}"
```

### Error Handling

```bash
playwright-cli run-code "async page => {
  try {
    await page.click('.maybe-missing', { timeout: 1000 });
    return 'clicked';
  } catch (e) {
    return 'element not found';
  }
}"
```

---

## DevTools

```bash
playwright-cli console               # list console messages
playwright-cli console warning       # filter by level
playwright-cli network               # list network requests
playwright-cli show                  # open browser devtools
```

## Tracing

```bash
playwright-cli tracing-start
# ... perform actions ...
playwright-cli tracing-stop
```

Traces capture: actions, DOM snapshots, screenshots, network, console, timing.
Output goes to `traces/` directory with `.trace` and `.network` files.

## Video Recording

```bash
playwright-cli video-start
# ... perform actions ...
playwright-cli video-stop recording.webm
```

| Feature | Trace | Video | Screenshot |
|---------|-------|-------|------------|
| DOM inspection | Yes | No | No |
| Network details | Yes | No | No |
| Step-by-step | Yes | Continuous | Single |
| Best for | Debugging | Demos | Quick capture |
