import { shallow } from 'enzyme';
import React from 'react';
import { ViewModes } from '../../../shared-components/theme-engine';
import { ReactionPicker, Properties } from './reaction-picker';
import { Picker } from 'emoji-mart';

describe('ReactionPicker', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      isOpen: true,
      onOpen: jest.fn(),
      onClose: jest.fn(),
      onSelect: jest.fn(),
      ...props,
    };

    return shallow(<ReactionPicker {...allProps} />);
  };

  const initialDocument = global.document;

  beforeEach(() => {
    // @ts-ignore
    global.document = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
  });

  afterEach(() => {
    global.document = initialDocument;
  });

  it('renders Picker', () => {
    const wrapper = subject({});

    expect(wrapper.find(Picker).exists()).toBeTrue();
  });

  it('attach mousedown listener to document', () => {
    subject({});

    expect(global.document.addEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('removeEventListener mousedown listener to document', () => {
    const wrapper = subject({});

    (wrapper.instance() as any).componentWillUnmount();

    expect(global.document.removeEventListener).toHaveBeenCalledWith('mousedown', expect.any(Function));
  });

  it('does not render', () => {
    const wrapper = subject({ isOpen: false });

    expect(wrapper.find(Picker).exists()).toBeFalsy();
  });

  it('passes props', () => {
    const wrapper = subject({});

    expect(wrapper.find(Picker).props()).toEqual(
      expect.objectContaining({
        theme: ViewModes.Dark,
        emoji: 'mechanical_arm',
        title: 'ZOS',
      })
    );
  });
});
