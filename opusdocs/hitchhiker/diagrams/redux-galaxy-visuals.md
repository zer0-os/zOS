# Redux Galaxy Visual Guide

*"A picture is worth a thousand state updates, and a diagram is worth a million debugging sessions."*

This visual guide transforms the complex Redux-Saga flow, normalization patterns, and state architecture from Chapter 2: The Redux Galaxy into clear, understandable diagrams. Whether you're debugging a flow or learning the patterns, these visuals will be your cosmic map.

---

## Table of Contents

1. [Redux-Saga Flow Architecture](#redux-saga-flow-architecture)
2. [Normalization Engine Patterns](#normalization-engine-patterns)
3. [State Architecture Overview](#state-architecture-overview)
4. [Selector Constellation Patterns](#selector-constellation-patterns)
5. [Data Flow Sequences](#data-flow-sequences)
6. [Error Handling & Recovery](#error-handling--recovery)

---

## Redux-Saga Flow Architecture

### 1. Root Saga Orchestration

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                        ROOT SAGA UNIVERSE                       │
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│  │   Spawn     │────▶│    Spawn    │────▶│    Spawn    │      │
│  │ Page Load   │     │    Web3     │     │  Channels   │      │
│  └─────────────┘     └─────────────┘     └─────────────┘      │
│           │                  │                  │             │
│           ▼                  ▼                  ▼             │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐      │
│  │   Spawn     │     │   Spawn     │     │   Spawn     │      │
│  │ Messages    │     │ Auth Flow   │     │ Chat Events │      │
│  └─────────────┘     └─────────────┘     └─────────────┘      │
│           │                  │                  │             │
│           └──────────────────┼──────────────────┘             │
│                              │                                │
│                    ┌─────────▼─────────┐                      │
│                    │  Error Boundary   │                      │
│                    │ (Isolated Crash)  │                      │
│                    └───────────────────┘                      │
└─────────────────────────────────────────────────────────────────┘

Legend:
├─ spawn()  = Independent saga process
├─ ────▶    = Initialization flow
└─ Error    = Saga-level error isolation
```

### 2. Saga Lifecycle Patterns

```mermaid
graph TD
    A[Action Dispatched] --> B{Saga Watcher}
    B -->|takeLatest| C[Cancel Previous]
    B -->|takeEvery| D[Fork New Instance]
    B -->|takeLeading| E[Ignore if Running]
    
    C --> F[Execute Saga]
    D --> F
    E --> F
    
    F --> G{Side Effect}
    G -->|API Call| H[call()]
    G -->|State Update| I[put()]
    G -->|Data Select| J[select()]
    G -->|Delay| K[delay()]
    
    H --> L{Success?}
    L -->|Yes| M[Normalize Data]
    L -->|No| N[Error Handling]
    
    M --> O[Dispatch Success]
    N --> P[Dispatch Error]
    
    O --> Q[Update State]
    P --> Q
    
    style A fill:#e1f5fe
    style F fill:#f3e5f5
    style M fill:#e8f5e8
    style N fill:#ffebee
```

---

## Normalization Engine Patterns

### 1. The Unified Normalization Flow

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                    NORMALIZATION UNIVERSE                       │
│                                                                 │
│  INPUT: Nested API Response                                     │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ {                                                   │       │
│  │   channels: [{                                      │       │
│  │     id: "room1",                                    │       │
│  │     messages: [{                                    │       │
│  │       id: "msg1",                                   │       │
│  │       author: { id: "user1", name: "Alice" }       │       │
│  │     }]                                              │       │
│  │   }]                                                │       │
│  │ }                                                   │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              NORMALIZER ENGINE                      │       │
│  │                                                     │       │
│  │  1. Schema Validation    ┌──────────────────┐      │       │
│  │     - Check __denormalized flag             │      │       │
│  │     - Prevent infinite loops                │      │       │
│  │                                             │      │       │
│  │  2. Entity Extraction    ┌──────────────────┐      │       │
│  │     - Flatten nested objects               │      │       │
│  │     - Create relationship tables          │      │       │
│  │                                             │      │       │
│  │  3. Reference Mapping    ┌──────────────────┐      │       │
│  │     - Generate entity IDs                  │      │       │
│  │     - Build lookup tables                 │      │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                 │
│                              ▼                                 │
│  OUTPUT: Normalized State                                       │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ entities: {                                         │       │
│  │   users: {                                          │       │
│  │     "user1": { id: "user1", name: "Alice" }        │       │
│  │   },                                                │       │
│  │   messages: {                                       │       │
│  │     "msg1": { id: "msg1", author: "user1" }        │       │
│  │   },                                                │       │
│  │   channels: {                                       │       │
│  │     "room1": { id: "room1", messages: ["msg1"] }   │       │
│  │   }                                                 │       │
│  │ }                                                   │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### 2. Merge-First Update Strategy

```mermaid
graph TD
    A[Incoming Data] --> B{Data Type}
    B -->|Full Entity| C[Deep Merge]
    B -->|Partial Update| D[Smart Merge]
    B -->|New Entity| E[Direct Insert]
    
    C --> F{Existing Data?}
    D --> F
    
    F -->|Yes| G[Preserve Existing Fields]
    F -->|No| H[Create New Record]
    
    G --> I[Merge New Fields]
    I --> J[Update Reference Tables]
    H --> J
    E --> J
    
    J --> K[Validate Relationships]
    K --> L[Commit to State]
    
    style A fill:#e3f2fd
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style G fill:#f1f8e9
    style I fill:#e0f2f1
```

### 3. Entity Relationship Diagram

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                    NORMALIZED STATE SCHEMA                      │
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │    USERS    │     │  CHANNELS   │     │  MESSAGES   │       │
│  │─────────────│     │─────────────│     │─────────────│       │
│  │ id: string  │◄────┤ id: string  │◄────┤ id: string  │       │
│  │ name: str   │     │ name: str   │     │ content: str│       │
│  │ avatar: str │     │ type: enum  │     │ author: ref │──────┐│
│  │ status: enum│     │ members: []ref     │ timestamp   │      ││
│  │ lastSeen: ts│     │ messages: []ref    │ parentId: ref      ││
│  └─────────────┘     │ unreadCount │     │ reactions: {}│      ││
│         ▲            │ labels: []  │     │ editedAt: ts│      ││
│         │            └─────────────┘     └─────────────┘      ││
│         │                   ▲                   │            ││
│         │                   │                   │            ││
│         └───────────────────┼───────────────────┘            ││
│                             │                                ││
│  ┌─────────────────────────────────────────────────────────────┘│
│  │                RELATIONSHIP TABLES                          │
│  │                                                             │
│  │  channelMembers: {                                          │
│  │    "room1": ["user1", "user2", "user3"]                    │
│  │  }                                                          │
│  │                                                             │
│  │  channelMessages: {                                         │
│  │    "room1": ["msg1", "msg2", "msg3"]                       │
│  │  }                                                          │
│  │                                                             │
│  │  messageReplies: {                                          │
│  │    "msg1": ["reply1", "reply2"]                            │
│  │  }                                                          │
│  └─────────────────────────────────────────────────────────────│
└─────────────────────────────────────────────────────────────────┘

Legend:
├─ ref      = Reference to another entity
├─ []ref    = Array of references
├─ ◄────    = One-to-many relationship
└─ {}       = Object/Map structure
```

---

## State Architecture Overview

### 1. Complete Redux Store Structure

```mermaid
graph TB
    subgraph "Redux Store"
        A[RootState]
        
        subgraph "Normalized Entities"
            B[users: Record<string, User>]
            C[channels: Record<string, Channel>]
            D[messages: Record<string, Message>]
        end
        
        subgraph "Feature Slices"
            E[authentication]
            F[chat]
            G[channelsList]
            H[theme]
            I[notifications]
        end
        
        subgraph "UI State"
            J[activeConversationId]
            K[selectedMessages]
            L[isLoading]
            M[error]
        end
        
        A --> B
        A --> C
        A --> D
        A --> E
        A --> F
        A --> G
        A --> H
        A --> I
        A --> J
        A --> K
        A --> L
        A --> M
    end
    
    style A fill:#e1f5fe
    style B fill:#e8f5e8
    style C fill:#e8f5e8
    style D fill:#e8f5e8
    style E fill:#fff3e0
    style F fill:#fff3e0
```

### 2. Data Flow Architecture

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                        DATA FLOW COSMOS                         │
│                                                                 │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   UI LAYER  │    │ SAGA LAYER  │    │ API LAYER   │         │
│  │─────────────│    │─────────────│    │─────────────│         │
│  │ Components  │───▶│ Watchers    │───▶│ HTTP Calls  │         │
│  │ Hooks       │    │ Workers     │    │ WebSockets  │         │
│  │ Selectors   │◄───│ Effects     │◄───│ Responses   │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│          │                  │                  │               │
│          ▼                  ▼                  ▼               │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │
│  │   ACTIONS   │    │ NORMALIZER  │    │   CACHE     │         │
│  │─────────────│    │─────────────│    │─────────────│         │
│  │ User Events │───▶│ Schema Val. │───▶│ Entity Store│         │
│  │ API Events  │    │ Entity Ext. │    │ Relationships        │
│  │ System Evts │    │ Ref Mapping │    │ Indexes     │         │
│  └─────────────┘    └─────────────┘    └─────────────┘         │
│          │                  │                  │               │
│          └──────────────────┼──────────────────┘               │
│                             ▼                                  │
│                    ┌─────────────┐                             │
│                    │   REDUCER   │                             │
│                    │─────────────│                             │
│                    │ Merge Logic │                             │
│                    │ State Trees │                             │
│                    │ Immutability│                             │
│                    └─────────────┘                             │
│                             │                                  │
│                             ▼                                  │
│                    ┌─────────────┐                             │
│                    │   STORE     │                             │
│                    │─────────────│                             │
│                    │ Normalized  │                             │
│                    │ Subscriptions                            │
│                    │ DevTools    │                             │
│                    └─────────────┘                             │
└─────────────────────────────────────────────────────────────────┘

Flow Direction:
├─ ───▶  = Forward data flow
├─ ◄───  = Backward data flow
└─ ▼     = Vertical state flow
```

---

## Selector Constellation Patterns

### 1. Selector Factory Architecture

```mermaid
graph TD
    A[makeGetEntityById Factory] --> B[Create Selector Instance]
    B --> C[Memoization Cache]
    
    D[Input: State + ID] --> B
    E[Reselect Library] --> C
    
    C --> F{Cache Hit?}
    F -->|Yes| G[Return Cached Result]
    F -->|No| H[Compute New Result]
    
    H --> I[Extract Entity]
    I --> J[Transform Data]
    J --> K[Cache Result]
    K --> L[Return Result]
    
    subgraph "Performance Optimization"
        M[Stable References]
        N[Shallow Equality]
        O[Instance Isolation]
    end
    
    C --> M
    G --> N
    B --> O
    
    style A fill:#e3f2fd
    style C fill:#e8f5e8
    style F fill:#fff3e0
    style M fill:#f3e5f5
    style N fill:#f3e5f5
    style O fill:#f3e5f5
```

### 2. Complex Selector Composition

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                    SELECTOR CONSTELLATION                       │
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │   Basic     │     │  Composed   │     │  Complex    │       │
│  │ Selectors   │────▶│  Selectors  │────▶│ Selectors   │       │
│  │─────────────│     │─────────────│     │─────────────│       │
│  │ getUser     │     │ getUserBy   │     │ getChannel  │       │
│  │ getChannel  │     │ getChannel  │     │ WithMembers │       │
│  │ getMessage  │     │ WithAuthor  │     │ AndMessages │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
│         │                     │                     │           │
│         ▼                     ▼                     ▼           │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │ createSel.  │     │ createSel.  │     │ createSel.  │       │
│  │ + Memo      │     │ + Memo      │     │ + Memo      │       │
│  │ + Instance  │     │ + Compose   │     │ + Deep Comp │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
│         │                     │                     │           │
│         └─────────────────────┼─────────────────────┘           │
│                               ▼                                 │
│                     ┌─────────────┐                             │
│                     │   HOOKS     │                             │
│                     │─────────────│                             │
│                     │useSelector  │                             │
│                     │useCallback  │                             │
│                     │useMemo      │                             │
│                     └─────────────┘                             │
│                               │                                 │
│                               ▼                                 │
│                     ┌─────────────┐                             │
│                     │ COMPONENTS  │                             │
│                     │─────────────│                             │
│                     │ Re-render   │                             │
│                     │ Optimization│                             │
│                     │ Performance │                             │
│                     └─────────────┘                             │
└─────────────────────────────────────────────────────────────────┘

Performance Benefits:
├─ Memo Cache    = Results cached until inputs change
├─ Instance Iso. = Each component gets own cache
├─ Stable Refs   = Same input = same reference
└─ Compose Chain = Build complex from simple
```

---

## Data Flow Sequences

### 1. Message Send Sequence

```mermaid
sequenceDiagram
    participant U as User
    participant C as Component
    participant S as Saga
    participant N as Normalizer
    participant A as API
    participant R as Store

    U->>C: Types message & hits send
    C->>R: dispatch(sendMessage)
    
    Note over R: Optimistic Update
    R->>C: Show pending message
    
    R->>S: Saga intercepts action
    S->>N: Create optimistic entity
    N->>R: Update normalized state
    
    S->>A: POST /messages
    
    alt Success Path
        A->>S: 200 + message data
        S->>N: Normalize response
        N->>R: Merge final state
        R->>C: Update UI with real data
    else Error Path
        A->>S: Error response
        S->>R: Remove optimistic update
        S->>R: dispatch(showError)
        R->>C: Show error state
    end
    
    C->>U: Updated message list
```

### 2. Real-time Event Processing

```mermaid
sequenceDiagram
    participant M as Matrix Server
    participant W as WebSocket
    participant S as Saga
    participant N as Normalizer
    participant R as Store
    participant C as Component

    M->>W: Real-time event
    W->>S: Forward event to saga
    
    S->>S: Route by event type
    
    alt Message Event
        S->>N: Normalize message
        N->>R: Merge into messages
    else User Event
        S->>N: Normalize user
        N->>R: Merge into users
    else Channel Event
        S->>N: Normalize channel
        N->>R: Merge into channels
    end
    
    R->>C: Notify subscribers
    C->>C: Re-render with new data
    
    Note over S,R: Batch Processing
    S->>S: Collect events (500ms)
    S->>N: Batch normalize
    N->>R: Single state update
```

---

## Error Handling & Recovery

### 1. Saga Error Boundaries

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                    ERROR HANDLING COSMOS                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │                ROOT SAGA SPAWNER                    │       │
│  │                                                     │       │
│  │  spawn(sagaA) ───┐                                  │       │
│  │  spawn(sagaB) ───┼─── try/catch wrapper             │       │
│  │  spawn(sagaC) ───┘                                  │       │
│  │                                                     │       │
│  │  if (error) {                                       │       │
│  │    console.log(`Saga [${name}] failed`, error)     │       │
│  │    // Saga dies, others continue                    │       │
│  │  }                                                  │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              INDIVIDUAL SAGA RECOVERY               │       │
│  │                                                     │       │
│  │  try {                                              │       │
│  │    yield call(apiFunction)                          │       │
│  │  } catch (error) {                                  │       │
│  │    if (error.status === 401) {                     │       │
│  │      yield put(logout())                           │       │
│  │    } else if (error.status >= 500) {               │       │
│  │      yield put(showRetryDialog())                  │       │
│  │    } else {                                         │       │
│  │      yield put(showErrorMessage(error))            │       │
│  │    }                                                │       │
│  │  }                                                  │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              OPTIMISTIC UPDATE ROLLBACK             │       │
│  │                                                     │       │
│  │  1. Store optimistic ID mapping                     │       │
│  │  2. Apply optimistic state changes                  │       │
│  │  3. Show loading/pending UI                         │       │
│  │                                                     │       │
│  │  On Success:                                        │       │
│  │    - Replace optimistic with real data              │       │
│  │    - Update ID mappings                             │       │
│  │    - Clear loading states                           │       │
│  │                                                     │       │
│  │  On Failure:                                        │       │
│  │    - Remove optimistic entities                     │       │
│  │    - Restore previous state                         │       │
│  │    - Show error feedback                            │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

### 2. State Recovery Patterns

```mermaid
graph TD
    A[Error Detected] --> B{Error Type}
    
    B -->|Network| C[Retry Logic]
    B -->|Auth| D[Re-authenticate]
    B -->|Data| E[Rollback State]
    B -->|Critical| F[Reset Store]
    
    C --> G{Retry Count}
    G -->|< 3| H[Exponential Backoff]
    G -->|>= 3| I[Show Manual Retry]
    
    H --> J[Attempt Request]
    J --> K{Success?}
    K -->|Yes| L[Update State]
    K -->|No| G
    
    D --> M[Clear Auth Token]
    M --> N[Redirect to Login]
    
    E --> O[Remove Optimistic]
    O --> P[Restore Previous]
    P --> Q[Notify User]
    
    F --> R[Clear All Data]
    R --> S[Reload Application]
    
    style A fill:#ffebee
    style C fill:#e8f5e8
    style D fill:#fff3e0
    style E fill:#f3e5f5
    style F fill:#ffebee
```

---

## Quick Reference: Visual Patterns

### ASCII Art Legend
```ascii
┌────┐ = Process/Component    ├─ = Connection point
│    │   boundary            └─ = Terminal connection
└────┘                       ── = Horizontal line
                              │  = Vertical line
───▶ = Data flow direction    ▼  = Downward flow
◄─── = Reverse flow          ▲  = Upward flow
┌─┐  = Small component       ●  = Decision point
```

### Mermaid Chart Types Used
- **Graph TD**: Top-down flow diagrams
- **sequenceDiagram**: Time-based interactions
- **Subgraphs**: Logical groupings
- **Styling**: Color-coded components

### Performance Indicators
- 🟢 **Green**: Optimized/cached operations
- 🟡 **Yellow**: Moderate performance impact
- 🔴 **Red**: Expensive operations
- 🔵 **Blue**: User interactions
- 🟣 **Purple**: System processes

---

*"In space, no one can hear you debug. But with these visual guides, every state update is observable, every selector is mapped, and every saga flow is charted through the Redux Galaxy."*

---

**Related**: [Chapter 2: Redux Galaxy](../chapters/02-redux-galaxy.md) | [Redux Workshops](../workshops/redux-galaxy-workshops.md)