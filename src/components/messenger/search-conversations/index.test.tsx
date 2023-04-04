import React from 'react';

import { shallow } from 'enzyme';
import { Properties, SearchConversations } from '.';

describe('SearchConversations', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      className: '',
      placeholder: '',
      directMessagesList: [],
      onInputChange: () => null,
      mapSearchConversationsText: () => null,
      ...props,
    };

    return shallow(<SearchConversations {...allProps} />);
  };

  it('adds className', () => {
    const wrapper = subject({ className: 'todo' });

    expect(wrapper.find('.search_conversation').hasClass('todo')).toBe(true);
  });

  it('it renders the placeholder', () => {
    const placeholder = 'todo';
    const wrapper = subject({ placeholder });

    const searchInput = wrapper.find('.search_conversation-input');

    expect(searchInput.prop('placeholder')).toEqual(placeholder);
  });

  it('should render search input', () => {
    const wrapper = subject({ className: 'todo' });

    expect(wrapper.find('.search_conversation-input').exists()).toBe(true);
  });

  it('publishes onInputChange', async () => {
    const onInputChange = jest.fn();
    const inputSearch = 'anything';
    const wrapper = subject({ onInputChange });

    wrapper.find('.search_conversation-input').simulate('change', { target: { value: inputSearch } });

    expect(onInputChange).toHaveBeenCalledWith(inputSearch);
  });
});
