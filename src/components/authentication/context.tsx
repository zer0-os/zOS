import React from 'react';

export interface AuthenticationContext {
  isAuthenticated: boolean;
}

export const Context = React.createContext<AuthenticationContext>({
  isAuthenticated: false,
});

export function withContext<T>(Component: any) {
  return (props: T) => (
    <Context.Consumer>
      {(context) => (
        <Component
          {...props}
          context={context}
        />
      )}
    </Context.Consumer>
  );
}

export const Provider = Context.Provider;
