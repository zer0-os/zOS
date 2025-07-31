# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Build and Run
- **Development**: `npm start` - Runs the app with Vite
- **Build**: `npm run build` - TypeScript check and Vite build
- **Legacy Builds**: `npm run start:legacy` or `npm run build:legacy` - Uses craco with OpenSSL legacy provider

### Testing
- **Jest Tests**: `npm test` - Runs Jest tests (*.test.tsx, *.test.ts)
- **Vitest Tests**: `npm run test:vitest` - Runs Vitest tests (*.vitest.tsx, *.vitest.ts)
- **Single Test**: `npm test -- --testNamePattern="test name"`

### Code Quality
- **Lint**: `npm run lint` - ESLint check
- **Lint Fix**: `npm run lint:fix` - Auto-fix ESLint issues
- **Format**: `npm run code-format:fix` - Prettier formatting
- **Format Check**: `npm run code-format:validate` - Check Prettier formatting

### Mock Generation
- **Generate Mocks**: `BUILD_MOCKS=true npm test -- --watchAll=false src/app-sandbox/index.test.tsx`

## Architecture Overview

### Redux-Based Architecture
The application follows a Redux-Saga architecture with normalized state management:
- **Components**: Presentational React components in `/src/components/`
- **Connected Components**: Container components with Redux connections
- **Redux Store**: State management in `/src/store/` with feature-based organization
- **Sagas**: Side effects handled by redux-saga
- **Normalizr**: Entity normalization for consistent state shape

### Key Directories
- **`/src/apps/`**: Core application modules (feed, messenger, wallet, staking, etc.)
- **`/src/store/`**: Redux state management, organized by feature
- **`/src/lib/`**: Shared utilities and hooks
- **`/src/components/`**: Reusable UI components
- **`/src/authentication/`**: Auth flows and components

### External App Integration
Apps can be integrated as external components using the ExternalApp wrapper:
1. Create folder in `/src/apps/your-app/`
2. Add to AppRouter in `/src/apps/app-router.tsx`
3. Add navigation in AppBar component

### Matrix Integration
The app uses Matrix for chat functionality:
- Matrix client configuration in `/src/lib/chat/matrix/`
- Home server URL configured via `REACT_APP_MATRIX_HOME_SERVER_URL`
- Sliding sync support for improved performance

### Web3 Integration
- **Wagmi & RainbowKit**: Wallet connection and management
- **Thirdweb**: Additional Web3 functionality
- **Chains**: Multi-chain support configured in `/src/lib/web3/`

### Testing Approach
- **Jest**: Used for unit tests with Enzyme (legacy)
- **Vitest**: Modern test runner for newer tests
- **Test Utils**: Testing utilities in `/src/test-utils.tsx`
- **Redux Testing**: redux-saga-test-plan for saga testing

### Build Configuration
- **Vite**: Primary build tool with React SWC plugin
- **Craco**: Legacy build support for compatibility
- **Environment Variables**: Prefixed with `REACT_APP_`
- **Node Polyfills**: Enabled for Web3 compatibility

## Key Patterns

### Component Structure
```typescript
// Presentational component
const Component = ({ prop }) => <div>{prop}</div>;

// Connected component (container)
const Container = connect(mapStateToProps, mapDispatchToProps)(Component);
```

### Redux-Saga Pattern
```typescript
function* saga() {
  yield takeEvery(ACTION_TYPE, function* (action) {
    try {
      const result = yield call(api.method, action.payload);
      yield put(successAction(result));
    } catch (error) {
      yield put(errorAction(error));
    }
  });
}
```

### Normalized State
Entities are normalized using normalizr schemas for consistent access patterns.

### Module CSS
Components use CSS modules (*.module.scss) for scoped styling.

## Agent Communication Guidelines

### Inter-Agent Communication
- **`./agents-only/`**: Designated directory for semaphores, control flows, job requests, and any form of inter-agent communication
- **Flexibility**: Agents are free to create any necessary communication artifacts in this directory, including codes.

## Deliverables Management
- **Opus Docs Location**: Use `./opusdocs/` as the production location for deliverables
- **Named Versions**: Multiple named versions of files are permitted

## Development Naming Conventions
- Don't capitalize filenames, use standard naming conventions
- Always use lowercase for file and directory names
- Prefer kebab-case or snake_case for multi-word filenames

## Workspace Guides
- **Opus Docs Usage**: 
  - USE `./opusdocs/new-recruits/` to generate necessary and requested files (documentation, prompts, notes, dev-logs) for new developers who are already coding full stack web apps
