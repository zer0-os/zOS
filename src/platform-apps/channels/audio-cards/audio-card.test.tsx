import React from 'react';

import { shallow } from 'enzyme';
import AudioCard, { Properties } from './audio-card';

describe('Menu', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      audio: { id: '', name: '', url: '' },
      onRemove: jest.fn(),
      ...props,
    };

    return shallow(<AudioCard {...allProps} />);
  };

  it('renders audio card', function () {
    const wrapper = subject({});

    expect(wrapper.find('.audio__cards-card').exists()).toBe(true);
  });

  it('renders audio url', function () {
    const audio = { id: 'id1', name: 'audio1', url: 'url_audio' };
    const wrapper = subject({ audio });

    expect(wrapper.find('.audio__cards-card__audio source').prop('src')).toEqual(audio.url);
  });

  it('should call remove audio when remove icon clicked', function () {
    const onRemove = jest.fn();
    const wrapper = subject({ onRemove });

    wrapper.find('.audio__cards-card__actions-delete').simulate('click');

    expect(onRemove).toHaveBeenCalledOnce();
  });
});
