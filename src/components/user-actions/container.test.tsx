import React from 'react';
import { shallow } from 'enzyme';
import { RootState } from '../../store';

import { Container, Properties } from './container';
import { normalize } from '../../store/channels-list';

describe('UserActionsContainer', () => {
  const subject = (props: Partial<Properties> = {}) => {
    const allProps = {
      userImageUrl: '',
      userIsOnline: false,
      isConversationListOpen: false,
      unreadConversationMessageCount: 0,
      updateConversationState: (_) => undefined,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('renders UserActions', () => {
    const wrapper = subject({
      userImageUrl: 'image-url',
      userIsOnline: true,
      isConversationListOpen: true,
      unreadConversationMessageCount: 7,
      updateConversationState: undefined,
    });

    expect(wrapper.find('UserActions').props()).toEqual({
      userImageUrl: 'image-url',
      userIsOnline: true,
      isConversationListOpen: true,
      unreadConversationMessageCount: 7,
      updateConversationState: undefined,
    });
  });

  describe('mapState', () => {
    const subject = (channels) => {
      const channelData = normalize(channels);
      const state = {
        channelsList: { value: channelData.result },
        normalized: channelData.entities,
      } as RootState;
      return Container.mapState(state);
    };

    test('unreadConversationMessageCount', () => {
      const state = subject([
        { id: 'convo-1', unreadCount: 2, isChannel: false },
        { id: 'channel-2', unreadCount: 11, isChannel: true },
        { id: 'convo-2', unreadCount: 5, isChannel: false },
      ]);

      expect(state.unreadConversationMessageCount).toEqual(7);
    });
  });
});
