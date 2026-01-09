# Normalization Pattern Visualizations

*"Normalization is like Marie Kondo for your state - everything has a place, and everything in its place brings joy to your selectors."*

This document provides detailed ASCII art visualizations of the normalization patterns that make zOS's state management so efficient and maintainable.

---

## Core Normalization Concepts

### 1. Before vs After Normalization

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                      THE GREAT FLATTENING                       │
│                                                                 │
│  BEFORE: Nested Nightmare                                       │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ chatApp: {                                          │       │
│  │   channels: [                                       │       │
│  │     {                                               │       │
│  │       id: "room1",                                  │       │
│  │       name: "General",                              │       │
│  │       members: [                                    │       │
│  │         { id: "user1", name: "Alice", ... },       │       │
│  │         { id: "user2", name: "Bob", ... }          │       │
│  │       ],                                            │       │
│  │       messages: [                                   │       │
│  │         {                                           │       │
│  │           id: "msg1",                               │       │
│  │           content: "Hello!",                        │       │
│  │           author: { id: "user1", name: "Alice" },  │       │
│  │           replies: [                                │       │
│  │             {                                       │       │
│  │               id: "reply1",                         │       │
│  │               content: "Hi back!",                  │       │
│  │               author: { id: "user2", name: "Bob" } │       │
│  │             }                                       │       │
│  │           ]                                         │       │
│  │         }                                           │       │
│  │       ]                                             │       │
│  │     }                                               │       │
│  │   ]                                                 │       │
│  │ }                                                   │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                 │
│                              ▼                                 │
│                    ┌─────────────────┐                         │
│                    │  NORMALIZATION  │                         │
│                    │     ENGINE      │                         │
│                    └─────────────────┘                         │
│                              │                                 │
│                              ▼                                 │
│  AFTER: Normalized Nirvana                                     │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ normalized: {                                       │       │
│  │   users: {                                          │       │
│  │     "user1": { id: "user1", name: "Alice", ... },  │       │
│  │     "user2": { id: "user2", name: "Bob", ... }     │       │
│  │   },                                                │       │
│  │   channels: {                                       │       │
│  │     "room1": {                                      │       │
│  │       id: "room1",                                  │       │
│  │       name: "General",                              │       │
│  │       members: ["user1", "user2"],                 │       │
│  │       messages: ["msg1"]                            │       │
│  │     }                                               │       │
│  │   },                                                │       │
│  │   messages: {                                       │       │
│  │     "msg1": {                                       │       │
│  │       id: "msg1",                                   │       │
│  │       content: "Hello!",                            │       │
│  │       author: "user1",                              │       │
│  │       replies: ["reply1"]                           │       │
│  │     },                                              │       │
│  │     "reply1": {                                     │       │
│  │       id: "reply1",                                 │       │
│  │       content: "Hi back!",                          │       │
│  │       author: "user2"                               │       │
│  │     }                                               │       │
│  │   }                                                 │       │
│  │ }                                                   │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘

