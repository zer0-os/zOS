import React from 'react';
import { shallow } from 'enzyme';
import { Container as MessengerFeed, Properties } from '.';
import { StoreBuilder, stubConversation } from '../../../store/test/store';
import { LeaveGroupDialogStatus } from '../../../store/group-management';
import { LeaveGroupDialogContainer } from '../../group-management/leave-group-dialog/container';

describe(MessengerFeed, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      channel: null,
      activeConversationId: 'channel-id',
      isSocialChannel: false,
      isJoiningConversation: false,
      isSubmittingPost: false, // Added missing property
      leaveGroupDialogStatus: LeaveGroupDialogStatus.CLOSED,
      sendPost: jest.fn(),
      setLeaveGroupStatus: jest.fn(),
      ...props,
    };

    return shallow(<MessengerFeed {...allProps} />);
  };

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

  describe('leave group dialog', () => {
    it('renders leave group dialog when status is OPEN', async () => {
      const channel = stubConversation({ name: 'convo-1', hasLoadedMessages: true, messages: [] });

      const wrapper = subject({
        channel: channel as any,
        isSocialChannel: true,
        leaveGroupDialogStatus: LeaveGroupDialogStatus.OPEN,
      });

      expect(wrapper).toHaveElement(LeaveGroupDialogContainer);
    });

    it('renders leave group dialog when status is IN_PROGRESS', () => {
      const channel = stubConversation({ name: 'convo-1', hasLoadedMessages: true, messages: [] });

      const wrapper = subject({
        channel: channel as any,
        isSocialChannel: true,
        leaveGroupDialogStatus: LeaveGroupDialogStatus.IN_PROGRESS,
      });

      expect(wrapper).toHaveElement(LeaveGroupDialogContainer);
    });

    it('does not render leave group dialog when LeaveGroupDialogStatus is closed', () => {
      const channel = stubConversation({ name: 'convo-1', hasLoadedMessages: true, messages: [] });

      const wrapper = subject({
        channel: channel as any,
        isSocialChannel: true,
        leaveGroupDialogStatus: LeaveGroupDialogStatus.CLOSED,
      });

      expect(wrapper).not.toHaveElement(LeaveGroupDialogContainer);
    });

    it('passes name and roomId to leave group dialog', () => {
      const channel = stubConversation({ name: 'group-name', id: 'channel-id', hasLoadedMessages: true, messages: [] });

      const wrapper = subject({
        channel: channel as any,
        isSocialChannel: true,
        leaveGroupDialogStatus: LeaveGroupDialogStatus.OPEN,
      });

      const leaveGroupDialog = wrapper.find(LeaveGroupDialogContainer);

      expect(leaveGroupDialog).toHaveProp('roomId', 'channel-id');
      expect(leaveGroupDialog).toHaveProp('groupName', 'group-name');
    });
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
