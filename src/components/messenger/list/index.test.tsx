import React from 'react';
import { shallow } from 'enzyme';
import { Container as DirectMessageChat, Properties } from '.';
import directMessagesFixture from './direct-messages-fixture.json';
import Tooltip from '../../tooltip';
import { Channel } from '../../../store/channels';
import { Dialog } from '@zer0-os/zos-component-library';

export const DIRECT_MESSAGES_TEST = directMessagesFixture as unknown as Channel[];

describe('messenger-list', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      setActiveMessengerChat: jest.fn(),
      directMessages: DIRECT_MESSAGES_TEST,
      fetchDirectMessages: jest.fn(),
      createDirectMessage: jest.fn(),
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

  it('render members name', function () {
    const wrapper = subject({});

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

  it('renders unread messages', function () {
    const [
      firstDirectMessage,
      ...restOfDirectMessages
    ] = DIRECT_MESSAGES_TEST;

    const unreadCount = 10;

    const wrapper = subject({
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
});
