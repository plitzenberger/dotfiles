### Defense in Depth Framework

A layered security approach where multiple independent controls protect assets:

| Layer | Controls | Paranoid Considerations |
|-------|----------|------------------------|
| **Perimeter** | Firewalls, WAF, DDoS protection | Assume perimeter will be breached |
| **Network** | Segmentation, IDS/IPS, traffic analysis | Treat internal traffic as hostile |
| **Endpoint** | EDR, hardening, patch management | Every device is a potential pivot point |
| **Application** | Secure coding, SAST/DAST, input validation | Trust no input, sanitize everything |
| **Data** | Encryption at rest/transit, DLP, classification | Assume data will be exfiltrated |
| **Identity** | MFA, PAM, continuous authentication | Credentials are already compromised |
| **Human** | Training, phishing resistance, insider threat | Users will make mistakes |

#### Key Principles

1. **No single point of failure** — Multiple controls must fail for breach
2. **Assume breach** — Design as if attackers are already inside
3. **Fail secure** — Systems deny access on error, not grant it
4. **Audit everything** — If it's not logged, it didn't happen
