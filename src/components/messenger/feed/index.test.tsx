import React from 'react';
import { shallow } from 'enzyme';
import { Container as MessengerFeed, Properties } from '.';
import { StoreBuilder, stubConversation } from '../../../store/test/store';

describe(MessengerFeed, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      user: { data: null },
      channel: null,
      activeConversationId: 'channel-id',
      isSocialChannel: false,
      isJoiningConversation: false,
      sendPost: jest.fn(),
      fetchPosts: jest.fn(),
      ...props,
    };

    return shallow(<MessengerFeed {...allProps} />);
  };

  it('renders Messenger Feed when isSocialChannel is true', () => {
    const channel = stubConversation({ name: 'convo-1', hasLoadedMessages: true, messages: [] });

    const wrapper = subject({ channel: channel as any, isSocialChannel: true });
    expect(wrapper).toHaveElement('CreatePost');
  });

  it('does not render Messenger Feed when isSocialChannel is false', () => {
    const channel = stubConversation({ name: 'convo-1', hasLoadedMessages: true, messages: [] });

    const wrapper = subject({ channel: channel as any, isSocialChannel: false });

    expect(wrapper).not.toHaveElement('CreatePost');
  });

  it('does not render Messenger Feed when isJoiningConversation is true', () => {
    const channel = stubConversation({ name: 'convo-1', hasLoadedMessages: true, messages: [] });

    const wrapper = subject({ channel: channel as any, isSocialChannel: true, isJoiningConversation: true });

    expect(wrapper).not.toHaveElement('CreatePost');
  });

  it('does not render Messenger Feed when no active conversation id', () => {
    const channel = stubConversation({ name: 'convo-1', hasLoadedMessages: true, messages: [] });

    const wrapper = subject({ channel: channel as any, isSocialChannel: true, activeConversationId: null });

    expect(wrapper).not.toHaveElement('CreatePost');
  });

  describe('mapState', () => {
    it('sets isSocialChannel to true when the current channel is social', () => {
      const state = new StoreBuilder().withActiveConversation(stubConversation({ isSocialChannel: true })).build();

      expect(MessengerFeed.mapState(state)).toEqual(expect.objectContaining({ isSocialChannel: true }));
    });

    it('sets isSocialChannel to false when the current channel is not social', () => {
      const state = new StoreBuilder().withActiveConversation(stubConversation({ isSocialChannel: false })).build();

      expect(MessengerFeed.mapState(state)).toEqual(expect.objectContaining({ isSocialChannel: false }));
    });
  });
});
