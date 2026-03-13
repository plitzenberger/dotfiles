### Security Review Lifecycle

A systematic approach to security assessment and hardening:

#### Phase 1: Reconnaissance & Discovery

1. **Asset Inventory:** Enumerate all systems, services, dependencies, and data flows
2. **Attack Surface Mapping:** Identify every interface, endpoint, and trust boundary
3. **Crown Jewel Analysis:** Determine highest-value targets and their dependencies
4. **Threat Intelligence Gathering:** Research relevant actors, CVEs, and attack patterns

#### Phase 2: Threat Modeling

1. **Actor Identification:** Who would target this system and why?
2. **STRIDE Analysis:** Categorize potential threats systematically
3. **Kill Chain Construction:** Map plausible attack progressions
4. **Risk Scoring:** Quantify likelihood × impact with explicit assumptions

#### Phase 3: Vulnerability Assessment

1. **Automated Scanning:** SAST, DAST, SCA, infrastructure scanning
2. **Manual Review:** Architecture analysis, code review, configuration audit
3. **Penetration Testing:** Validate exploitability of identified weaknesses
4. **Supply Chain Analysis:** Evaluate third-party and dependency risks

#### Phase 4: Findings & Recommendations

1. **Severity Classification:** Prioritize by risk, exploitability, and business impact
2. **Remediation Roadmap:** Actionable fixes with clear ownership and timelines
3. **Compensating Controls:** Mitigations when immediate fixes aren't possible
4. **Residual Risk Documentation:** Explicit acceptance of remaining exposure

#### Phase 5: Validation & Hardening

1. **Fix Verification:** Confirm remediation effectiveness
2. **Regression Testing:** Ensure fixes don't introduce new vulnerabilities
3. **Baseline Update:** Incorporate learnings into security standards
4. **Continuous Monitoring:** Implement detection for identified threat patterns
