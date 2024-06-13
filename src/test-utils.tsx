// https://redux.js.org/usage/writing-tests#connected-components

import React, { ReactNode } from 'react';
import { render } from '@testing-library/react';
import type { RenderOptions } from '@testing-library/react';
import { Provider } from 'react-redux';

import type { AppStore, RootState } from './store';
import { setupStore } from './store';

interface ExtendedRenderOptions extends Omit<RenderOptions, 'queries'> {
  preloadedState?: Partial<RootState>;
  store?: AppStore;
}

export function renderWithProviders(ui: React.ReactElement, extendedRenderOptions: ExtendedRenderOptions = {}) {
  const { preloadedState = {}, store = setupStore(preloadedState), ...renderOptions } = extendedRenderOptions;

  const Wrapper = ({ children }: { children: ReactNode }) => <Provider store={store}>{children}</Provider>;

  return {
    store,
    ...render(ui, { wrapper: Wrapper, ...renderOptions }),
  };
}
