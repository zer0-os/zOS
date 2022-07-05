import React from 'react';

import { shallow } from 'enzyme';

import { Channels } from '.';
import { ChannelList } from './channel-list';

describe('Channels', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      ...props,
    };

    return shallow(<Channels {...allProps} />);
  };

  it('passes channels to ChannelList', () => {
    const channels = [{ id: 'one' }];

    const wrapper = subject({ channels });

    expect(wrapper.find(ChannelList).prop('channels')).toStrictEqual(channels);
  });
});
