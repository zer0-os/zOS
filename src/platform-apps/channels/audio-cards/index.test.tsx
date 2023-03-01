import React from 'react';

import { shallow } from 'enzyme';
import AudioCards, { Properties } from '.';
import AudioCard from './audio-card';

describe('AudioCards', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      audios: [{ id: '', name: '', url: '' }],
      onRemove: jest.fn(),
      ...props,
    };

    return shallow(<AudioCards {...allProps} />);
  };

  it('renders AudioCard', function () {
    const audios = [{ id: 'id1', name: 'audio1', url: 'url_audio' }];
    const wrapper = subject({ audios });

    expect(wrapper.find(AudioCard).exists()).toBe(true);
  });

  it('should not renders AudioCard', function () {
    const audios = [];
    const wrapper = subject({ audios });

    expect(wrapper.find(AudioCard).exists()).toBe(false);
  });

  it('adds audio', function () {
    const audios = [{ id: 'id1', name: 'audio1', url: 'url_audio' }];
    const wrapper = subject({ audios });

    expect(wrapper.find(AudioCard).prop('audio')).toEqual(audios[0]);
  });
});
