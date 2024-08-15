import React from 'react';
import { shallow } from 'enzyme';
import { Container as MessengerFeed, Properties } from '.';
import { StoreBuilder, stubConversation } from '../../../store/test/store';

describe(MessengerFeed, () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
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
