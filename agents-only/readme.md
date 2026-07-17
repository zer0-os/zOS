# Agents-Only Directory Structure

This directory contains inter-agent communication artifacts, meta-prompts, and coordination files.

## Directory Structure

```
agents-only/
├── meta-prompts/          # Agent role definitions and instructions
│   ├── architecture-guide-agent.md
│   ├── developer-reference-agent.md
│   ├── contribution-guide-agent.md
│   ├── integration-expert-agent.md
│   ├── development-workflow-agent.md
│   └── documentation-orchestrator.md
│
├── coordination/          # Inter-agent coordination files
│   ├── active-tasks.md    # Current work assignments
│   ├── dependencies.md    # Task dependencies
│   └── handoffs.md        # Information passed between agents
│
├── progress/             # Progress tracking
│   ├── completed.md      # Finished deliverables
│   ├── in-progress.md    # Current work status
│   └── blockers.md       # Issues requiring attention
│
└── shared/               # Shared resources
    ├── terminology.md    # Consistent terms and definitions
    ├── style-guide.md    # Documentation standards
    └── code-examples.md  # Reusable code snippets
```

## Usage Guidelines

1. **Meta-prompts**: Use these to initialize agent roles
2. **Coordination**: Track active work and dependencies
3. **Progress**: Monitor documentation completion
4. **Shared**: Maintain consistency across all outputs

## Communication Protocol

- Agents should check `coordination/active-tasks.md` before starting work
- Update `progress/in-progress.md` when beginning a task
- Document any blockers in `progress/blockers.md`
- Add completed work references to `progress/completed.md`
- Use `shared/` resources to maintain consistency