# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

ZERO (zOS) is a flexible application platform for interacting with the Zer0 ecosystem, built with React, TypeScript, and Redux Saga. It features a modular app architecture with integrated messaging (Matrix protocol), Web3 wallet functionality, and social features.

## Development Commands

### Setup

```bash
# Install dependencies (requires GitHub Personal Access Token with read:package scope)
npm config set //npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
npm install --legacy-peer-deps

# Copy and configure environment variables
cp .env.example .env
```

### Running the Application

```bash
npm start                    # Start development server (Vite)
npm run start:legacy        # Start with legacy OpenSSL provider (if needed)
npm run electron:start      # Start Electron app
```

### Build

```bash
npm run build               # Production build (requires up to 6GB memory)
npm run build:legacy        # Build with legacy OpenSSL provider
```

### Testing

```bash
npm test                    # Run Jest tests
npm run test:vitest        # Run Vitest tests (files matching *.vitest.*)
```

### Code Quality

```bash
npm run lint                # Lint TypeScript/React code
npm run lint:fix            # Auto-fix linting issues
npm run code-format:validate # Check code formatting
npm run code-format:fix     # Auto-format code with Prettier
```

### Other Commands

```bash
npm run generate-mocks      # Generate mock data for testing
```

## Technology Stack

- **Build System**: Vite (migrated from Create React App)
- **React**: v18 with TypeScript
- **State Management**: Redux Toolkit + Redux Saga
- **Routing**: React Router v5
- **Matrix SDK**: Matrix-js-sdk for chat/messaging
- **Web3**: Ethers.js, Wagmi, RainbowKit for blockchain integration
- **UI**: Custom components with @zero-tech/zui library
- **Styling**: SCSS with BEM methodology
- **Testing**: Jest (legacy) and Vitest (new tests)

## Architecture

### Component, Redux, Saga, Normalizr Pattern

The application follows a unidirectional data flow architecture:

1. **Components** display data and handle user input (no business logic)
2. **Redux Store** (`src/store/`) manages global state with domain-specific slices
3. **Sagas** (`src/store/*/saga.ts`) handle business logic, async operations, and side effects
4. **Normalizr** manages relational data in a normalized state structure

### Key Architectural Patterns

**Normalized State**: Data (users, channels, messages) is stored in a normalized format to avoid duplication:

- `state.normalized.users` - User entities keyed by ID
- `state.normalized.channels` - Channel entities keyed by ID
- `state.normalized.messages` - Message entities keyed by ID

**Redux Saga**: All business logic and async operations run in sagas, not thunks or components. Sagas provide better testability and handle complex concurrency scenarios.

**Store Structure**: Each domain has its own folder in `src/store/` containing:

- `index.ts` - Redux slice with actions and reducers
- `saga.ts` - Business logic and side effects
- `selectors.ts` - Reusable state selectors (if needed)

### Directory Structure

```
src/
├── apps/              # Application modules (Feed, Messenger, Wallet, etc.)
│   ├── app-router.tsx # Main app routing
│   └── */index.tsx    # Individual app components
├── components/        # Reusable UI components
├── store/             # Redux slices and sagas
│   ├── index.ts       # Store configuration
│   ├── saga.ts        # Root saga
│   ├── reducer.ts     # Root reducer
│   └── */             # Domain-specific state modules
├── lib/               # Utility functions and helpers
├── authentication/    # Auth-related components
└── pages/             # Top-level page components
```

### Apps vs Components

- **Apps** (`src/apps/`) are route-based features (Messenger, Feed, Wallet, Profile, etc.)
- **Components** (`src/components/`) are reusable UI elements shared across apps
- Apps are registered in `src/apps/app-router.tsx` and mapped to routes

### Styling with BEM

All styles use SCSS with BEM (Block Element Modifier) naming:

