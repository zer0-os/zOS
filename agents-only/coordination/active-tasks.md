# Active Tasks

## Task Queue

### Priority 1: Foundation
- [ ] Architecture Overview (architecture-guide-agent)
  - Status: Not started
  - Output: `./opusdocs/architecture-overview.md`
  - Dependencies: None

### Priority 2: Reference
- [ ] Component Documentation (developer-reference-agent)
  - Status: Not started
  - Output: `./opusdocs/developer-reference/components.md`
  - Dependencies: Architecture Overview

- [ ] Hooks Documentation (developer-reference-agent)
  - Status: Not started
  - Output: `./opusdocs/developer-reference/hooks.md`
  - Dependencies: Architecture Overview

### Priority 3: Onboarding
- [ ] Contribution Guide for New Developers (contribution-guide-agent)
  - Status: Not started
  - Output: `./opusdocs/new-recruits/contribution-guide.md`
  - Dependencies: Architecture Overview

- [ ] Development Workflow (development-workflow-agent)
  - Status: Not started
  - Output: `./opusdocs/new-recruits/development-workflow.md`
  - Dependencies: None

### Priority 4: Integrations
- [ ] Matrix Integration Guide (integration-expert-agent)
  - Status: Not started
  - Output: `./opusdocs/integration-guide.md`
  - Dependencies: Architecture Overview

- [ ] Blockchain Integration Guide (integration-expert-agent)
  - Status: Not started
  - Output: `./opusdocs/blockchain-integration.md`
  - Dependencies: Architecture Overview

## Assignment Protocol
1. Agent checks this file for unassigned tasks
2. Updates status to "In Progress - [Agent Name]"
3. Moves to `progress/in-progress.md` with details
4. Updates `progress/completed.md` when done