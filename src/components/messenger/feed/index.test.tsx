import React from 'react';
import { shallow } from 'enzyme';
import { Container as MessengerFeed, Properties } from '.';
import { StoreBuilder, stubConversation } from '../../../store/test/store';

import { bem } from '../../../lib/bem';

const c = bem('.messenger-feed');

describe(MessengerFeed, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      channel: null,
      isSocialChannel: false,
      ...props,
    };

    return shallow(<MessengerFeed {...allProps} />);
  };

  it('renders Messenger Feed when isSocialChannel is true', () => {
    const wrapper = subject({ isSocialChannel: true });
    expect(wrapper);
  });

  it('does not render Messenger Feed when isSocialChannel is false', () => {
    const wrapper = subject({ isSocialChannel: false });
    expect(wrapper).not.toHaveText('Messenger Feed');
  });

  it('renders messages as posts when there are messages with isPost flag', () => {
    const channel = stubConversation({
      messages: [
        { id: 1, message: 'Message 1', isPost: false },
        { id: 2, message: 'Message 2', isPost: true },
        { id: 3, message: 'Message 3', isPost: true },
        { id: 4, message: 'Message 4', isPost: false },
      ] as any,
    });

    const wrapper = subject({ channel: channel as any, isSocialChannel: true });
    const feed = wrapper.find(c('feed-view'));

    expect(feed.text()).not.toContain('Message 1');
    expect(feed.text()).toContain('Message 2');
    expect(feed.text()).toContain('Message 3');
    expect(feed.text()).not.toContain('Message 4');
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
