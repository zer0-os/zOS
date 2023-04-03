import React from 'react';
import { shallow } from 'enzyme';

import { ConversationListPanel, Properties } from './conversation-list-panel';

// Significant speed improvement by mocking dependencies
jest.mock('@zero-tech/zui/icons', () => ({}));
jest.mock('../../icon-button', () => ({ IconButton: () => <></> }));
jest.mock('../../../store/channels', () => ({}));
jest.mock('../search-conversations', () => ({ SearchConversations: () => <></> }));
jest.mock('../../tooltip', () => () => <></>);
jest.mock('./conversation-item', () => ({ ConversationItem: () => <></> }));

describe('ConversationListPanel', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      directMessages: [],
      directMessagesList: [],
      conversationInMyNetworks: () => null,
      handleMemberClick: () => null,
      toggleConversation: () => null,
      ...props,
    };

    return shallow(<ConversationListPanel {...allProps} />);
  };

  it('handle member click', function () {
    const handleMemberClick = jest.fn();
    const wrapper = subject({
      handleMemberClick: handleMemberClick,
      directMessagesList: [
        {
          id: 'test-conversation-id',
          otherMembers: [],
        } as any,
      ],
    });

    wrapper.find('ConversationItem').simulate('click', 'test-conversation-id');

    expect(handleMemberClick).toHaveBeenCalledWith('test-conversation-id');
  });
});
