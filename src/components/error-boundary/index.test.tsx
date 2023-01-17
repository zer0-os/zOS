/**
 * @jest-environment jsdom
 */

import React from 'react';

import { ErrorBoundary, Properties } from './';
import { ErrorBoundary as SentryErrorBoundary, Scope } from '@sentry/react';
import { mount } from 'enzyme';

describe('error-boundary', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'location', {
      writable: true,
      value: {},
    });
  });

  const ChildComponent = () => null;

  function subject(props: Partial<Properties> = {}) {
    const allProps: Properties = {
      children: null,
      boundary: '',
      ...props,
    };

    return mount(
      <ErrorBoundary {...allProps}>
        <ChildComponent />
      </ErrorBoundary>
    );
  }

  it('renders children', () => {
    const wrapper = subject();

    expect(wrapper.find(ChildComponent).exists()).toBeTruthy();
  });

  describe('setTags', () => {
    it('with app', async () => {
      const boundary = 'apps';
      const app = 'feed';

      const expectation = {
        'application.boundary': boundary,
        'application.name': app,
      };

      Object.defineProperty(window, 'location', {
        value: {
          pathname: `0.wilder.beasts.wolf.2101/${app}`,
        },
      });

      const setTags: Scope['setTags'] = jest.fn();

      const wrapper = subject({ boundary });

      const child = wrapper.find(SentryErrorBoundary);
      child.prop('beforeCapture')({ setTags } as Scope, null, null);

      await wrapper.find(ChildComponent).simulateError(new Error('New Error'));

      expect(setTags).toHaveBeenCalledWith(expectation);
    });

    it('without app', async () => {
      const boundary = 'apps';

      const expectation = {
        'application.boundary': boundary,
        'application.name': undefined,
      };

      const setTags: Scope['setTags'] = jest.fn();

      const wrapper = subject({ boundary });

      const child = wrapper.find(SentryErrorBoundary);
      child.prop('beforeCapture')({ setTags } as Scope, null, null);

      await wrapper.find(ChildComponent).simulateError(new Error('New Error'));

      expect(setTags).toHaveBeenCalledWith(expectation);
    });
  });
});
