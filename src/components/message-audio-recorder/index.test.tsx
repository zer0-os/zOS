/**
 * @jest-environment jsdom
 */

import React from 'react';

import { shallow } from 'enzyme';
import MessageAudioRecorder, { Properties } from '.';

const mockMedia = {
  getUserMedia: jest.fn().mockImplementation(() => Promise.resolve('stream')),
};

describe('MessageAudioRecorder', () => {
  beforeEach(() => {
    Object.defineProperty(global.navigator, 'mediaDevices', {
      configurable: true,
      writable: true,
      value: {
        getUserMedia: jest.fn().mockResolvedValueOnce(mockMedia),
      },
    });
  });

  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      onMediaSelected: jest.fn(),
      onClose: jest.fn(),
      ...props,
    };

    return shallow(<MessageAudioRecorder {...allProps} />);
  };

  it('should call remove audio when remove icon clicked', async () => {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    await Promise.resolve();

    wrapper.find('.message-audio-recorder__icons-delete').simulate('click');

    expect(onClose).toHaveBeenCalledOnce();
  });
});
