import React from 'react';
import { shallow } from 'enzyme';

import CreateConversationPanel, { Properties } from './create-conversation-panel';

jest.mock('../autocomplete-members');

describe('CreateConversationPanel', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      toggleConversation: () => {},
      usersInMyNetworks: () => {},
      createOneOnOneConversation: () => {},
      ...props,
    };

    return shallow(<CreateConversationPanel {...allProps} />);
  };

  it('forwards search function to Autocomplete', function () {
    const usersInMyNetworks = jest.fn();
    const wrapper = subject({ usersInMyNetworks });

    expect(wrapper.find('AutocompleteMembers').prop('search')).toBe(usersInMyNetworks);
  });

  it('fires onCreate when a user is selected', function () {
    const createOneOnOneConversation = jest.fn();
    const wrapper = subject({ createOneOnOneConversation });

    wrapper.find('AutocompleteMembers').simulate('select', 'selected-user-id');

    expect(createOneOnOneConversation).toHaveBeenCalledWith('selected-user-id');
  });

  it('fires onBack when back icon clicked', function () {
    const toggleConversation = jest.fn();
    const wrapper = subject({ toggleConversation });

    wrapper.find('.start__chat-return').simulate('click');

    expect(toggleConversation).toHaveBeenCalledOnce();
  });
});
