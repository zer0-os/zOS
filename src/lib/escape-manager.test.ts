import document from 'global/document';

import { EscapeManager } from './escape-manager';

describe('escape-manager', () => {
  const subject = () => new EscapeManager();

  const createEvent = (props: any = {}) => {
    const event = document.createEvent();

    event.initEvent('keydown');

    Object.keys(props).forEach(prop => event[prop] = props[prop]);

    return event;
  };

  it('calls handler on escape press', () => {
    const escapeManager = subject();

    const handler = jest.fn();

    escapeManager.register(handler);

    document.dispatchEvent(createEvent({ key: 'Escape' }));

    expect(handler).toHaveBeenCalled();
  });

  it('calls nothing if unregistered', () => {
    const escapeManager = subject();
    const handler = jest.fn();

    escapeManager.register(handler);

    escapeManager.unregister();

    document.dispatchEvent(createEvent({ key: 'Escape' }));

    expect(handler).toHaveBeenCalledTimes(0);
  });

  it('calls only most recently registered callback', () => {
    const escapeManager = subject();
    const firstHandler = jest.fn();
    const secondHandler = jest.fn();

    escapeManager.register(firstHandler);
    escapeManager.register(secondHandler);

    document.dispatchEvent(createEvent({ key: 'Escape' }));

    expect(firstHandler).toHaveBeenCalledTimes(0);
    expect(secondHandler).toHaveBeenCalledTimes(1);
  });

  it('unregisters only most recently registered callback', () => {
    const escapeManager = subject();
    const firstHandler = jest.fn();
    const secondHandler = jest.fn();

    escapeManager.register(firstHandler);
    escapeManager.register(secondHandler);

    escapeManager.unregister();

    document.dispatchEvent(createEvent({ key: 'Escape' }));

    expect(firstHandler).toHaveBeenCalledTimes(1);
    expect(secondHandler).toHaveBeenCalledTimes(0);
  });
});
