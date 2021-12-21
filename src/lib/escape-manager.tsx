import React from 'react';
import document from 'global/document';

export class EscapeManager {
  private closableStack: Array<() => void>;

  constructor() {
    this.closableStack = [];
  }

  start() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  register(onEscape: () => void) {
    this.closableStack.push(onEscape);
  }

  unregister() {
    this.closableStack.pop();
  }

  destroy() {
    document.removeEventListener('keydown', this.handleKeydown);
  }

  private handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape' && this.closableStack.length) {
      this.closableStack[this.closableStack.length - 1]();
    }
  }
}

export const escapeManager = new EscapeManager();
export const Context = React.createContext(null);
export const Provider = ({ children }) => (
  <Context.Provider value={escapeManager}>{children}</Context.Provider>
);
