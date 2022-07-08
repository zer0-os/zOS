import React from 'react';

import { shallow } from 'enzyme';

import { ChannelView } from './channel-view';

describe('ChannelView', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      ...props,
    };

    return shallow(<ChannelView {...allProps} />);
  };

  it('renders channel name', () => {
    const wrapper = subject({ name: 'first channel' });

    const textes = wrapper.find('.channel-view__name').text().trim();

    expect(textes).toStrictEqual('first channel');
  });
});
