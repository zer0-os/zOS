import React from 'react';
import { shallow } from 'enzyme';
import directMessagesFixture from './direct-messages-fixture.json';
import { Channel } from '../../../store/channels';
import { ConversationListPanel, ConversationListPanelProperties } from './conversation-list-panel';

export const DIRECT_MESSAGES_TEST = directMessagesFixture as unknown as Channel[];
export const VISIBLE_DIRECT_MESSAGES_TEST = ['292444273_1588d50c49b8f44110050328fbb8a01eb2105044'];

describe('ConversationListPanel', () => {
  const subject = (props: Partial<ConversationListPanelProperties>) => {
    const allProps: ConversationListPanelProperties = {
      directMessages: DIRECT_MESSAGES_TEST,
      visibleDirectMessageIds: [],
      conversationInMyNetworks: jest.fn(),
      handleMemberClick: jest.fn(),
      toggleConversation: jest.fn(),
      ...props,
    };

    return shallow(<ConversationListPanel {...allProps} />);
  };

  it('renders no conversations', function () {
    const wrapper = subject({});

    expect(wrapper.find('.direct-message-members__user-name').length).toBe(0);
  });

  it('renders only the visible conversations', function () {
    const wrapper = subject({
      visibleDirectMessageIds: VISIBLE_DIRECT_MESSAGES_TEST,
    });

    expect(wrapper.find('.direct-message-members__user-name').text()).toEqual(DIRECT_MESSAGES_TEST[2].name);
  });
});
