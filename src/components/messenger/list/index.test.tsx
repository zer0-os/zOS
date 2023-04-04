/**
 * @jest-environment jsdom
 */

import React from 'react';
import { mount } from 'enzyme';
import { Container as DirectMessageChat, Properties } from '.';
import directMessagesFixture from './direct-messages-fixture.json';
import { Channel } from '../../../store/channels';
import { normalize } from '../../../store/channels-list';
import { SearchConversations } from '../search-conversations';
import { RootState } from '../../../store';
import moment from 'moment';
import { when } from 'jest-when';
import CreateConversationPanel from './create-conversation-panel';
import { ConversationListPanel } from './conversation-list-panel';
import { StartGroupPanel } from './start-group-panel';

export const DIRECT_MESSAGES_TEST = directMessagesFixture as unknown as Channel[];

const mockSearchMyNetworksByName = jest.fn();
jest.mock('../../../platform-apps/channels/util/api', () => {
  return {
    searchMyNetworksByName: async (...args) => {
      return await mockSearchMyNetworksByName(...args);
    },
  };
});

describe('messenger-list', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      setActiveMessengerChat: jest.fn(),
      directMessages: [],
      fetchDirectMessages: jest.fn(),
      createDirectMessage: jest.fn(),
      onClose: () => null,
      ...props,
    };

    return mount(<DirectMessageChat {...allProps} />);
  };

  it('start sync direct messages', function () {
    const fetchDirectMessages = jest.fn();

    subject({ fetchDirectMessages });

    expect(fetchDirectMessages).toHaveBeenCalledOnce();
  });

  it('publishes close event when titlebar X clicked', function () {
    const onClose = jest.fn();

    const wrapper = subject({ onClose });

    wrapper.find('.messenger-list__header button').simulate('click');

    expect(onClose).toHaveBeenCalledOnce();
  });

  it('searches for citizens when creating a new conversation', async function () {
    when(mockSearchMyNetworksByName)
      .calledWith('jac')
      .mockResolvedValue([{ id: 'user-id', profileImage: 'image-url' }]);
    const wrapper = subject({});
    wrapper.find('.header-button__icon').simulate('click');

    const searchResults = await wrapper.find(CreateConversationPanel).prop('search')('jac');

    expect(searchResults).toStrictEqual([{ id: 'user-id', image: 'image-url', profileImage: 'image-url' }]);
  });

  it('creates a one on one conversation when user selected', async function () {
    const createDirectMessage = jest.fn();
    const wrapper = subject({ createDirectMessage });
    wrapper.find('.header-button__icon').simulate('click');

    // Can't do simulate on custom components when rendering fully?
    wrapper.find(CreateConversationPanel).prop('onCreate')('selected-user-id');

    expect(createDirectMessage).toHaveBeenCalledWith({ userIds: ['selected-user-id'] });
  });

  it('returns to conversation list when one on one conversation created', async function () {
    const createDirectMessage = jest.fn();
    const wrapper = subject({ createDirectMessage });
    wrapper.find('.header-button__icon').simulate('click');

    // Can't do simulate on custom components when rendering fully?
    wrapper.find(CreateConversationPanel).prop('onCreate')('selected-user-id');
    wrapper.update();

    expect(wrapper).not.toHaveElement('CreateConversationPanel');
    expect(wrapper).toHaveElement('.header-button');
    expect(wrapper).toHaveElement('.messages-list__items');
  });

  it('returns to conversation list if back button pressed', async function () {
    const wrapper = subject({});
    wrapper.find('.header-button__icon').simulate('click');
    expect(wrapper).toHaveElement('CreateConversationPanel');
    expect(wrapper).not.toHaveElement('.header-button');
    expect(wrapper).not.toHaveElement('.messages-list__items');

    wrapper.find(CreateConversationPanel).prop('onBack')();
    wrapper.update();

    expect(wrapper).not.toHaveElement('CreateConversationPanel');
    expect(wrapper).toHaveElement('.header-button');
    expect(wrapper).toHaveElement('.messages-list__items');
  });

  it('renders search results', function () {
    const conversations = [
      { id: 'convo-id-1', name: 'convo-1', otherMembers: [{ firstName: 'jack' }] },
      { id: 'convo-id-2', name: 'convo-2', otherMembers: [{ firstName: 'bob' }] },
      { id: 'convo-id-3', name: 'convo-3', otherMembers: [{ firstName: 'jacklyn' }] },
    ];

    const wrapper = subject({ directMessages: conversations as any });

    let displayChatNames = wrapper.find('.direct-message-members__user-name').map((node) => node.text());
    expect(displayChatNames).toStrictEqual([
      'convo-1',
      'convo-2',
      'convo-3',
    ]);

    wrapper.find(SearchConversations).prop('onInputChange')('jac');
    wrapper.update();

    displayChatNames = wrapper.find('.direct-message-members__user-name').map((node) => node.text());
    expect(displayChatNames).toStrictEqual([
      'convo-1',
      'convo-3',
    ]);
  });

  describe('navigation', () => {
    it('moves to the group conversation creation phase', function () {
      const wrapper = subject({});

      wrapper.find('.header-button__icon').simulate('click');

      wrapper.find(CreateConversationPanel).prop('onStartGroupChat')();
      wrapper.update();

      expect(wrapper).not.toHaveElement(ConversationListPanel);
      expect(wrapper).not.toHaveElement(CreateConversationPanel);
      expect(wrapper).toHaveElement('StartGroupPanel');
    });

    it('returns to one on one conversation panel if back button pressed on start group panel', async function () {
      const wrapper = subject({});
      wrapper.find('.header-button__icon').simulate('click');
      wrapper.find(CreateConversationPanel).prop('onStartGroupChat')();
      wrapper.update();

      wrapper.find(StartGroupPanel).prop('onBack')();
      wrapper.update();

      expect(wrapper).not.toHaveElement(StartGroupPanel);
      expect(wrapper).toHaveElement(CreateConversationPanel);
      expect(wrapper).not.toHaveElement(ConversationListPanel);
    });

    it('creates a group conversation when users selected', async function () {
      const createDirectMessage = jest.fn();
      const wrapper = subject({ createDirectMessage });
      wrapper.find('.header-button__icon').simulate('click');
      wrapper.find(CreateConversationPanel).prop('onStartGroupChat')();
      wrapper.update();

      // Can't do simulate on custom components when rendering fully. Convert to simulate after.
      wrapper.find(StartGroupPanel).prop('onContinue')([
        'selected-id-1',
        'selected-id-2',
      ]);

      expect(createDirectMessage).toHaveBeenCalledWith({
        userIds: [
          'selected-id-1',
          'selected-id-2',
        ],
      });
    });

    it('returns to conversation list when one on one conversation created', async function () {
      const createDirectMessage = jest.fn();
      const wrapper = subject({ createDirectMessage });
      wrapper.find('.header-button__icon').simulate('click');
      wrapper.find(CreateConversationPanel).prop('onStartGroupChat')();
      wrapper.update();

      // Can't do simulate on custom components when rendering fully. Convert to simulate after.
      wrapper.find(StartGroupPanel).prop('onContinue')(['id-1']);
      wrapper.update();

      expect(wrapper).not.toHaveElement(StartGroupPanel);
      expect(wrapper).not.toHaveElement(CreateConversationPanel);
      expect(wrapper).toHaveElement('.header-button');
      expect(wrapper).toHaveElement('.messages-list__items');
    });
  });

  describe('mapState', () => {
    const subject = (channels) => {
      return DirectMessageChat.mapState(getState(channels));
    };

    const getState = (channels) => {
      const channelData = normalize(channels);
      return {
        channelsList: { value: channelData.result },
        normalized: channelData.entities,
      } as RootState;
    };

    test('gets sorted conversations', () => {
      const state = subject([
        { id: 'convo-1', lastMessage: { createdAt: moment('2023-03-01').valueOf() }, isChannel: false },
        { id: 'convo-2', lastMessage: { createdAt: moment('2023-03-02').valueOf() }, isChannel: false },
      ]);

      expect(state.directMessages.map((c) => c.id)).toEqual([
        'convo-2',
        'convo-1',
      ]);
    });

    test('gets only conversations', () => {
      const state = subject([
        { id: 'convo-1', isChannel: false },
        { id: 'convo-2', isChannel: true },
        { id: 'convo-3', isChannel: false },
      ]);

      expect(state.directMessages.map((c) => c.id)).toEqual([
        'convo-1',
        'convo-3',
      ]);
    });
  });
});
