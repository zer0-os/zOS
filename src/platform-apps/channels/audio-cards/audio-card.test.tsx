import React from 'react';
import { shallow } from 'enzyme';
import AudioCard, { Properties } from './audio-card';
import { bemClassName } from '../../../lib/bem';

const cn = bemClassName('audio-card');

describe('AudioCard', () => {
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

    expect(wrapper.find(cn())).toExist();
  });

  it('renders audio block with controls', function () {
    const wrapper = subject({});

    const audio = wrapper.find(cn('block-audio')).find('audio');
    expect(audio).toExist();
    expect(audio).toHaveProp('controls', true);
    expect(audio).toHaveProp('controlsList', 'nodownload nofullscreen noplaybackrate');
  });

  it('renders audio source with correct url', function () {
    const audio = { id: 'id1', name: 'audio1', url: 'url_audio' };
    const wrapper = subject({ audio });

    expect(wrapper.find('audio source').prop('src')).toEqual(audio.url);
  });

  it('renders delete icon when onRemove is provided', function () {
    const wrapper = subject({});

    expect(wrapper.find(cn('actions'))).toExist();
    expect(wrapper.find(cn('actions-delete'))).toExist();
  });

  it('calls onRemove when delete icon is clicked', function () {
    const onRemove = jest.fn();
    const wrapper = subject({ onRemove });

    wrapper.find(cn('actions-delete')).simulate('click');

    expect(onRemove).toHaveBeenCalledOnce();
  });

  it('does not render delete icon when onRemove is not provided', function () {
    const wrapper = subject({ onRemove: undefined });

    expect(wrapper.find(cn('actions'))).not.toExist();
  });
});
