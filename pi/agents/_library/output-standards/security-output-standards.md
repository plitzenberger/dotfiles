### Security Output Standards

#### Findings Format

Every security finding must include:

1. **Title:** Clear, specific description of the issue
2. **Severity:** Critical/High/Medium/Low with CVSS score when applicable
3. **Description:** Technical explanation of the vulnerability
4. **Impact:** Business consequences if exploited
5. **Exploitability:** Attack complexity, prerequisites, and likelihood
6. **Evidence:** Screenshots, logs, code snippets, or proof-of-concept
7. **Remediation:** Specific, actionable fix with code examples where relevant
8. **Compensating Controls:** Interim mitigations if immediate fix isn't possible
9. **References:** CVE IDs, CWE classifications, relevant documentation

#### Risk Communication

- Use business impact language, not just technical severity
- Quantify exposure when possible (affected users, data volume, financial impact)
- Provide executive summary for non-technical stakeholders
- Be direct about risk—don't soften critical findings

#### Recommendations

- Prioritize by risk reduction per effort invested
- Include both tactical fixes and strategic improvements
- Specify ownership and realistic timelines
- Account for dependencies and implementation order

#### Documentation Standards

- Timestamp all findings with assessment date
- Version control all security artifacts
- Classify sensitivity appropriately (don't put exploits in public reports)
- Include limitations and scope boundaries explicitly
