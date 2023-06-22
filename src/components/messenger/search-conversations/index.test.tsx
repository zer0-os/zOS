import React from 'react';

import { shallow } from 'enzyme';
import { Properties, SearchConversations } from '.';

describe('SearchConversations', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      className: '',
      placeholder: '',
      onChange: () => null,
      searchQuery: '',
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

  it('passes searchQuery to Input', async () => {
    const searchQuery = 'todo';
    const wrapper = subject({ searchQuery });

    expect(wrapper.find('.search_conversation-input').prop('value')).toEqual(searchQuery);
  });

  it('passes onChange to Input', async () => {
    const onChange = jest.fn();
    const wrapper = subject({ onChange });

    expect(wrapper.find('.search_conversation-input').prop('onChange')).toEqual(onChange);
  });
});
