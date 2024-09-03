import React from 'react';
import { shallow } from 'enzyme';
import { Container as MessengerFeed, Properties } from '.';
import { StoreBuilder, stubConversation } from '../../../store/test/store';
import { PostInputContainer } from './components/post-input/container';

describe(MessengerFeed, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      channel: null,
      activeConversationId: 'channel-id',
      isSocialChannel: false,
      isJoiningConversation: false,
      sendPost: jest.fn(),
      ...props,
    };

    return shallow(<MessengerFeed {...allProps} />);
  };

  it('renders Messenger Feed when isSocialChannel is true', () => {
    const channel = stubConversation({ name: 'convo-1', hasLoadedMessages: true, messages: [] });

    const wrapper = subject({ channel: channel as any, isSocialChannel: true });
    expect(wrapper).toHaveElement(PostInputContainer);
  });

  it('does not render Messenger Feed when isSocialChannel is false', () => {
    const channel = stubConversation({ name: 'convo-1', hasLoadedMessages: true, messages: [] });

    const wrapper = subject({ channel: channel as any, isSocialChannel: false });

    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('does not render Messenger Feed when isJoiningConversation is true', () => {
    const channel = stubConversation({ name: 'convo-1', hasLoadedMessages: true, messages: [] });

    const wrapper = subject({ channel: channel as any, isSocialChannel: true, isJoiningConversation: true });

    expect(wrapper.isEmptyRender()).toBe(true);
  });

  it('does not render Messenger Feed when no active conversation id', () => {
    const channel = stubConversation({ name: 'convo-1', hasLoadedMessages: true, messages: [] });

    const wrapper = subject({ channel: channel as any, isSocialChannel: true, activeConversationId: null });

    expect(wrapper.isEmptyRender()).toBe(true);
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

    it('maps isJoiningConversation from state', () => {
      const state = new StoreBuilder().withChat({ isJoiningConversation: true }).build();

      expect(MessengerFeed.mapState(state)).toEqual(expect.objectContaining({ isJoiningConversation: true }));
    });

    it('maps activeConversationId from state', () => {
      const activeConversationId = 'test-conversation-id';
      const state = new StoreBuilder().withActiveConversationId(activeConversationId).build();

      expect(MessengerFeed.mapState(state)).toEqual(expect.objectContaining({ activeConversationId }));
    });

    it('maps channel from state', () => {
      const conversation = stubConversation({ id: 'test-conversation-id' });
      const state = new StoreBuilder().withActiveConversation(conversation).build();

      expect(MessengerFeed.mapState(state)).toEqual(
        expect.objectContaining({
          channel: expect.objectContaining({
            id: 'test-conversation-id',
          }),
        })
      );
    });
  });
});
