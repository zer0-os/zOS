import React from 'react';
import { shallow } from 'enzyme';
import { Container as DirectMessageChat, Properties } from '.';
import directMessagesFixture from './direct-messages-fixture.json';
import Tooltip from '../../tooltip';
import { Channel } from '../../../store/channels';
import { normalize } from '../../../store/channels-list';
import { Dialog } from '@zer0-os/zos-component-library';
import { SearchConversations } from '../search-conversations';
import { AutocompleteMembers } from '../autocomplete-members';
import { RootState } from '../../../store';
import moment from 'moment';

export const DIRECT_MESSAGES_TEST = directMessagesFixture as unknown as Channel[];

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

    return shallow(<DirectMessageChat {...allProps} />);
  };

  it('render direct message members', function () {
    const wrapper = subject({});

    expect(wrapper.find('.direct-message-members').exists()).toBe(true);
  });

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

  it('render members name', function () {
    const wrapper = subject({});

    wrapper.setProps({ directMessages: DIRECT_MESSAGES_TEST });

    const displayChatNames = wrapper.find('.direct-message-members__user-name').map((node) => node.text());

    expect(displayChatNames).toStrictEqual([
      'Charles Diya, Eric',
      'James Diya, Laz',
      'daily chat',
      'Eric',
    ]);
  });

  it('handle member click', function () {
    const setActiveDirectMessage = jest.fn();

    const wrapper = subject({ setActiveMessengerChat: setActiveDirectMessage });

    wrapper.setProps({ directMessages: DIRECT_MESSAGES_TEST });

    wrapper.find('.direct-message-members__user').first().simulate('click');

    expect(setActiveDirectMessage).toHaveBeenCalledWith('292444273_bd035e84edfbaf11251ffef196de2ab47496439c');
  });

  it('should not render read messages', function () {
    const wrapper = subject({});

    expect(wrapper.find('.direct-message-members__user-unread-count').exists()).toBe(false);
  });

  it('should render create direct messsages button', function () {
    const wrapper = subject({});

    expect(wrapper.find('.messages-list__direct-messages').exists()).toBe(true);
  });

  it('should render direct messsages dialog when DMs button is clicked', function () {
    const wrapper = subject({});
    wrapper.find('.messages-list__direct-messages').simulate('click');

    expect(wrapper.find(Dialog).exists()).toBe(false);
  });

  it('should render AutocompleteMembers', function () {
    const wrapper = subject({});

    wrapper.find('.header-button__icon').simulate('click');

    expect(wrapper.find(AutocompleteMembers).exists()).toBe(true);

    wrapper.find('.start__chat-return').simulate('click');

    expect(wrapper.find(AutocompleteMembers).exists()).toBe(false);
  });

  it('should render search conversations', function () {
    const wrapper = subject({});

    expect(wrapper.find(SearchConversations).exists()).toBe(true);
  });

  it('renders unread messages', function () {
    const [
      firstDirectMessage,
      ...restOfDirectMessages
    ] = DIRECT_MESSAGES_TEST;

    const unreadCount = 10;

    const wrapper = subject({});

    wrapper.setProps({
      directMessages: [
        {
          ...firstDirectMessage,
          unreadCount,
        },
        ...restOfDirectMessages,
      ],
    });
    expect(wrapper.find('.direct-message-members__user-unread-count').text()).toEqual(unreadCount.toString());
  });

  describe('tooltip', () => {
    let wrapper;

    beforeEach(() => {
      wrapper = subject({});
      wrapper.setProps({ directMessages: DIRECT_MESSAGES_TEST });
    });

    afterEach(() => {
      wrapper = null;
    });

    const tooltipList = () => {
      return wrapper.find(Tooltip);
    };

    it('renders', function () {
      expect(tooltipList().first().exists()).toBe(true);
    });

    it('renders placement to left', function () {
      const placementLeft = 'left';

      expect(tooltipList().map((tooltip) => tooltip.prop('placement'))).toEqual(Array(5).fill(placementLeft));
    });

    it('renders class name', function () {
      const className = 'direct-message-members__user-tooltip';

      expect(tooltipList().map((tooltip) => tooltip.prop('className'))).toEqual(Array(5).fill(className));
    });

    it('renders align prop', function () {
      const align = {
        offset: [
          10,
          0,
        ],
      };

      expect(tooltipList().map((tooltip) => tooltip.prop('align'))).toEqual(Array(5).fill(align));
    });

    it('renders content', function () {
      expect(tooltipList().map((tooltip) => tooltip.prop('overlay'))).toEqual([
        'Create Zero Message',
        'Charles Diya, Eric',
        'James Diya, Laz',
        'Online',
        'Last Seen: Never',
      ]);
    });

    it('renders status', function () {
      expect(
        tooltipList()
          .find('.direct-message-members__user-status')
          .map((tooltip) => tooltip.prop('className'))
      ).toEqual([
        'direct-message-members__user-status direct-message-members__user-status--active',
        'direct-message-members__user-status direct-message-members__user-status--active',
        'direct-message-members__user-status direct-message-members__user-status--active',
        'direct-message-members__user-status',
      ]);
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
