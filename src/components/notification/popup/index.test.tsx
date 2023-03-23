import React from 'react';
import ReactDOM from 'react-dom';

import { shallow } from 'enzyme';
import { NotificationPopup, Properties } from '.';

describe('Notification popup', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      onClickOutside: jest.fn(),
      ...props,
    };

    return shallow(<NotificationPopup {...allProps} />);
  };

  const initialDocument = global.document;

  beforeEach(() => {
    // @ts-ignore
    global.document = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };

    (ReactDOM as any).createPortal = jest.fn();
  });

  afterEach(() => {
    global.document = initialDocument;
    // @ts-ignore
    ReactDOM.createPortal.mockClear();
  });

  it('attach mousedown listener to document', () => {
    subject({});

    expect(global.document.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function), false);
  });

  it('removeEventListener mousedown listener to document', () => {
    const wrapper = subject({});

    (wrapper.instance() as any).componentWillUnmount();

    expect(global.document.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function), false);
  });
});
