import { shallow } from 'enzyme';
import React from 'react';
import { Giphy, GiphyComponents, Properties } from './giphy';
import { Grid } from '@giphy/react-components';

describe('Giphy', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      onClose: jest.fn(),
      onClickGif: jest.fn(),
      ...props,
    };

    return shallow(<Giphy {...allProps} />);
  };

  const initialDocument = global.document;

  beforeEach(() => {
    // @ts-ignore
    global.document = {
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    };
    const fetchGifs = jest.fn();
  });

  afterEach(() => {
    global.document = initialDocument;
  });

  it('renders GiphyComponents', () => {
    const wrapper = subject({});

    expect(wrapper.find(GiphyComponents).exists()).toBeTrue();
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
});
