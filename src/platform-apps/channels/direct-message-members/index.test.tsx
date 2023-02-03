import React from 'react';
import { shallow } from 'enzyme';
import { Container as DirectMessageChat, Properties } from './';
import { DIRECT_MESSAGES_TEST } from '../../../store/direct-messages/saga.test';
import Tooltip from '../../../components/tooltip';

describe('direct-message-members', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      setActiveDirectMessage: jest.fn(),
      directMessages: DIRECT_MESSAGES_TEST,
      startSyncDirectMessage: jest.fn(),
      stopSyncDirectMessage: jest.fn(),
      ...props,
    };

    return shallow(<DirectMessageChat {...allProps} />);
  };

  it('render direct message members', function () {
    const wrapper = subject({});

    expect(wrapper.find('.direct-message-members').exists()).toBe(true);
  });

  it('start sync direct messages', function () {
    const startSyncDirectMessage = jest.fn();

    subject({ startSyncDirectMessage });

    expect(startSyncDirectMessage).toHaveBeenCalledOnce();
  });

  it('stop sync', function () {
    const stopSyncDirectMessage = jest.fn();

    const wrapper = subject({ stopSyncDirectMessage });
    wrapper.unmount();

    expect(stopSyncDirectMessage).toHaveBeenCalledOnce();
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

    const wrapper = subject({ setActiveDirectMessage });

    wrapper.find('.direct-message-members__user').first().simulate('click');

    expect(setActiveDirectMessage).toHaveBeenCalledWith('292444273_bd035e84edfbaf11251ffef196de2ab47496439c');
  });

  it('should not render read messages', function () {
    const wrapper = subject({});

    expect(wrapper.find('.direct-message-members__user-unread-count').exists()).toBe(false);
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

      expect(tooltipList().map((tooltip) => tooltip.prop('placement'))).toEqual(Array(4).fill(placementLeft));
    });

    it('renders class name', function () {
      const className = 'direct-message-members__user-tooltip';

      expect(tooltipList().map((tooltip) => tooltip.prop('className'))).toEqual(Array(4).fill(className));
    });

    it('renders align prop', function () {
      const align = {
        offset: [
          10,
          0,
        ],
      };

      expect(tooltipList().map((tooltip) => tooltip.prop('align'))).toEqual(Array(4).fill(align));
    });

    it('renders content', function () {
      expect(tooltipList().map((tooltip) => tooltip.prop('overlay'))).toEqual([
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
