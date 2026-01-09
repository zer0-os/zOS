# The Hitchhiker's Guide to zOS - Quick Reference

*"A towel, it says, is about the most massively useful thing an interstellar hitchhiker can have. A good quick reference is about the most massively useful thing a developer can have."*

This directory contains quick reference materials, cheat sheets, and lookup resources for zOS development. When you need to find something fast, this is your towel.

## Reference Categories

### 📚 Core References
Essential lookup materials for daily development.

- **[API Reference](./api-reference.md)** - Complete API documentation
- **[Pattern Quick Reference](./pattern-quick-reference.md)** - Common patterns at a glance
- **[TypeScript Cheat Sheet](./typescript-cheat-sheet.md)** - zOS-specific TypeScript patterns
- **[Redux Flow Diagrams](./redux-flow-diagrams.md)** - Visual flowcharts for state management

### 🔧 Development Tools
References for development workflow and tooling.

- **[CLI Commands](./cli-commands.md)** - Essential command-line operations
- **[Debugging Guide](./debugging-guide.md)** - Systematic debugging approaches
- **[IDE Setup](./ide-setup.md)** - Optimal development environment configuration
- **[Error Code Reference](./error-code-reference.md)** - Common errors and solutions

### 🌐 Integration References
Quick guides for external service integration.

- **[Matrix Protocol Reference](./matrix-protocol-reference.md)** - Matrix SDK usage patterns
- **[Web3 Integration Guide](./web3-integration-guide.md)** - Blockchain integration essentials
- **[Testing Reference](./testing-reference.md)** - Testing utilities and patterns

### 📋 Cheat Sheets
One-page references for specific topics.

- **[Redux-Saga Effects](./redux-saga-effects.md)** - All saga effects with examples
- **[Selector Patterns](./selector-patterns.md)** - Common selector compositions
- **[Component Patterns](./component-patterns.md)** - React component best practices
- **[Performance Optimization](./performance-optimization.md)** - Quick performance wins

## Quick Navigation by Task

### "I need to..."

#### State Management
- **Add new entity type** → [Entity Schema Reference](./entity-schema-reference.md)
- **Create complex selector** → [Selector Patterns](./selector-patterns.md)
- **Handle async operation** → [Redux-Saga Effects](./redux-saga-effects.md)
- **Debug state changes** → [Redux DevTools Guide](./redux-devtools-guide.md)

#### Real-time Features
- **Send Matrix message** → [Matrix Quick Start](./matrix-quick-start.md)
- **Handle Matrix events** → [Matrix Event Reference](./matrix-event-reference.md)
- **Implement typing indicators** → [Real-time Patterns](./realtime-patterns.md)
- **Debug connection issues** → [Matrix Debugging](./matrix-debugging.md)

#### Web3 Integration
- **Connect wallet** → [Wallet Connection Guide](./wallet-connection-guide.md)
- **Send transaction** → [Transaction Patterns](./transaction-patterns.md)
- **Handle errors** → [Web3 Error Reference](./web3-error-reference.md)
- **Test blockchain features** → [Web3 Testing Guide](./web3-testing-guide.md)

#### Component Development
- **Create new component** → [Component Checklist](./component-checklist.md)
- **Optimize performance** → [Performance Optimization](./performance-optimization.md)
- **Handle errors** → [Error Boundary Patterns](./error-boundary-patterns.md)
- **Test components** → [Component Testing Guide](./component-testing-guide.md)

#### Testing
- **Test saga flows** → [Saga Testing Reference](./saga-testing-reference.md)
- **Mock external services** → [Mocking Patterns](./mocking-patterns.md)
- **Write integration tests** → [Integration Testing Guide](./integration-testing-guide.md)
- **Debug test failures** → [Test Debugging Guide](./test-debugging-guide.md)

#### Production & Deployment
- **Monitor performance** → [Monitoring Setup](./monitoring-setup.md)
- **Handle errors** → [Error Tracking Guide](./error-tracking-guide.md)
- **Deploy features** → [Deployment Checklist](./deployment-checklist.md)
- **Troubleshoot issues** → [Production Troubleshooting](./production-troubleshooting.md)

## Reference Format

Each reference document follows a consistent format for quick scanning:

### Quick Reference Template
```markdown
# Topic Quick Reference

## TL;DR
The essential information in 2-3 bullets.

## Common Patterns
Most frequently used patterns with code examples.

## API Summary
Key functions/methods with signatures and examples.

## Troubleshooting
Common issues and their solutions.

## See Also
Links to related references and deeper documentation.
```

## Glossary and Terminology

### [Complete Glossary](./glossary.md)
Comprehensive definitions of all terms used in zOS development.

### Quick Term Lookup
Most commonly referenced terms:

- **Action**: Redux action object describing state changes
- **Effect**: Redux-Saga instruction for side effects
- **Entity**: Normalized data object with unique ID
- **Saga**: Generator function handling async operations
- **Selector**: Function to extract data from Redux state
- **Slice**: Redux Toolkit feature-specific state manager

## Keyboard Shortcuts and Commands

### Development Environment
```bash
# Start development server
npm run dev

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint

# Build for production
npm run build
```

### IDE Shortcuts (VSCode)
- **Go to Definition**: `F12`
- **Find References**: `Shift+F12`
- **Refactor**: `F2`
- **Quick Fix**: `Ctrl+.` (Cmd+. on Mac)
- **Format Document**: `Alt+Shift+F`

### Redux DevTools
- **Time Travel**: Click on any action in the log
- **State Diff**: Toggle diff view to see changes
- **Trace**: Enable to see component update causes
- **Persist**: Keep state between page reloads

## Common Code Snippets

