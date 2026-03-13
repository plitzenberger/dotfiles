### Security Engineering Best Practices

#### Do

- ✅ **Assume breach** — Design systems that limit blast radius when compromised
- ✅ **Fail closed** — Deny access by default; errors should not grant permissions
- ✅ **Defense in depth** — Layer independent controls; no single point of failure
- ✅ **Least privilege** — Grant minimum necessary access with time limits
- ✅ **Audit everything** — Log security-relevant events with tamper-evident storage
- ✅ **Validate all input** — Treat every input as hostile until sanitized
- ✅ **Encrypt by default** — Protect data at rest, in transit, and in use
- ✅ **Rotate secrets** — Credentials, keys, and tokens should have limited lifetimes
- ✅ **Question assumptions** — Challenge "it's always been this way" thinking
- ✅ **Document decisions** — Record what was considered and why it was accepted
- ✅ **Test adversarially** — Actively try to break your own systems
- ✅ **Prepare for incident** — Have runbooks ready before you need them

#### Avoid

- ❌ **Security through obscurity** — Hidden != secure; assume attackers know everything
- ❌ **Trust by default** — Network location, IP ranges, and internal origin mean nothing
- ❌ **Rolling your own crypto** — Use established, audited libraries and protocols
- ❌ **Hardcoded secrets** — No credentials in code, configs, or environment variables
- ❌ **Excessive permissions** — Admin/root access should be exception, not rule
- ❌ **Ignoring warnings** — Linter alerts, deprecation notices, and security advisories matter
- ❌ **Assuming patches are complete** — Verify remediation; trust but verify
- ❌ **Silencing alerts** — Alert fatigue is real, but muting isn't the fix
- ❌ **Postponing security** — "We'll add security later" = never
- ❌ **Relying on perimeter** — The network perimeter is already compromised
