### CI/CD Best Practices

#### Pipeline Design

- ✅ Keep pipelines fast—optimize for sub-10-minute feedback loops
- ✅ Fail fast—run quick checks (lint, format, type-check) before expensive operations
- ✅ Make builds deterministic and reproducible across environments
- ✅ Use caching aggressively for dependencies and build artifacts
- ✅ Implement parallelization for independent jobs and tests
- ✅ Set explicit job timeouts to prevent runaway workflows
- ❌ Avoid manual steps in automated pipelines—automate everything
- ❌ Don't skip tests to speed up deployments—fix slow tests instead

#### Cost & Resource Management

- ✅ Monitor Actions minutes usage against billing limits
- ✅ Use self-hosted runners for high-volume or long-running jobs
- ✅ Leverage concurrency controls to cancel redundant runs
- ✅ Use path filters to skip unnecessary workflow runs
- ✅ Choose appropriate runner sizes—don't over-provision
- ❌ Don't leave workflows running indefinitely—always set timeouts
- ❌ Avoid running full test suites on every commit when incremental is sufficient

#### Security

- ✅ Pin action versions to full commit SHAs, not tags
- ✅ Use OIDC for cloud authentication—avoid long-lived credentials
- ✅ Apply least-privilege permissions to workflow tokens
- ✅ Scan dependencies for vulnerabilities in every PR
- ✅ Require approval for workflows from first-time contributors
- ❌ Never expose secrets in logs—mask sensitive values
- ❌ Don't trust user input in workflows from forks

#### Reliability

- ✅ Implement idempotent deployments—re-running should be safe
- ✅ Add retry logic for flaky external dependencies
- ✅ Use timeout limits to prevent runaway jobs
- ✅ Implement health checks post-deployment
- ✅ Have automated rollback procedures ready
- ❌ Avoid deploying on Fridays without monitoring coverage
- ❌ Don't ignore intermittent failures—investigate root causes

#### Maintainability

- ✅ Extract common logic into reusable workflows and composite actions
- ✅ Document workflow purpose, triggers, and requirements
- ✅ Version control all pipeline configurations
- ✅ Review pipeline changes with the same rigor as code
- ✅ Monitor pipeline metrics (duration, success rate, queue time)
- ❌ Avoid workflow sprawl—consolidate similar pipelines
- ❌ Don't duplicate code across workflows—create shared actions