```tsx
import { bem } from '../../lib/bem';
const c = bem('component-name');

<div className={c('')}>
  <h3 className={c('heading')}>Title</h3>
  <div className={c('content', isActive && 'active')}>...</div>
</div>;
```

SCSS files mirror the component structure:

```scss
.component-name {
  &__heading { ... }
  &__content { ... }
  &__content--active { ... }
}
```

Import theme variables from `@zero-tech/zui`:

```scss
@use '~@zero-tech/zui/styles/theme' as theme;
```

## Component Guidelines

### Function vs Class Components

- **Function components**: Simple components with minimal logic (max 15-20 lines excluding markup)
- **Class components**: Complex components requiring significant logic or lifecycle methods

### Hooks

- Keep custom hooks under 15-20 lines
- Do not nest custom hooks (cannot call a custom hook from another hook)
- No business logic in hooks (only rendering/UI-related logic)
- Do not use hooks for external dependencies or global state interaction

### Connected Components

Use Redux `useSelector` and `useDispatch` hooks to connect components to the store. Keep mapStateToProps logic in selector functions when possible.

## State Management

### Creating a New Redux Slice

1. Create folder in `src/store/<domain-name>/`
2. Add `index.ts` with slice definition:

```typescript
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

const slice = createSlice({
  name: 'domain',
  initialState: { ... },
  reducers: {
    receive: (state, action: PayloadAction<T>) => { ... },
  },
});

export const { receive } = slice.actions;
export const { reducer } = slice;
```

3. Add `saga.ts` for business logic:

```typescript
import { takeEvery } from 'redux-saga/effects';

export function* saga() {
  yield takeEvery(actionType, workerSaga);
}
```

4. Register in `src/store/reducer.ts` and `src/store/saga.ts`

### Normalizr Usage

For relational data (users, channels, messages), use the normalized store pattern. See `src/store/normalized/` for implementation details.

## Testing

- All PRs must include appropriate tests
- Tests should be isolated and not brittle
- Use `redux-saga-test-plan` for saga testing
- Component tests use Jest + Enzyme (legacy) or Vitest + Testing Library (new)
- Vitest tests: name files `*.vitest.tsx` or `*.vitest.ts`

## Environment Variables

All environment variables use `REACT_APP_` prefix (legacy from CRA, maintained for Vite compatibility).

Key variables:

- `REACT_APP_ETH_CHAIN` - Ethereum network (1 for mainnet, 11155111 for Sepolia)
- `REACT_APP_MATRIX_HOME_SERVER_URL` - Matrix chat server URL
- `REACT_APP_ZERO_API_URL` - Backend API URL
- Various Infura URLs for blockchain connectivity
- See `.env.example` for complete list

## Git Workflow

- Main branch: `development` (use this for PRs, not `main`)
- All changes require PR review
- Squash commits appropriately (no "WIP" commits in final PR)
- CI must pass before review
- Follow the [STYLE_GUIDE.md](STYLE_GUIDE.md) for code conventions

## Matrix Chat Integration

The app uses Matrix protocol for messaging. For local development, you can:

- Use the development home server (default in `.env.example`)
- Run a local Matrix server: https://github.com/zer0-os/zOS-chat-server
- Set `REACT_APP_MATRIX_HOME_SERVER_URL=http://localhost:8008` to use local server

## Adding a New App

1. Create app folder in `src/apps/<app-name>/`
2. Implement app component with required interface
3. Add route in `src/apps/app-router.tsx`
4. Optionally add link in AppBar component
5. For external apps, use the `ExternalApp` wrapper component

See [README.md](README.md) "Ways to Participate" section for detailed steps.

## Code Principles

- **No over-engineering**: Only implement what's requested, avoid unnecessary abstractions
- **Business logic in sagas**: Keep components focused on UI, move logic to sagas
- **Avoid hooks for business logic**: Use class components or sagas instead
- **BEM for all styles**: Maintain consistent naming conventions
- **Test isolation**: Write tests that are independent and maintainable