Benefits of Normalization:
├─ Update user1's name → Only one place to change
├─ Add message to room1 → Just append to messages array
├─ Find all user2's messages → Single table scan
└─ Memory efficiency → No duplicated user objects
```

### 2. Normalization Engine Architecture

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                   NORMALIZATION ENGINE FLOW                     │
│                                                                 │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐       │
│  │ RAW API     │────▶│ NORMALIZER  │────▶│ NORMALIZED  │       │
│  │ RESPONSE    │     │ PROCESSOR   │     │ ENTITIES    │       │
│  └─────────────┘     └─────────────┘     └─────────────┘       │
│         │                     │                     │           │
│         │                     │                     │           │
│  ┌──────▼──────┐     ┌────────▼────────┐     ┌──────▼──────┐   │
│  │ Input       │     │ Processing      │     │ Output      │   │
│  │ Validation  │     │ Pipeline        │     │ Validation  │   │
│  │─────────────│     │─────────────────│     │─────────────│   │
│  │ • Check     │     │ 1. Schema       │     │ • Verify    │   │
│  │   denorm    │     │    Application  │     │   structure │   │
│  │   flag      │     │ 2. Entity       │     │ • Check     │   │
│  │ • Validate  │     │    Extraction   │     │   refs      │   │
│  │   required  │     │ 3. Reference    │     │ • Ensure    │   │
│  │   fields    │     │    Mapping      │     │   integrity │   │
│  │ • Type      │     │ 4. Relationship │     │ • Update    │   │
│  │   checking  │     │    Building     │     │   indexes   │   │
│  └─────────────┘     └─────────────────┘     └─────────────┘   │
│         │                     │                     │           │
│         │                     │                     │           │
│  ┌──────▼──────┐     ┌────────▼────────┐     ┌──────▼──────┐   │
│  │ Error       │     │ Transform       │     │ Merge       │   │
│  │ Handling    │     │ Operations      │     │ Strategy    │   │
│  │─────────────│     │─────────────────│     │─────────────│   │
│  │ • Invalid   │     │ • ID Generation │     │ • Deep      │   │
│  │   data      │     │ • Key Mapping   │     │   merge     │   │
│  │ • Missing   │     │ • Type Coercion │     │ • Preserve  │   │
│  │   schemas   │     │ • Date/Time     │     │   existing  │   │
│  │ • Circular  │     │   Formatting    │     │ • Smart     │   │
│  │   refs      │     │ • Null Handling │     │   updates   │   │
│  └─────────────┘     └─────────────────┘     └─────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Schema Definition Patterns

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                      SCHEMA ARCHITECTURE                        │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │                  ENTITY SCHEMAS                     │       │
│  │                                                     │       │
│  │  User Schema                                        │       │
│  │  ┌─────────────────────────────────────────┐       │       │
│  │  │ new nSchema.Entity('users', {           │       │       │
│  │  │   follows: [userSchema],  ──────────┐   │       │       │
│  │  │   followers: [userSchema] ──────────┼───┼──┐    │       │
│  │  │ }, {                               │   │  │    │       │
│  │  │   idAttribute: 'id'                │   │  │    │       │
│  │  │ })                                 │   │  │    │       │
│  │  └─────────────────────────────────────┼───┼──┼────┘       │
│  │                                       │   │  │            │       │
│  │  Channel Schema                       │   │  │            │       │
│  │  ┌─────────────────────────────────────┼───┼──┼────┐       │       │
│  │  │ new nSchema.Entity('channels', {   │   │  │    │       │       │
│  │  │   members: [userSchema], ──────────┘   │  │    │       │       │
│  │  │   messages: [messageSchema], ──────────┼──┼────┼──┐    │       │
│  │  │   createdBy: userSchema ───────────────┘  │    │  │    │       │
│  │  │ })                                        │    │  │    │       │
│  │  └───────────────────────────────────────────┼────┼──┼────┘       │
│  │                                              │    │  │            │
│  │  Message Schema                              │    │  │            │
│  │  ┌───────────────────────────────────────────┼────┼──┼────┐       │
│  │  │ new nSchema.Entity('messages', {         │    │  │    │       │
│  │  │   author: userSchema, ───────────────────┘    │  │    │       │
│  │  │   replies: [messageSchema], ──────────────────┼──┼────┼──┐    │
│  │  │   parentMessage: messageSchema ───────────────┘  │    │  │    │
│  │  │ })                                              │    │  │    │
│  │  └─────────────────────────────────────────────────┼────┼──┼────┘
│  │                                                    │    │  │    │
│  └────────────────────────────────────────────────────┼────┼──┼────┘
│                                                       │    │  │    │
│  ┌────────────────────────────────────────────────────┼────┼──┼────┐
│  │               RELATIONSHIP MAPPING                 │    │  │    │
│  │                                                    │    │  │    │
│  │  Self-References (Circular)        ───────────────┘    │  │    │
│  │  ├─ User follows/followers                             │  │    │
│  │  └─ Message replies/parent                             │  │    │
│  │                                                        │  │    │
│  │  Cross-Entity References          ────────────────────┘  │    │
│  │  ├─ Channel → Users (members)                            │    │
│  │  ├─ Channel → Messages                                   │    │
│  │  └─ Message → User (author)                              │    │
│  │                                                          │    │
│  │  Complex Relationships           ───────────────────────┘    │
│  │  ├─ Many-to-Many (Channel members)                           │
│  │  ├─ One-to-Many (User messages)                              │
│  │  └─ Hierarchical (Message threads) ────────────────────────┘
│  └─────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘

Schema Patterns:
├─ ──────── = Entity relationships
├─ ┌──────┐ = Schema definitions
└─ Circular = Self-referencing entities
```

---

## Advanced Normalization Patterns

