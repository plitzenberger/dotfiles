### Risk-Based Security Framework

A pragmatic approach to security that aligns controls with business value and threat reality:

#### Core Principles

1. **Proportionate Controls:** Security measures should match the value of what's protected
2. **Business Enablement:** Security exists to enable business, not obstruct it
3. **Risk Tolerance Alignment:** Controls reflect organizational appetite for risk
4. **Evidence-Based Decisions:** Security investments driven by data, not fear
5. **Continuous Improvement:** Security posture evolves with threat landscape and business needs

#### Risk Assessment Matrix

| Asset Value | Threat Likelihood | Required Controls |
|-------------|-------------------|-------------------|
| **Critical** | High | Defense-in-depth, continuous monitoring, incident response ready |
| **Critical** | Low | Strong baseline, periodic review, detection capabilities |
| **Important** | High | Targeted hardening, active monitoring, compensating controls |
| **Important** | Low | Standard controls, periodic assessment, basic monitoring |
| **Operational** | Any | Baseline security, automated compliance, exception-based alerts |

#### Business Impact Categories

- **Financial:** Direct loss, regulatory fines, remediation costs
- **Reputational:** Customer trust, brand damage, market position
- **Operational:** Service disruption, productivity loss, recovery time
- **Legal/Compliance:** Regulatory penalties, contractual breaches, litigation
- **Strategic:** Competitive advantage loss, intellectual property theft

#### Control Selection Criteria

When recommending controls, evaluate:

1. **Effectiveness:** Does it meaningfully reduce risk?
2. **Efficiency:** Is the cost proportionate to risk reduction?
3. **Usability:** Will it be adopted or worked around?
4. **Maintainability:** Can it be operated sustainably?
5. **Measurability:** Can we verify it's working?

#### Risk Treatment Options

| Option | When to Use | Example |
|--------|-------------|---------|
| **Mitigate** | Control cost < risk cost | Implement MFA for privileged accounts |
| **Transfer** | Risk exceeds capacity | Cyber insurance for data breach liability |
| **Accept** | Low risk, high mitigation cost | Minor configuration deviation with compensating control |
| **Avoid** | Unacceptable risk-reward ratio | Decline integration with insecure third party |

#### Maturity-Appropriate Security

| Maturity Level | Focus Areas | Acceptable Trade-offs |
|----------------|-------------|----------------------|
| **Startup** | Crown jewels, authentication, basic monitoring | Manual processes, some technical debt |
| **Growth** | Compliance foundations, automated controls, incident response | Point solutions, partial coverage |
| **Scale** | Security program, governance, continuous testing | Investment in tooling, dedicated team |
| **Enterprise** | Defense-in-depth, threat intelligence, zero trust | Complexity management, integration costs |
