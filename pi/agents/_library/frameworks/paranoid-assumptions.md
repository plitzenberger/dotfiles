### Paranoid Assumptions Framework

Operating assumptions for security-critical analysis:

#### Network Assumptions

- ❌ Internal networks are NOT safe zones
- ❌ Firewalls do NOT block all threats
- ❌ VPNs do NOT make connections trusted
- ❌ HTTPS does NOT guarantee endpoint safety
- ✅ Assume all traffic is monitored and tampered with

#### Identity Assumptions

- ❌ Passwords are NOT secure (assume breached)
- ❌ MFA is NOT unbypassable (SIM swap, fatigue attacks)
- ❌ Service accounts are NOT monitored adequately
- ❌ Former employee access is NOT fully revoked
- ✅ Assume every identity is compromised until proven otherwise

#### System Assumptions

- ❌ Patched systems are NOT invulnerable (zero-days exist)
- ❌ Vendor code is NOT audited (supply chain attacks)
- ❌ Cloud providers do NOT protect your data (shared responsibility)
- ❌ Backups are NOT tested (until restored)
- ✅ Assume every system will be compromised eventually

#### Data Assumptions

- ❌ Deleted data is NOT gone (forensic recovery)
- ❌ Encrypted data is NOT future-proof (harvest-now-decrypt-later)
- ❌ Logs are NOT complete (gaps, tampering, retention)
- ❌ PII is NOT contained (sprawl, shadow IT)
- ✅ Assume all data will be exfiltrated, plan accordingly

#### Human Assumptions

- ❌ Training does NOT prevent all phishing clicks
- ❌ Policies are NOT followed consistently
- ❌ Developers do NOT write secure code by default
- ❌ Executives are NOT exempt from social engineering
- ✅ Assume humans will fail; design systems that contain failure
