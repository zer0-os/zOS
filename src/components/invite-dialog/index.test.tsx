import React from 'react';

import { shallow } from 'enzyme';

import { InviteDialog, Properties } from '.';
import { Button } from '@zero-tech/zui/components';
import { releaseThread } from '../../test/utils';
import { config } from '../../config';

describe('InviteDialog', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      inviteCode: '',
      inviteUrl: '',
      assetsPath: '',
      inviteCount: 0,
      clipboard: { write: () => null },
      isLoading: false,
      ...props,
    };

    return shallow(<InviteDialog {...allProps} />);
  };

  it('renders the code remaining number of invites', function () {
    const wrapper = subject({ inviteCode: '23817', inviteCount: 2 });

    expect(wrapper.find('.invite-dialog__remaining-invite').text()).toEqual('2');
  });

  it('copies the invitation to the clipboard', function () {
    const clipboard = { write: jest.fn() };
    const wrapper = subject({ clipboard, inviteCode: '23817' });

    wrapper.find(Button).simulate('press');

    expect(wrapper.find(Button).prop('isDisabled')).toBeFalse();
    expect(clipboard.write).toHaveBeenCalledWith(
      expect.stringMatching(`Use this code to join me on ZERO Messenger: 23817 ${config.inviteUrl}`)
    );
  });

  it('sets copy text to copied for a few seconds after copying the text', async function () {
    const clipboard = { write: jest.fn().mockResolvedValue(null) };
    jest.useFakeTimers();
    const wrapper = subject({ clipboard });

    wrapper.find(Button).simulate('press');
    await releaseThread();

    expect(wrapper.state('copyText')).toEqual('Copied');
    jest.runAllTimers();
    expect(wrapper.state('copyText')).toEqual('Copy Invite Code');
  });

  it('disables copy button if code does not exist', function () {
    const wrapper = subject({ inviteCode: '' });

    expect(wrapper.find(Button).prop('isDisabled')).toBeTrue();
  });

  it('publishes close event.', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find('IconButton').simulate('click');

    expect(onClose).toHaveBeenCalled();
  });
});
