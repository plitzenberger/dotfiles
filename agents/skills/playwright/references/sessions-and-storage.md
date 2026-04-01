# Browser Sessions & Storage Management

## Named Browser Sessions

Use `-s` flag to isolate browser contexts:

```bash
# Separate sessions with independent cookies, storage, history
playwright-cli -s=auth open https://app.example.com/login
playwright-cli -s=public open https://example.com

# Commands are isolated by session
playwright-cli -s=auth fill e1 "user@example.com"
playwright-cli -s=public snapshot
```

Each session has independent: cookies, localStorage, sessionStorage, IndexedDB, cache, history, tabs.

## Session Commands

```bash
playwright-cli list                        # list all sessions
playwright-cli close                       # close default session
playwright-cli -s=mysession close          # close named session
playwright-cli close-all                   # close all sessions
playwright-cli kill-all                    # force-kill zombie processes
playwright-cli delete-data                 # delete default session data
playwright-cli -s=mysession delete-data    # delete named session data
```

## Persistent Profiles

By default, profiles are in-memory only. Use `--persistent` to save to disk:

```bash
playwright-cli open https://example.com --persistent
playwright-cli open https://example.com --profile=/path/to/profile
```

## Environment Variable

```bash
export PLAYWRIGHT_CLI_SESSION="mysession"
playwright-cli open example.com  # uses "mysession" automatically
```

## Best Practices

- Name sessions semantically: `-s=github-auth`, not `-s=s1`
- Always close sessions when done (`close` or `close-all`)
- Use `kill-all` only for unresponsive/zombie processes

---

## Storage State

Save and restore complete browser state (cookies + localStorage):

```bash
playwright-cli state-save                  # auto-named file
playwright-cli state-save auth.json        # specific file
playwright-cli state-load auth.json        # restore state
```

### Authentication Reuse Pattern

```bash
# Login and save
playwright-cli open https://app.example.com/login
playwright-cli fill e1 "user@example.com"
playwright-cli fill e2 "password123"
playwright-cli click e3
playwright-cli state-save auth.json

# Later: restore and skip login
playwright-cli state-load auth.json
playwright-cli goto https://app.example.com/dashboard
# Already logged in!
```

## Cookies

```bash
playwright-cli cookie-list                          # list all
playwright-cli cookie-list --domain=example.com     # filter by domain
playwright-cli cookie-list --path=/api              # filter by path
playwright-cli cookie-get session_id                # get specific
playwright-cli cookie-set session abc123             # basic set
playwright-cli cookie-set session abc123 --domain=example.com --httpOnly --secure --sameSite=Lax
playwright-cli cookie-set remember_me token --expires=1735689600
playwright-cli cookie-delete session_id             # delete one
playwright-cli cookie-clear                         # clear all
```

### Multiple Cookies at Once

```bash
playwright-cli run-code "async page => {
  await page.context().addCookies([
    { name: 'session_id', value: 'sess_abc', domain: 'example.com', path: '/', httpOnly: true },
    { name: 'prefs', value: '{\"theme\":\"dark\"}', domain: 'example.com', path: '/' }
  ]);
}"
```

## Local Storage

```bash
playwright-cli localstorage-list
playwright-cli localstorage-get token
playwright-cli localstorage-set theme dark
playwright-cli localstorage-set user_settings '{"theme":"dark","language":"en"}'
playwright-cli localstorage-delete token
playwright-cli localstorage-clear
```

## Session Storage

```bash
playwright-cli sessionstorage-list
playwright-cli sessionstorage-get form_data
playwright-cli sessionstorage-set step 3
playwright-cli sessionstorage-delete step
playwright-cli sessionstorage-clear
```

## IndexedDB (via run-code)

```bash
playwright-cli run-code "async page => {
  return await page.evaluate(async () => await indexedDB.databases());
}"
playwright-cli run-code "async page => {
  await page.evaluate(() => indexedDB.deleteDatabase('myDatabase'));
}"
```

## Security Notes

- Never commit storage state files with auth tokens
- Add `*.auth-state.json` to `.gitignore`
- Delete state files after automation completes
- In-memory sessions (default) are safer for sensitive operations
