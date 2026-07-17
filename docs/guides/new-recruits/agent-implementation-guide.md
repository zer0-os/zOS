# Step-by-Step Agent Implementation Guide

## Overview
This guide helps you use the agent team to generate comprehensive documentation for zOS.

## Prerequisites
- Access to Claude Code with the `/agent` command
- The zOS repository with the agent meta-prompts in `./agents-only/meta-prompts/`

## Implementation Steps

### Step 1: Generate Architecture Overview
```bash
/agent general-purpose "Using the meta-prompt from ./agents-only/meta-prompts/architecture-guide-agent.md, analyze the zOS codebase and create a comprehensive architecture overview. Focus on helping new developers understand the mental model of how zOS works."
```

**Expected Output**: `./opusdocs/architecture-overview.md`

### Step 2: Create Component Reference
```bash
/agent general-purpose "Using the meta-prompt from ./agents-only/meta-prompts/developer-reference-agent.md, document the key React components in /src/components/. Start with the most commonly used components like Avatar, Modal, and Button. Include TypeScript types and practical examples."
```

**Expected Output**: `./opusdocs/developer-reference/components.md`

### Step 3: Document Custom Hooks
```bash
/agent general-purpose "Using the meta-prompt from ./agents-only/meta-prompts/developer-reference-agent.md, document all custom hooks in /src/lib/hooks/. Show practical usage examples and explain when to use each hook."
```

**Expected Output**: `./opusdocs/developer-reference/hooks.md`

### Step 4: Create Contribution Guide
```bash
/agent general-purpose "Using the meta-prompt from ./agents-only/meta-prompts/contribution-guide-agent.md, create a welcoming contribution guide specifically for new developers' skill level. Include step-by-step instructions for making first contributions to zOS."
```

**Expected Output**: `./opusdocs/new-recruits/contribution-guide.md`

### Step 5: Document Development Workflow
```bash
/agent general-purpose "Using the meta-prompt from ./agents-only/meta-prompts/development-workflow-agent.md, create a practical development workflow guide. Include daily tasks, debugging strategies, and productivity tips for working with the zOS codebase."
```

**Expected Output**: `./opusdocs/new-recruits/development-workflow.md`

### Step 6: Create Integration Guides
```bash
# Matrix Integration
/agent general-purpose "Using the meta-prompt from ./agents-only/meta-prompts/integration-expert-agent.md, document how Matrix chat integration works in zOS. Include practical examples of sending messages, handling events, and managing rooms."

# Blockchain Integration
/agent general-purpose "Using the meta-prompt from ./agents-only/meta-prompts/integration-expert-agent.md, create a blockchain integration guide focusing on wallet connections, transactions, and smart contract interactions in zOS."
```

**Expected Outputs**: 
- `./opusdocs/integration-guide.md`
- `./opusdocs/blockchain-integration.md`

## Tips for Success

### 1. Run Agents in Order
- Start with architecture (provides context for everything else)
- Then do reference documentation
- Finally, create guides and workflows

### 2. Review and Iterate
- Check each output before moving to the next
- Agents can refine their work if needed:
  ```bash
  /agent general-purpose "Review the architecture overview in ./opusdocs/architecture-overview.md and add a section about performance considerations and optimization strategies used in zOS."
  ```

### 3. Cross-Reference Documents
- Ensure documents link to each other
- Use consistent terminology (check `./agents-only/shared/terminology.md`)

### 4. Customize for Your Needs
- Modify the meta-prompts if you need different focus areas
- Add new agents for specific documentation needs

## Common Patterns

### Adding Examples
```bash
/agent general-purpose "Add more practical examples to the hooks documentation in ./opusdocs/developer-reference/hooks.md, specifically showing how to use hooks with TypeScript and error handling."
```

### Creating Cheatsheets
```bash
/agent general-purpose "Create a quick-reference cheatsheet for common Redux-Saga patterns used in zOS. Save to ./opusdocs/new-recruits/redux-saga-cheatsheet.md"
```

### Documenting Specific Features
```bash
/agent general-purpose "Document how to add a new app module to zOS, including all necessary files, Redux setup, and routing configuration. Save to ./opusdocs/new-recruits/creating-new-app-module.md"
```

## Troubleshooting

### If Documentation Seems Incomplete
- Check if the agent had access to all necessary files
- Provide specific file paths in your prompts
- Ask the agent to explore specific directories

### If Examples Don't Work
- Verify against the actual codebase
- Check for recent changes in the code
- Update examples to match current patterns

### If Terminology Is Inconsistent
- Refer agents to `./agents-only/shared/terminology.md`
- Do a final consistency pass across all documents

## Next Steps
1. Start with Step 1 (Architecture Overview)
2. Review the output
3. Proceed through each step
4. Customize based on what you learn
5. Share feedback to improve the process

Remember: The goal is to create documentation that helps you (and developers like you) contribute effectively to zOS!