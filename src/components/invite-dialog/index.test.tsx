import React from 'react';

import { shallow } from 'enzyme';

import { InviteDialog, Properties } from '.';
import { Button } from '@zero-tech/zui/components';

describe('InviteDialog', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      inviteCode: '',
      inviteUrl: '',
      assetsPath: '',
      invitesUsed: 0,
      maxUses: 0,
      clipboard: { write: () => null },
      isLoading: false,
      ...props,
    };

    return shallow(<InviteDialog {...allProps} />);
  };

  it('renders the code remaining number of invites', function () {
    const wrapper = subject({ inviteCode: '23817', maxUses: 5, invitesUsed: 3 });

    expect(wrapper.find('.invite-dialog__remaining-invite').text()).toEqual('2');
  });

  it('copies the invitation to the clipboard', async function () {
    const clipboard = { write: jest.fn() };
    const wrapper = subject({ clipboard, inviteCode: '23817' });

    await withMockedSetTimeout(async () => {
      wrapper.find(Button).simulate('press');
    });

    expect(wrapper.find(Button).prop('isDisabled')).toBeFalse();
    expect(clipboard.write).toHaveBeenCalledWith(expect.stringContaining('23817'));
  });

  it('sets copy text to copied for a few seconds after copying the text', async function () {
    const clipboard = { write: jest.fn().mockResolvedValue(null) };
    const wrapper = subject({ clipboard });

    await withMockedSetTimeout(async (resolveTimeout) => {
      wrapper.find(Button).simulate('press');
      await releaseThread();
      expect(wrapper.state('copyText')).toEqual('Copied');

      resolveTimeout();
      await releaseThread();

      expect(wrapper.state('copyText')).toEqual('Copy Invite Code');
    });
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

function releaseThread() {
  return new Promise(setImmediate);
}

async function withMockedSetTimeout(runTest) {
  let resolveTimeout;
  const delayPromise = new Promise((resolve) => (resolveTimeout = resolve));

  const originalSetTimeout = globalThis.setTimeout;
  (globalThis.setTimeout as any) = jest.fn().mockImplementation(async (fn) => {
    await delayPromise;
    fn();
  });
  await runTest(resolveTimeout);

  // In case a test does not follow all the way through, allow timeouts to complete
  resolveTimeout();
  // Restore the original set timeout
  globalThis.setTimeout = originalSetTimeout;
}
