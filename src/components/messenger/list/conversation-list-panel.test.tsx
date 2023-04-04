import React from 'react';
import { shallow } from 'enzyme';
import directMessagesFixture from './direct-messages-fixture.json';
import { Channel } from '../../../store/channels';
import { ConversationListPanel, Properties } from './conversation-list-panel';

export const DIRECT_MESSAGES_TEST = directMessagesFixture as unknown as Channel[];
export const VISIBLE_DIRECT_MESSAGES_TEST = ['292444273_1588d50c49b8f44110050328fbb8a01eb2105044'];

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
      visibleDirectMessageIds: [],
      conversationInMyNetworks: () => null,
      handleMemberClick: () => null,
      toggleConversation: () => null,
      ...props,
    };

    return shallow(<ConversationListPanel {...allProps} />);
  };

  it('renders no conversations', function () {
    const wrapper = subject({
      directMessages: DIRECT_MESSAGES_TEST,
    });

    expect(wrapper.find('ConversationItem').length).toBe(0);
  });

  it('renders only the visible conversations', function () {
    const wrapper = subject({
      visibleDirectMessageIds: VISIBLE_DIRECT_MESSAGES_TEST,
      directMessages: DIRECT_MESSAGES_TEST,
    });

    expect(wrapper.find('ConversationItem').prop('conversation')).toEqual(DIRECT_MESSAGES_TEST[2]);
  });

  it('handle member click', function () {
    const handleMemberClick = jest.fn();
    const wrapper = subject({
      handleMemberClick: handleMemberClick,
      visibleDirectMessageIds: VISIBLE_DIRECT_MESSAGES_TEST,
      directMessages: DIRECT_MESSAGES_TEST,
    });

    wrapper.find('ConversationItem').simulate('click', 'test-conversation-id');

    expect(handleMemberClick).toHaveBeenCalledWith('test-conversation-id');
  });
});
