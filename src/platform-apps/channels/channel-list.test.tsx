import React from 'react';

import { shallow } from 'enzyme';

import { ChannelList } from './channel-list';
import { ZnsLink } from '@zer0-os/zos-component-library';

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

    const textes = wrapper.find('.channel-list__channel-name').map((c) => c.text().trim());

    expect(textes).toStrictEqual([
      'first channel',
      'second channel',
      'third channel',
      'fourth channel',
    ]);
  });

  it('adds an octothorpe to channel name', () => {
    const channels = [
      { id: 'one', name: 'first channel' },
      { id: 'two', name: 'second channel' },
      { id: 'three', name: 'third channel' },
      { id: 'four', name: 'fourth channel' },
    ];

    const wrapper = subject({ channels });

    const textes = wrapper.find('.channel-list__channel-name-prefix').map((c) => c.text().trim());

    expect(textes).toStrictEqual([
      '#',
      '#',
      '#',
      '#',
    ]);
  });

  it('renders Link to channel id', () => {
    const channels = [
      { id: 'one', name: 'first channel' },
      { id: 'two', name: 'second channel' },
      { id: 'three', name: 'third channel' },
      { id: 'four', name: 'fourth channel' },
    ];

    const wrapper = subject({ channels });

    const textes = wrapper.find(ZnsLink).map((l) => l.prop('to'));

    expect(textes).toStrictEqual([
      'one',
      'two',
      'three',
      'four',
    ]);
  });

  it('adds class to current channel', () => {
    const channels = [
      { id: 'one', name: 'first channel' },
      { id: 'two', name: 'second channel' },
      { id: 'three', name: 'third channel' },
      { id: 'four', name: 'fourth channel' },
    ];

    const wrapper = subject({ channels, currentChannelId: 'three' });

    const activeChannelLink = wrapper.find(ZnsLink).at(2);

    expect(activeChannelLink.hasClass('active')).toBeTrue();
  });
});
