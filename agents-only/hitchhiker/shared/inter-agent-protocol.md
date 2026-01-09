# Inter-Agent Communication Protocol

## Agent Identification Codes
Each agent uses a unique identifier in communications:
- `[ARCH]` - Guide Architect
- `[EXPL]` - Pattern Explorer  
- `[STOR]` - Code Storyteller
- `[WORK]` - Workshop Master
- `[VISU]` - Visual Guide
- `[INTG]` - Integration Synthesizer

## Message Format

```
[SENDER] → [RECEIVER] | [STATUS] | [TIMESTAMP]
Subject: [Brief description]
Content: [Detailed message]
Action Required: [Specific next steps]
Dependencies: [What's needed]
Output Location: [Where to find/place files]
```

## Status Codes

### Task Status
- `INIT` - Task initialized
- `PROG` - In progress
- `WAIT` - Waiting for dependency
- `REVW` - Ready for review
- `DONE` - Complete
- `HELP` - Assistance needed

### Priority Levels
- `P0` - Blocking other agents
- `P1` - High priority
- `P2` - Normal priority
- `P3` - Nice to have

## Coordination Files

### 1. Task Board
`./agents-only/hitchhiker/coordination/task-board.md`
```markdown
## Active Tasks
| Agent | Task | Status | Priority | Blocker |
|-------|------|--------|----------|---------|
| ARCH  | Book Structure | DONE | P0 | None |
| EXPL  | Redux Patterns | PROG | P1 | None |
```

### 2. Handoff Log
`./agents-only/hitchhiker/coordination/handoffs/[date]-[from]-to-[to].md`
```markdown
From: [ARCH]
To: [EXPL]
Date: 2024-01-XX
Status: READY

## Handoff Content
- Book structure complete at: ./structure.md
- Priority patterns to explore: Redux-Saga, Matrix Events
- Expected outputs: Pattern documentation in ./patterns/

## Notes
Focus on patterns that would benefit Haven Protocol
```

### 3. Blocking Issues
`./agents-only/hitchhiker/coordination/blockers.md`
```markdown
## Current Blockers
| Agent | Blocked On | Needed From | Priority |
|-------|------------|-------------|----------|
| STOR  | Pattern docs | EXPL | P0 |
```

## Agent Capabilities Matrix

| Agent | Reads From | Writes To | Depends On |
|-------|------------|-----------|------------|
| ARCH  | opusdocs/* | coordination/*, structure | None |
| EXPL  | codebase, structure | patterns/*, shared/patterns | ARCH |
| STOR  | patterns/*, voice-guide | chapters/*, narratives | EXPL |
| WORK  | patterns/*, chapters/* | workshops/*, exercises | EXPL, STOR |
| VISU  | all content | diagrams/*, visuals | All |
| INTG  | all content | final book, index | All |

## Semaphore System

Agents signal state through semaphore files:

### Ready Signal
`./agents-only/hitchhiker/coordination/signals/[agent]-ready.signal`
```
Agent: [EXPL]
Task: Redux Pattern Analysis
Status: READY
Output: ./patterns/redux-saga-patterns.md
Next: [STOR] can begin narrative transformation
```

### Help Signal
`./agents-only/hitchhiker/coordination/signals/[agent]-help.signal`
```
Agent: [VISU]
Task: Matrix Flow Diagram
Status: HELP
Issue: Need clarification on event flow
Needed From: [EXPL]
```

## Shared Resources Access

### Pattern Library
- Location: `./agents-only/hitchhiker/shared/pattern-library.md`
- Write: EXPL
- Read: All

### Glossary
- Location: `./agents-only/hitchhiker/shared/glossary.md`
- Write: All (append only)
- Maintain: INTG

### Code Examples
- Location: `./agents-only/hitchhiker/shared/code-examples/`
- Write: EXPL, WORK
- Read: All

### Style Guide
- Location: `./agents-only/hitchhiker/shared/voice-guide.md`
- Write: ARCH, INTG
- Read: All (required reading)

## Conflict Resolution

1. **Resource Conflicts**: INTG has final say
2. **Technical Disputes**: EXPL has authority on patterns
3. **Narrative Decisions**: STOR leads on voice/tone
4. **Structure Changes**: ARCH must approve

## Quality Gates

Before marking work as `DONE`, each agent must:
1. Update task board
2. Create handoff document
3. Signal completion
4. Verify outputs are in correct location
5. Update any shared resources

---
*"The single biggest problem in communication is the illusion that it has taken place." - George Bernard Shaw (and every dev team ever)*