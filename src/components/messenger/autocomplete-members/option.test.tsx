import React from 'react';

import { shallow } from 'enzyme';
import { Option } from './option';

import { Properties } from './option';

describe('option', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      data: { value: '', label: '' },
      ...props,
    };

    return shallow(<Option {...allProps} />);
  };

  it('it renders the label', function () {
    const data = { label: 'hello', value: '' };

    const wrapper = subject({ data });

    expect(wrapper.find('.chat-select__option-label').text().trim()).toEqual(data.label);
  });

  it('it renders the image', function () {
    const data = { label: 'hello', value: '', image: '://image.png' };

    const wrapper = subject({ data });

    expect(wrapper.find('.chat-select__option-image').prop('src')).toEqual(data.image);
  });
});
