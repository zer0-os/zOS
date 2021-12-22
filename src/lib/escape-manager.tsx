import React from 'react';
import document from 'global/document';

export class EscapeManager {
  private closableStack: Array<() => void>;

  constructor() {
    this.closableStack = [];
  }

  register(onEscape: () => void) {
    if (this.closableStack.length === 0) {
      this.addListener();
    }

    this.closableStack.push(onEscape);
  }

  unregister() {
    this.closableStack.pop();

    if (this.closableStack.length === 0) {
      this.removeListener();
    }
  }

  private addListener() {
    document.addEventListener('keydown', this.handleKeydown);
  }

  private removeListener() {
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
