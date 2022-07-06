import React from 'react';

import { shallow } from 'enzyme';

import { ChannelList } from './channel-list';

describe('ChannelList', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      ...props,
    };

    return shallow(<ChannelList {...allProps} />);
  };

  it('renders each channel name', () => {
    const channels = [
      { id: 'one', name: 'first channel' },
      { id: 'two', name: 'second channel' },
      { id: 'three', name: 'third channel' },
      { id: 'four', name: 'fourth channel' },
    ];

    const wrapper = subject({ channels });

    const textes = wrapper.find('.channel-list__channel').map((c) => c.text().trim());

    expect(textes).toStrictEqual([
      'first channel',
      'second channel',
      'third channel',
      'fourth channel',
    ]);
  });
});
