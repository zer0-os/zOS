import React from 'react';

import { shallow } from 'enzyme';
//import { ReactMic } from 'react-mic';
import MessageAudioRecorder, { Properties } from '.';

const ReactMic = () => {};
jest.mock('react-mic', () => {});

describe.skip('MessageAudioRecorder', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      onMediaSelected: jest.fn(),
      onClose: jest.fn(),
      ...props,
    };

    return shallow(<MessageAudioRecorder {...allProps} />);
  };

  it('should call remove audio when remove icon clicked', () => {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find('.message-audio-recorder__icons-delete').simulate('click');

    expect(onClose).toHaveBeenCalledOnce();
  });
});
