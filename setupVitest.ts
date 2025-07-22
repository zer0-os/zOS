import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Mock ResizeObserver since it's not available in jsdom
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;

// Mock Radix UI components
vi.mock('@radix-ui/react-hover-card', () => ({
  Root: ({ children, ...props }) => {
    const { createElement } = require('react');
    return createElement('div', props, children);
  },
  Trigger: ({ children, ...props }) => {
    const { createElement } = require('react');
    return createElement('div', props, children);
  },
  Portal: ({ children }) => children,
  Content: ({ children, ...props }) => {
    const { createElement } = require('react');
    return createElement('div', props, children);
  },
  Arrow: () => {
    const { createElement } = require('react');
    return createElement('div');
  },
}));

afterEach(() => {
  cleanup();
});