### Redux-Saga Patterns
```typescript
// Basic saga flow
function* handleAction(action: PayloadAction<Data>) {
  try {
    const result = yield call(api.fetchData, action.payload);
    yield put(actionSuccess(result));
  } catch (error) {
    yield put(actionFailure(error.message));
  }
}

// Optimistic update pattern
function* optimisticUpdate(action: PayloadAction<UpdateData>) {
  yield put(applyOptimisticUpdate(action.payload));
  try {
    const result = yield call(api.update, action.payload);
    yield put(confirmUpdate(result));
  } catch (error) {
    yield put(revertOptimisticUpdate(action.payload));
    yield put(updateError(error.message));
  }
}
```

### Selector Patterns
```typescript
// Basic entity selector
const selectUser = (state: RootState, userId: string) =>
  state.normalized.users[userId];

// Memoized derived data
const selectUserWithChannels = createSelector(
  [selectUser, selectUserChannels],
  (user, channels) => ({ ...user, channels })
);

// Cross-slice selector
const selectConversationWithUsers = createSelector(
  [selectConversation, selectUsers],
  (conversation, users) => ({
    ...conversation,
    participants: conversation.participantIds.map(id => users[id])
  })
);
```

### Component Patterns
```typescript
// Container component pattern
const UserProfileContainer = ({ userId }: { userId: string }) => {
  const user = useSelector(state => selectUser(state, userId));
  const dispatch = useDispatch();
  
  const handleUpdate = useCallback(
    (updates: UserUpdates) => dispatch(updateUser({ userId, updates })),
    [dispatch, userId]
  );
  
  return <UserProfile user={user} onUpdate={handleUpdate} />;
};

// Custom hook pattern
const useUserProfile = (userId: string) => {
  const user = useSelector(state => selectUser(state, userId));
  const dispatch = useDispatch();
  
  const updateUser = useCallback(
    (updates: UserUpdates) => dispatch(updateUserAction({ userId, updates })),
    [dispatch, userId]
  );
  
  return { user, updateUser };
};
```

## File and Directory Structure Reference

### Key Directories
```
src/
├── apps/                 # Feature applications
├── components/          # Shared components
├── lib/                 # Utility functions and services
├── store/               # Redux store and slices
│   ├── normalized/      # Normalized entity state
│   ├── [feature]/       # Feature-specific state
│   └── saga.ts         # Root saga
├── types/               # TypeScript type definitions
└── test/                # Test utilities and setup
```

### Naming Conventions
- **Components**: PascalCase (`UserProfile`, `MessageList`)
- **Files**: kebab-case (`user-profile.tsx`, `message-list.scss`)
- **Hooks**: camelCase starting with 'use' (`useUserProfile`)
- **Actions**: camelCase (`updateUser`, `sendMessage`)
- **Selectors**: camelCase starting with 'select' (`selectUser`)

## Environment Configuration

### Development
```bash
NODE_ENV=development
REACT_APP_API_URL=http://localhost:3001
REACT_APP_MATRIX_HOMESERVER=https://matrix.dev.example.com
REACT_APP_WEB3_NETWORK=sepolia
```

### Production
```bash
NODE_ENV=production
REACT_APP_API_URL=https://api.zos.example.com
REACT_APP_MATRIX_HOMESERVER=https://matrix.zos.example.com
REACT_APP_WEB3_NETWORK=mainnet
```

## Performance Benchmarks

### Bundle Size Targets
- **Initial Bundle**: < 500KB gzipped
- **Feature Chunks**: < 100KB gzipped
- **Vendor Chunks**: < 300KB gzipped

### Runtime Performance
- **First Contentful Paint**: < 1s
- **Time to Interactive**: < 3s
- **Component Render**: < 16ms (60fps)

### Memory Usage
- **Initial Load**: < 50MB
- **After 30min Usage**: < 100MB
- **Memory Leaks**: None detected

## Browser Support

### Supported Browsers
- **Chrome**: 88+
- **Firefox**: 85+
- **Safari**: 14+
- **Edge**: 88+

### Required Features
- ES2020 support
- WebAssembly
- IndexedDB
- WebRTC (for Matrix calls)
- Crypto API (for encryption)

## External Dependencies

### Core Dependencies
```json
{
  "react": "^18.0.0",
  "redux": "^4.2.0",
  "redux-saga": "^1.2.0",
  "normalizr": "^3.6.0",
  "matrix-js-sdk": "^24.0.0"
}
```

### Development Dependencies
```json
{
  "typescript": "^4.9.0",
  "@testing-library/react": "^13.0.0",
  "vitest": "^0.28.0",
  "eslint": "^8.0.0"
}
```

---

*"Don't Panic" - and when you do panic, check the quick reference first.*

*"Time is an illusion. Lunchtime doubly so. But deadlines are real, so use these references to work efficiently." - The Editors*

---

## Meta Information

**Last Updated**: 2025-07-31
**Contributors**: Guide Architect, Pattern Explorer, Integration Synthesizer
**Review Cycle**: Monthly updates, continuous improvement
**Feedback**: Submit improvements via issues or pull requests

## External Resources

- **[Redux Toolkit RTK Query](https://redux-toolkit.js.org/rtk-query/overview)** - Modern Redux patterns
- **[React 18 Features](https://reactjs.org/blog/2022/03/29/react-v18.html)** - Latest React capabilities
- **[Matrix Specification](https://matrix.org/docs/spec/)** - Matrix protocol details
- **[Web3 Best Practices](https://consensys.github.io/smart-contract-best-practices/)** - Blockchain development
- **[TypeScript Handbook](https://www.typescriptlang.org/docs/)** - TypeScript reference
- **[Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)** - WCAG 2.1 reference