### 4. The Merge-First Strategy

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                    MERGE-FIRST ALGORITHM                        │
│                                                                 │
│  SCENARIO: User updates profile picture                         │
│                                                                 │
│  EXISTING STATE:                                                │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ users: {                                            │       │
│  │   "user1": {                                        │       │
│  │     id: "user1",                                    │       │
│  │     name: "Alice",                                  │       │
│  │     email: "alice@example.com",                     │       │
│  │     avatar: "old-avatar.jpg",                       │       │
│  │     bio: "Love coding!",                            │       │
│  │     preferences: { theme: "dark", ... },           │       │
│  │     lastSeen: "2024-01-01T10:00:00Z"               │       │
│  │   }                                                 │       │
│  │ }                                                   │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                 │
│                              ▼                                 │
│  INCOMING UPDATE:                                               │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ users: {                                            │       │
│  │   "user1": {                                        │       │
│  │     id: "user1",                                    │       │
│  │     avatar: "new-avatar.jpg",                       │       │
│  │     lastModified: "2024-01-01T11:00:00Z"           │       │
│  │   }                                                 │       │
│  │ }                                                   │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              MERGE ALGORITHM                        │       │
│  │                                                     │       │
│  │  for entityId in newEntities:                      │       │
│  │    existing = state[entityId] || {}                │       │
│  │    merged = {                                       │       │
│  │      ...existing,     ← Keep all existing fields   │       │
│  │      ...newEntity     ← Overlay new/changed fields │       │
│  │    }                                                │       │
│  │    state[entityId] = merged                         │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                 │
│                              ▼                                 │
│  RESULT STATE:                                                  │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ users: {                                            │       │
│  │   "user1": {                                        │       │
│  │     id: "user1",                                    │       │
│  │     name: "Alice",           ← PRESERVED            │       │
│  │     email: "alice@example.com", ← PRESERVED         │       │
│  │     avatar: "new-avatar.jpg",    ← UPDATED          │       │
│  │     bio: "Love coding!",     ← PRESERVED            │       │
│  │     preferences: { theme: "dark", ... }, ← PRESERVED│       │
│  │     lastSeen: "2024-01-01T10:00:00Z", ← PRESERVED   │       │
│  │     lastModified: "2024-01-01T11:00:00Z" ← ADDED    │       │
│  │   }                                                 │       │
│  │ }                                                   │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘

