# zOS Development Workflow Guide

A comprehensive guide for efficient development, debugging, and productivity when working with the zOS codebase.

## Table of Contents

1. [Daily Development Workflow](#daily-development-workflow)
2. [Feature Development Flow](#feature-development-flow)
3. [Debugging Strategies](#debugging-strategies)
4. [Testing Workflows](#testing-workflows)
5. [Build & Deploy](#build--deploy)
6. [Productivity Tips](#productivity-tips)
7. [Tool Configuration](#tool-configuration)

## Daily Development Workflow

### Starting Your Development Environment

1. **Environment Setup**
   ```bash
   # Start the Vite development server
   npm start
   
   # Alternative for legacy systems
   npm run start:legacy
   
   # For Electron development
   npm run electron:start
   ```

2. **Hot Reload & Fast Refresh**
   - Vite provides instant hot module replacement (HMR)
   - React Fast Refresh preserves component state during development
   - SCSS changes reflect immediately without page refresh
   - Redux DevTools state persists through most code changes

3. **Browser DevTools Setup**
   - **Chrome/Edge**: Press F12 or Ctrl+Shift+I
   - **Firefox**: Press F12 or Ctrl+Shift+I
   - Enable "Preserve log" in Console tab for debugging page navigation
   - Use Network tab with "Disable cache" for testing fresh loads

4. **Redux DevTools Usage**
   ```javascript
   // Access Redux state in console
   window.store.getState()
   
   // Feature flags accessible globally
   window.FEATURE_FLAGS.enableDevPanel = true
   
   // Check current user state
   window.store.getState().authentication.user
   ```

### Essential Development Commands

```bash
# Development
npm start                    # Start Vite dev server (port 3000)
npm run test:vitest         # Run Vitest tests in watch mode
npm run lint                # Check ESLint rules
npm run lint:fix            # Auto-fix ESLint issues

# Code Quality
npm run code-format:fix     # Format code with Prettier
npm run code-format:validate # Check code formatting

# Testing
npm test                    # Run all tests (legacy)
npm run test:vitest         # Run Vitest tests
vitest run --reporter=verbose # Run tests with detailed output
```

## Feature Development Flow

### Planning a New Feature

1. **Architecture Review**
   - Check if Redux state needs modification
   - Identify required API endpoints
   - Plan component hierarchy
   - Consider Matrix.js integration if chat-related

2. **Feature Flag Setup**
   ```typescript
   // Add to src/lib/feature-flags/development.ts
   export const developmentFlags = {
     // ... existing flags
     enableMyNewFeature: { defaultValue: true },
   };
   
   // Use in components
   import { featureFlags } from '../../lib/feature-flags';
   
   if (featureFlags.enableMyNewFeature) {
     // Feature code here
   }
   ```

### Creating Components

1. **Component Structure**
   ```
   src/components/my-feature/
   ├── index.tsx              # Main component
   ├── index.vitest.tsx       # Vitest tests
   ├── container.tsx          # Redux container (if needed)
   ├── styles.module.scss     # Component styles
   └── lib/
       ├── types.ts           # TypeScript types
       ├── hooks.ts           # Custom hooks
       └── utils.ts           # Utility functions
   ```

2. **Component Template**
   ```typescript
   // src/components/my-feature/index.tsx
   import React from 'react';
   import { bemClassName } from '../../lib/bem';
   import './styles.module.scss';
   
   const cn = bemClassName('my-feature');
   
   export interface Properties {
     // Define props
   }
   
   export const MyFeature: React.FC<Properties> = ({ ...props }) => {
     return (
       <div {...cn('')}>
         {/* Component content */}
       </div>
     );
   };
   
   export default MyFeature;
   ```

3. **SCSS Styling with BEM**
   ```scss
   // src/components/my-feature/styles.module.scss
   @use '~@zero-tech/zui/styles/theme' as theme;
   @import '../../functions';
   @import '../../animation';
   
   .my-feature {
     // Block styles
     
     &__element {
       // Element styles
       color: theme.$color-primary;
     }
     
     &--modifier {
       // Modifier styles
     }
   }
   ```

### Adding Redux State

1. **Create Store Module**
   ```
   src/store/my-feature/
   ├── index.ts               # Actions, types, reducer
   ├── saga.ts                # Redux-Saga logic
   ├── saga.test.ts           # Saga tests
   ├── selectors.ts           # State selectors
   ├── api.ts                 # API calls
   └── types.ts               # TypeScript interfaces
   ```

2. **Redux Toolkit Slice**
   ```typescript
   // src/store/my-feature/index.ts
   import { createSlice, PayloadAction } from '@reduxjs/toolkit';
   
   export interface State {
     loading: boolean;
     data: any[];
     error: string | null;
   }
   
   const initialState: State = {
     loading: false,
     data: [],
     error: null,
   };
   
   export const slice = createSlice({
     name: 'myFeature',
     initialState,
     reducers: {
       startRequest: (state) => {
         state.loading = true;
       },
       requestSuccess: (state, action: PayloadAction<any[]>) => {
         state.loading = false;
         state.data = action.payload;
       },
       requestFailure: (state, action: PayloadAction<string>) => {
         state.loading = false;
         state.error = action.payload;
       },
     },
   });
   
   export const SagaActionTypes = {
     FETCH_DATA: 'my-feature/saga/FETCH_DATA',
   };
   
   export const { startRequest, requestSuccess, requestFailure } = slice.actions;
   export const reducer = slice.reducer;
   ```

### Writing Sagas

1. **Saga Structure**
   ```typescript
   // src/store/my-feature/saga.ts
   import { takeLatest, put, call, select } from 'redux-saga/effects';
   import { PayloadAction } from '@reduxjs/toolkit';
   import { startRequest, requestSuccess, requestFailure, SagaActionTypes } from './';
   import { apiCall } from './api';
   
   function* fetchDataSaga(action: PayloadAction<{ id: string }>) {
     try {
       yield put(startRequest());
       const data = yield call(apiCall, action.payload.id);
       yield put(requestSuccess(data));
     } catch (error) {
       yield put(requestFailure(error.message));
     }
   }
   
   export function* saga() {
     yield takeLatest(SagaActionTypes.FETCH_DATA, fetchDataSaga);
   }
   ```

2. **Testing Sagas**
   ```typescript
   // src/store/my-feature/saga.test.ts
   import { expectSaga } from 'redux-saga-test-plan';
   import * as matchers from 'redux-saga-test-plan/matchers';
   import { fetchDataSaga } from './saga';
   import { startRequest, requestSuccess } from './';
   import { apiCall } from './api';
   
   describe('my-feature saga', () => {
     it('fetches data successfully', () => {
       const action = { payload: { id: '123' } };
       const mockData = [{ id: '123', name: 'Test' }];
       
       return expectSaga(fetchDataSaga, action)
         .put(startRequest())
         .call(apiCall, '123')
         .put(requestSuccess(mockData))
         .provide([
           [matchers.call.fn(apiCall), mockData]
         ])
         .run();
     });
   });
   ```

## Debugging Strategies

### Common Error Patterns

1. **Matrix.js Connection Issues**
   ```javascript
   // Enable Matrix debugging
   window.FEATURE_FLAGS.enableMatrixDebug = true;
   
   // Check Matrix client state
   console.log(window.matrixClient?.getClientWellKnown());
   console.log(window.matrixClient?.getSyncState());
   ```

2. **Redux State Issues**
   ```javascript
   // Debug Redux state
   window.store.getState()
   
   // Watch specific state slice
   window.store.subscribe(() => {
     console.log('State changed:', window.store.getState().myFeature);
   });
   ```

3. **Component Rendering Issues**
   ```typescript
   // Add debug logging
   useEffect(() => {
     console.log('Component props:', props);
     console.log('Component state:', state);
   });
   ```

### Using Source Maps

1. **Vite Source Maps**
   - Source maps are enabled by default in development
   - Set breakpoints directly in TypeScript/JSX files
   - Use browser DevTools to step through original source code

2. **Redux DevTools Integration**
   ```javascript
   // Time travel debugging
   // Use Redux DevTools extension to:
   // - Inspect action history
   // - Jump to any previous state
   // - Export/import state for testing
   ```

### Saga Flow Debugging

1. **Saga Logger**
   ```typescript
   // Add logging to sagas
   function* mySaga(action) {
     console.log('Saga started:', action);
     try {
       const result = yield call(apiCall);
       console.log('API result:', result);
       yield put(success(result));
     } catch (error) {
       console.error('Saga error:', error);
       yield put(failure(error.message));
     }
   }
   ```

2. **Redux-Saga Test Plan**
   ```typescript
   // Test saga flows with detailed assertions
   expectSaga(mySaga)
     .put.actionType('START_REQUEST')
     .call.fn(apiCall)
     .put.actionType('REQUEST_SUCCESS')
     .run();
   ```

### Performance Profiling

1. **React DevTools Profiler**
   - Install React DevTools extension
   - Use Profiler tab to identify slow components
   - Look for unnecessary re-renders

2. **Vite Bundle Analysis**
   ```bash
   # Analyze bundle size
   npm run build
   npx vite-bundle-analyzer dist
   ```

## Testing Workflows

### Writing Unit Tests

1. **Vitest Configuration**
   ```typescript
   // vitest.config.ts is integrated in vite.config.ts
   test: {
     include: ['**/*.vitest.*'],
     globals: true,
     environment: 'jsdom',
     setupFiles: ['./setupVitest.ts'],
   }
   ```

2. **Component Testing Pattern**
   ```typescript
   // src/components/my-feature/index.vitest.tsx
   import { screen, fireEvent, waitFor } from '@testing-library/react';
   import { vi } from 'vitest';
   import { renderWithProviders } from '../../test-utils';
   import { MyFeature } from './index';
   
   describe('MyFeature', () => {
     it('renders correctly', () => {
       renderWithProviders(<MyFeature />);
       expect(screen.getByText('Expected text')).toBeInTheDocument();
     });
     
     it('handles user interaction', async () => {
       const mockOnClick = vi.fn();
       renderWithProviders(<MyFeature onClick={mockOnClick} />);
       
       fireEvent.click(screen.getByRole('button'));
       await waitFor(() => {
         expect(mockOnClick).toHaveBeenCalledOnce();
       });
     });
   });
   ```

### Running Tests

```bash
# Run all Vitest tests
npm run test:vitest

# Run tests in watch mode
vitest

# Run specific test file
vitest src/components/my-feature/index.vitest.tsx

# Run tests with coverage
vitest --coverage

# Run tests matching pattern
vitest --reporter=verbose --grep "MyFeature"
```

### Test Coverage Reports

```bash
# Generate coverage report
vitest --coverage

# View coverage in browser
open coverage/index.html
```

### Debugging Failing Tests

1. **Debug Mode**
   ```bash
   # Run single test with debugging
   vitest --reporter=verbose --no-coverage src/path/to/test.vitest.tsx
   ```

2. **Test Debugging Tools**
   ```typescript
   // Add debug output
   import { screen } from '@testing-library/react';
   
   // Debug DOM structure
   screen.debug();
   
   // Check what's rendered
   console.log(screen.getByRole('button'));
   ```

## Build & Deploy

### Local Build Process

```bash
# Production build
npm run build

# Legacy build (if needed)
npm run build:legacy

# Electron builds
npm run electron:package:mac
npm run electron:package:win
npm run electron:package:linux
```

### Environment Variables

1. **Vite Environment Variables**
   ```bash
   # .env.local
   REACT_APP_API_URL=http://localhost:8000
   REACT_APP_MATRIX_SERVER=https://matrix.example.com
   REACT_APP_SENTRY_DSN=your-sentry-dsn
   ```

2. **Feature Flag Override**
   ```bash
   # Override feature flags in development
   REACT_APP_ENABLE_DEV_PANEL=true
   REACT_APP_VERBOSE_LOGGING=true
   ```

### Build Optimization

1. **Bundle Analysis**
   ```bash
   # Analyze bundle composition
   npm run build
   npx bundle-analyzer dist/static/js/*.js
   ```

2. **Performance Monitoring**
   ```typescript
   // Monitor build performance
   console.time('Component render');
   // Component code
   console.timeEnd('Component render');
   ```

### Deployment Checklist

- [ ] All tests passing
- [ ] ESLint checks pass
- [ ] Code formatted with Prettier
- [ ] Feature flags properly configured
- [ ] Environment variables set
- [ ] Source maps generated
- [ ] Bundle size within limits
- [ ] Performance metrics acceptable

## Productivity Tips

### VS Code Setup for zOS

1. **Recommended Extensions**
   ```json
   // .vscode/extensions.json
   {
     "recommendations": [
       "esbenp.prettier-vscode",
       "ms-vscode.vscode-typescript-next",
       "bradlc.vscode-tailwindcss",
       "ms-vscode.vscode-json",
       "redhat.vscode-yaml",
       "ms-vscode.test-adapter-converter"
     ]
   }
   ```

2. **VS Code Settings**
   ```json
   // .vscode/settings.json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "typescript.preferences.importModuleSpecifier": "relative",
     "emmet.includeLanguages": {
       "typescript": "html",
       "typescriptreact": "html"
     }
   }
   ```

### Keyboard Shortcuts

```
Ctrl+Shift+P - Command palette
Ctrl+` - Toggle terminal
Ctrl+Shift+` - New terminal
Ctrl+B - Toggle sidebar
Ctrl+Shift+E - Explorer
Ctrl+Shift+F - Search across files
Ctrl+Shift+G - Git panel
Ctrl+Shift+D - Debug panel
F5 - Start debugging
Ctrl+F5 - Run without debugging
Ctrl+Shift+I - Developer tools
```

### Code Snippets

1. **React Component Snippet**
   ```typescript
   // Type: rfc
   import React from 'react';
   import { bemClassName } from '../../lib/bem';
   
   const cn = bemClassName('$1');
   
   export interface Properties {
     // Props here
   }
   
   export const $1: React.FC<Properties> = () => {
     return (
       <div {...cn('')}>
         $0
       </div>
     );
   };
   ```

2. **Redux Saga Snippet**
   ```typescript
   // Type: saga
   function* $1Saga(action: PayloadAction<$2>) {
     try {
       yield put(start$1());
       const result = yield call($3, action.payload);
       yield put($1Success(result));
     } catch (error) {
       yield put($1Failure(error.message));
     }
   }
   ```

### Git Workflows

1. **Branch Naming**
   ```bash
   # Feature branches
   git checkout -b feature/add-user-profile
   
   # Bug fixes
   git checkout -b fix/login-redirect-issue
   
   # Hotfix
   git checkout -b hotfix/security-patch
   ```

2. **Commit Messages**
   ```bash
   # Good commit messages
   git commit -m "feat: add user profile component"
   git commit -m "fix: resolve login redirect issue"
   git commit -m "refactor: simplify Redux store structure"
   git commit -m "test: add unit tests for message component"
   git commit -m "docs: update development workflow guide"
   ```

3. **Pre-commit Hooks**
   ```bash
   # Husky runs automatically:
   # - Prettier formatting on staged files
   # - ESLint validation
   # - Pre-push code format validation
   ```

### PR Management

1. **PR Template**
   ```markdown
   ## Summary
   Brief description of changes
   
   ## Test Plan
   - [ ] Unit tests added/updated
   - [ ] Manual testing completed
   - [ ] Integration tests pass
   
   ## Screenshots
   (If UI changes)
   
   ## Breaking Changes
   (If any)
   ```

2. **PR Checklist**
   - [ ] Tests added for new functionality
   - [ ] All tests passing
   - [ ] Code reviewed by team
   - [ ] Documentation updated
   - [ ] Feature flags considered
   - [ ] Performance impact assessed

## Tool Configuration

### Vite Configuration

Key features in `vite.config.ts`:
- React SWC for fast compilation
- SVG as React components (`*.svg?react`)
- Node.js polyfills for Matrix.js compatibility
- SCSS preprocessing with `~` imports
- Sentry integration for error tracking
- Source maps for debugging

### ESLint Rules

Current configuration (`.eslintrc.json`):
- Single quotes preferred
- Unused variables as errors (with underscore prefix exception)
- Import duplicate detection
- React-Redux specific rules

### Prettier Setup

Configuration (`.prettierrc.json`):
- Single quotes in JS/TS
- JSX single quotes
- Trailing commas (ES5)
- 120 character line width
- Multiline arrays formatting

### Pre-commit Hooks

Husky configuration:
- **pre-commit**: Runs Prettier on staged files
- **pre-push**: Validates code formatting

## Troubleshooting Common Issues

### Build Failures

1. **Memory Issues**
   ```bash
   # Increase Node.js memory limit
   NODE_OPTIONS='--max-old-space-size=6144' npm run build
   ```

2. **Type Errors**
   ```bash
   # Check TypeScript compilation
   npx tsc --noEmit
   ```

### Runtime Errors

1. **Matrix.js Issues**
   ```javascript
   // Check Matrix client status
   window.matrixClient?.getClientWellKnown()
   ```

2. **Redux State Issues**
   ```javascript
   // Reset Redux state
   window.location.reload()
   ```

### Development Server Issues

1. **Port Conflicts**
   ```bash
   # Use different port
   PORT=3001 npm start
   ```

2. **Module Resolution**
   ```bash
   # Clear cache and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

This workflow guide should be your go-to reference for efficient zOS development. Keep it bookmarked and update it as new patterns emerge in the codebase.