/**
 * @jest-environment jsdom
 */

import React from 'react';

import { ErrorBoundary, Properties } from './';
import { shallow } from 'enzyme';

describe('error-boundary', () => {
  const ChildComponent = () => null;

  function subject(props: Partial<Properties> = {}) {
    const allProps: Properties = {
      ...props,
    };

    return shallow(
      <ErrorBoundary {...allProps}>
        <ChildComponent />
      </ErrorBoundary>
    );
  }

  it('from core', () => {
    const logger = { capture: jest.fn() };

    const wrapper = subject({ logger });

    const exception = new Error('New Error');

    wrapper.find(ChildComponent).simulateError(exception);

    expect(logger.capture).toHaveBeenCalledWith(
      exception,
      'core',
      expect.objectContaining({ errorInfo: expect.anything() })
    );
  });

  it('from app', () => {
    const expectation = 'feed';

    Object.defineProperty(window, 'location', {
      value: {
        pathname: `0.wilder.beasts.wolf.2101/${expectation}`,
      },
    });

    const logger = { capture: jest.fn() };

    const wrapper = subject({ logger });

    const exception = new Error('New Error');

    wrapper.find(ChildComponent).simulateError(exception);

    expect(logger.capture).toHaveBeenCalledWith(
      exception,
      expectation,
      expect.objectContaining({ errorInfo: expect.anything() })
    );
  });
});