Merge Benefits:
├─ No data loss from partial updates
├─ Graceful handling of concurrent updates  
├─ Preserved relationships and references
└─ Optimal for real-time environments
```

### 5. Denormalization Safety Mechanisms

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                   DENORMALIZATION SAFETY NET                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │                SAFE DENORMALIZATION                 │       │
│  │                                                     │       │
│  │  1. Extract entity from normalized state            │       │
│  │     normalized.users["user1"]                       │       │
│  │                    │                                │       │
│  │                    ▼                                │       │
│  │  2. Recursively resolve references                  │       │
│  │     user.follows → [user2, user3, ...]             │       │
│  │                    │                                │       │
│  │                    ▼                                │       │
│  │  3. Mark as denormalized                            │       │
│  │     user.__denormalized = true                      │       │
│  │                    │                                │       │
│  │                    ▼                                │       │
│  │  4. Return nested object                            │       │
│  │     {                                               │       │
│  │       id: "user1",                                  │       │
│  │       follows: [                                    │       │
│  │         { id: "user2", name: "Bob", ... },         │       │
│  │         { id: "user3", name: "Carol", ... }        │       │
│  │       ],                                            │       │
│  │       __denormalized: true                          │       │
│  │     }                                               │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              SAFETY VALIDATION                      │       │
│  │                                                     │       │
│  │  normalize(denormalizedData) {                      │       │
│  │    if (data.__denormalized) {                       │       │
│  │      throw new Error(                               │       │
│  │        "Attempted to normalize denormalized data!"  │       │
│  │      );                                             │       │
│  │    }                                                │       │
│  │    // ... proceed with normalization               │       │
│  │  }                                                  │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │               ERROR PREVENTION                      │       │
│  │                                                     │       │
│  │  Prevents:                                          │       │
│  │  ├─ Infinite normalization loops                    │       │
│  │  ├─ Data corruption from re-processing              │       │
│  │  ├─ Performance degradation                         │       │
│  │  └─ State inconsistencies                           │       │
│  │                                                     │       │
│  │  Example Error Scenario:                            │       │
│  │  ┌─────────────────────────────────────────┐       │       │
│  │  │ // BAD: This would cause infinite loop  │       │       │
│  │  │ const user = denormalize("user1", state)│       │       │
│  │  │ normalize(user) // ERROR! __denormalized │       │       │       │
│  │  │ flag prevents this                       │       │       │
│  │  └─────────────────────────────────────────┘       │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## State Update Patterns

### 6. Batch Processing Pipeline

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                      BATCH PROCESSING FLOW                      │
│                                                                 │
│  HIGH-FREQUENCY EVENTS                                          │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐                   │
│  │Event1│ │Event2│ │Event3│ │Event4│ │Event5│ ...               │
│  └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘ └──┬───┘                   │
│     │        │        │        │        │                       │
│     ▼        ▼        ▼        ▼        ▼                       │
│  ┌─────────────────────────────────────────────────────┐       │
│  │               EVENT COLLECTOR                       │       │
│  │                                                     │       │
│  │  Buffer: [event1, event2, event3, ...]             │       │
│  │  Timer: 500ms countdown                             │       │  
│  │  Size:  Current buffer size                         │       │
│  │                                                     │       │
│  │  Triggers:                                          │       │
│  │  ├─ Buffer full (100 events)                        │       │
│  │  ├─ Timer expires (500ms)                           │       │
│  │  └─ Critical event received                         │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              BATCH PROCESSOR                        │       │
│  │                                                     │       │
│  │  1. Group by Entity Type                            │       │
│  │     ┌─────────┐ ┌─────────┐ ┌─────────┐            │       │
│  │     │ Users   │ │Channels │ │Messages │            │       │
│  │     │ Events  │ │ Events  │ │ Events  │            │       │
│  │     └─────────┘ └─────────┘ └─────────┘            │       │
│  │                                                     │       │
│  │  2. Deduplicate Updates                             │       │
│  │     user1: [update1, update2, update3]             │       │
│  │            ↓                                        │       │
│  │     user1: merged_update                            │       │
│  │                                                     │       │
│  │  3. Normalize All Entities                          │       │
│  │     Individual → Normalized → Merged               │       │
│  │                                                     │       │
│  │  4. Build Single Update Payload                     │       │
│  │     {                                               │       │
│  │       users: { ... },                              │       │
│  │       channels: { ... },                           │       │
│  │       messages: { ... }                            │       │
│  │     }                                               │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │           SINGLE STATE UPDATE                       │       │
│  │                                                     │       │
│  │  dispatch(normalized.receive(batchPayload))         │       │
│  │                                                     │       │
│  │  Result: One Redux update instead of 100+          │       │
│  │          One re-render cycle instead of 100+       │       │
│  │          Consistent state across all entities      │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘

Performance Impact:
├─ Before: 100 events = 100 updates = 100 re-renders
└─ After:  100 events = 1 batched update = 1 re-render
```

### 7. Relationship Integrity Management

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                 RELATIONSHIP INTEGRITY SYSTEM                   │
│                                                                 │
│  SCENARIO: User leaves a channel                                │
│                                                                 │
│  BEFORE: Broken References                                      │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ channels: {                                         │       │
│  │   "room1": {                                        │       │
│  │     members: ["user1", "user2", "user3"] ← STALE   │       │
│  │   }                                                 │       │
│  │ },                                                  │       │
│  │ users: {                                            │       │  
│  │   "user2": {                                        │       │
│  │     channels: ["room1", "room2"] ← INCONSISTENT    │       │
│  │   }                                                 │       │
│  │ }                                                   │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │           INTEGRITY PROCESSOR                       │       │
│  │                                                     │       │
│  │  1. Detect Relationship Change                      │       │
│  │     ┌───────────────────────────────────────┐       │       │
│  │     │ Event: user2 left room1               │       │       │
│  │     │ Impact: channel.members, user.channels│       │       │
│  │     └───────────────────────────────────────┘       │       │
│  │                              │                      │       │
│  │                              ▼                      │       │
│  │  2. Calculate Cascading Updates                     │       │
│  │     ┌───────────────────────────────────────┐       │       │
│  │     │ Update 1: Remove user2 from room1     │       │       │
│  │     │ Update 2: Remove room1 from user2     │       │       │
│  │     │ Update 3: Update member count          │       │       │
│  │     │ Update 4: Update last activity        │       │       │
│  │     └───────────────────────────────────────┘       │       │
│  │                              │                      │       │
│  │                              ▼                      │       │
│  │  3. Apply Atomic Updates                            │       │
│  │     ┌───────────────────────────────────────┐       │       │
│  │     │ Transaction: All updates or none      │       │       │
│  │     │ Validation: Check constraints          │       │       │
│  │     │ Rollback: If any update fails         │       │       │
│  │     └───────────────────────────────────────┘       │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                 │
│                              ▼                                 │
│  AFTER: Consistent State                                        │
│  ┌─────────────────────────────────────────────────────┐       │
│  │ channels: {                                         │       │
│  │   "room1": {                                        │       │
│  │     members: ["user1", "user3"], ← UPDATED          │       │
│  │     memberCount: 2 ← UPDATED                        │       │
│  │   }                                                 │       │
│  │ },                                                  │       │
│  │ users: {                                            │       │
│  │   "user2": {                                        │       │
│  │     channels: ["room2"] ← UPDATED                   │       │
│  │   }                                                 │       │
│  │ }                                                   │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘

