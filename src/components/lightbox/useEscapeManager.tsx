import React, { createContext, useContext, ReactNode } from 'react';

export class EscapeManager {
  private closableStack: Array<() => void> = [];

  register(onEscape: () => void) {
    if (this.closableStack.length === 0) {
      document.addEventListener('keydown', this.handleKeydown);
    }
    this.closableStack.push(onEscape);
  }

  unregister() {
    this.closableStack.pop();
    if (this.closableStack.length === 0) {
      document.removeEventListener('keydown', this.handleKeydown);
    }
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.closableStack.length) {
      this.closableStack[this.closableStack.length - 1]();
    }
  };
}

export const escapeManager = new EscapeManager();
const EscapeManagerContext = createContext<EscapeManager | null>(null);

export const useEscapeManager = () => useContext(EscapeManagerContext);

export const EscapeManagerProvider = ({ children }: { children: ReactNode }) => (
  <EscapeManagerContext.Provider value={escapeManager}>{children}</EscapeManagerContext.Provider>
);
