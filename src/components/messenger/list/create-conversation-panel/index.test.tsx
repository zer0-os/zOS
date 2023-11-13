import React from 'react';
import { shallow } from 'enzyme';

import CreateConversationPanel, { Properties } from '.';

jest.mock('../../autocomplete-members');

describe('CreateConversationPanel', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      conversations: [],
      onBack: () => {},
      search: () => {},
      onCreate: () => {},
      onStartGroupChat: () => {},
      ...props,
    };

    return shallow(<CreateConversationPanel {...allProps} />);
  };

  it('forwards search function to Autocomplete', function () {
    const search = jest.fn();
    const wrapper = subject({ search: search });

    expect(wrapper.find('AutocompleteMembers').prop('search')).toBe(search);
  });

  it('fires onCreate when a user is selected', function () {
    const onCreate = jest.fn();
    const wrapper = subject({ onCreate: onCreate });

    wrapper.find('AutocompleteMembers').simulate('select', { value: 'selected-user-id' });

    expect(onCreate).toHaveBeenCalledWith('selected-user-id');
  });

  it('fires onBack when back icon clicked', function () {
    const onBack = jest.fn();
    const wrapper = subject({ onBack: onBack });

    wrapper.find('PanelHeader').simulate('back');

    expect(onBack).toHaveBeenCalledOnce();
  });

  it('fires onStartGroupChat when the action is clicked', function () {
    const onStartGroupChat = jest.fn();
    const wrapper = subject({ onStartGroupChat });

    wrapper.find('.create-conversation__group-button').simulate('click');

    expect(onStartGroupChat).toHaveBeenCalledOnce();
  });
});