Integrity Guarantees:
├─ Referential consistency across all entities
├─ Atomic updates for related changes
├─ Automatic cascade handling
└─ Rollback on constraint violations
```

---

## Performance Optimization Patterns

### 8. Selector Memoization Architecture

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                    SELECTOR MEMOIZATION FLOW                    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │                COMPONENT TREE                       │       │
│  │                                                     │       │
│  │      Component A          Component B               │       │
│  │      ┌─────────┐          ┌─────────┐               │       │
│  │      │ useUser │          │ useUser │               │       │
│  │      │("user1")│          │("user1")│               │       │
│  │      └────┬────┘          └────┬────┘               │       │
│  │           │                    │                     │       │
│  │           ▼                    ▼                     │       │
│  │      ┌─────────┐          ┌─────────┐               │       │
│  │      │Selector │          │Selector │               │       │
│  │      │Instance1│          │Instance2│               │       │
│  │      └────┬────┘          └────┬────┘               │       │
│  │           │                    │                     │       │
│  │           └────────┬───────────┘                     │       │
│  │                    │                                 │       │
│  └────────────────────┼─────────────────────────────────┘       │
│                       │                                         │
│                       ▼                                         │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              MEMOIZATION LAYER                      │       │
│  │                                                     │       │
│  │  Instance 1 Cache:                                  │       │
│  │  ┌─────────────────────────────────────────┐       │       │
│  │  │ Input:  (state, "user1")                │       │       │
│  │  │ Hash:   "abc123..."                     │       │       │
│  │  │ Output: { id: "user1", name: "Alice" }  │       │       │
│  │  │ Refs:   Same object reference           │       │       │
│  │  └─────────────────────────────────────────┘       │       │
│  │                                                     │       │
│  │  Instance 2 Cache:                                  │       │
│  │  ┌─────────────────────────────────────────┐       │       │
│  │  │ Input:  (state, "user1")                │       │       │
│  │  │ Hash:   "abc123..."                     │       │       │
│  │  │ Output: { id: "user1", name: "Alice" }  │       │       │
│  │  │ Refs:   Same object reference           │       │       │
│  │  └─────────────────────────────────────────┘       │       │
│  └─────────────────────────────────────────────────────┘       │
│                       │                                         │
│                       ▼                                         │
│  ┌─────────────────────────────────────────────────────┐       │
│  │               CACHE BEHAVIOR                        │       │
│  │                                                     │       │
│  │  State Change: users.user1.name → "Alice Updated"   │       │
│  │                                                     │       │
│  │  Cache Miss: New input hash detected               │       │
│  │  ├─ Instance 1: Recompute & cache                  │       │
│  │  └─ Instance 2: Recompute & cache                  │       │
│  │                                                     │       │
│  │  Result: Both components get new data              │       │
│  │                                                     │       │
│  │  Optimization: If user1.email changes (unused)     │       │
│  │  ├─ Selector doesn't include email                 │       │
│  │  ├─ Cache hit: Same input hash                     │       │
│  │  └─ No recomputation needed                        │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘

Memoization Benefits:
├─ Instance isolation prevents cache conflicts
├─ Stable references reduce component re-renders  
├─ Selective field watching optimizes updates
└─ Shared computation across component instances
```

### 9. Update Optimization Patterns

```ascii
┌─────────────────────────────────────────────────────────────────┐
│                    UPDATE OPTIMIZATION FLOW                     │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              INCOMING UPDATE STREAM                 │       │
│  │                                                     │       │
│  │  Real-time Events:                                  │       │
│  │  ┌──────────────────────────────────────────┐      │       │
│  │  │ 10:01:00 - user1 typing in room1        │      │       │
│  │  │ 10:01:05 - user1 stopped typing         │      │       │
│  │  │ 10:01:10 - user2 typing in room1        │      │       │
│  │  │ 10:01:12 - user1 sent message           │      │       │
│  │  │ 10:01:13 - user2 stopped typing         │      │       │
│  │  │ 10:01:15 - user3 joined room1           │      │       │
│  │  │ 10:01:20 - user1 read message           │      │       │
│  │  │ ... (hundreds more events)              │      │       │
│  │  └──────────────────────────────────────────┘      │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │             SMART FILTERING                         │       │
│  │                                                     │       │
│  │  1. Event Priority Classification                   │       │
│  │     ┌───────────────────────────────────────┐       │       │
│  │     │ High Priority: Messages, Joins        │       │       │
│  │     │ Med Priority:  Status, Reactions      │       │       │
│  │     │ Low Priority:  Typing, Read Receipts  │       │       │
│  │     └───────────────────────────────────────┘       │       │
│  │                                                     │       │
│  │  2. Temporal Deduplication                          │       │
│  │     ┌───────────────────────────────────────┐       │       │
│  │     │ user1 typing → user1 stopped typing   │       │       │
│  │     │ Result: Skip both (net zero)          │       │       │
│  │     └───────────────────────────────────────┘       │       │
│  │                                                     │       │
│  │  3. Relevance Filtering                             │       │
│  │     ┌───────────────────────────────────────┐       │       │
│  │     │ If user not viewing room1:             │       │       │
│  │     │ ├─ Skip typing events                  │       │       │
│  │     │ ├─ Keep message events                 │       │       │
│  │     │ └─ Queue status updates                │       │       │
│  │     └───────────────────────────────────────┘       │       │
│  └─────────────────────────────────────────────────────┘       │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────┐       │
│  │              BATCH OPTIMIZATION                     │       │
│  │                                                     │       │
│  │  Original: 1000 events → 1000 state updates        │       │
│  │            ▼                                        │       │
│  │  Filtered:  200 events → Batch processing          │       │
│  │            ▼                                        │       │
│  │  Batched:    10 batches → 10 state updates         │       │
│  │            ▼                                        │       │
│  │  Result: 99% reduction in update cycles            │       │
│  │                                                     │       │
│  │  Performance Impact:                                │       │
│  │  ├─ UI: 10 re-renders instead of 1000              │       │
│  │  ├─ CPU: 90% less processing                       │       │
│  │  ├─ Memory: 80% less object creation                │       │
│  │  └─ Battery: Significant power savings             │       │
│  └─────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## Quick Reference: Normalization Symbols

### ASCII Diagram Legend
```ascii
Entity Representations:
┌────────┐ = Entity/Schema definition
│ Entity │   with properties and methods
└────────┘

┌─┐ = Compact entity    ◄──── = One-to-many relationship  
└─┘   reference        ────▶ = Many-to-one relationship
                       ◄───▶ = Many-to-many relationship

Data Flow Indicators:
───▶ = Data transformation    ┌─────┐ = Process box
◄─── = Reverse mapping       │ Proc │   with operations
▼▲   = Vertical flow         └─────┘

State Representations:
┌───────────────┐ = State structure
│ key: value    │   with nested data
│ nested: {...} │
└───────────────┘

Performance Indicators:
├─ = List item/benefit        🟢 = Optimized operation
└─ = Terminal list item       🔴 = Expensive operation
```

### Normalization Process Flow
```ascii
Raw Data → Validation → Schema → Entities → References → State
    ▲           ▲          ▲         ▲          ▲         ▲
    │           │          │         │          │         │
   JSON      __denorm    Apply     Extract    Build      Merge
   Input      Check      Rules     Objects    Links      First
```

---

*"Normalization is not just about flat data structures - it's about creating a universe where every piece of information has exactly one source of truth, and every relationship is a well-maintained highway between entities."*

---

**Related**: [Redux Galaxy Visuals](./redux-galaxy-visuals.md) | [Redux-Saga Flows](./redux-saga-flows.md) | [Chapter 2: Redux Galaxy](../chapters/02-redux-galaxy.md)