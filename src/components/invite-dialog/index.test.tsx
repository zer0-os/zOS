import React from 'react';

import { shallow } from 'enzyme';

import { InviteDialog, Properties } from '.';

describe('InviteDialog', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      inviteCode: '',
      inviteUrl: '',
      assetsPath: '',
      invitesUsed: 0,
      maxUses: 0,
      isUserAMemberOfWorlds: false,
      clipboard: { write: () => null },
      isLoading: false,
      ...props,
    };

    return shallow(<InviteDialog {...allProps} />);
  };

  it('renders the code', function () {
    const wrapper = subject({ inviteCode: '23817' });

    expect(wrapper.find('textarea').prop('value')).toContain('23817');
  });

  it('copies the invitation to the clipboard', function () {
    const clipboard = { write: jest.fn() };
    const wrapper = subject({ clipboard, inviteCode: '23817' });

    wrapper.find('.invite-dialog__inline-button').simulate('click');

    expect(wrapper.find('.invite-dialog__inline-button').prop('disabled')).toBeFalse();
    expect(clipboard.write).toHaveBeenCalledWith(expect.stringContaining('23817'));
  });

  it('sets button text to copied for a few seconds after copying the text', async function () {
    const clipboard = { write: jest.fn().mockResolvedValue(null) };
    jest.useFakeTimers();
    const wrapper = subject({ clipboard });

    wrapper.find('.invite-dialog__inline-button').simulate('click');
    await new Promise(setImmediate);

    expect(wrapper.find('.invite-dialog__inline-button').text()).toEqual('COPIED');
    jest.runAllTimers();
    expect(wrapper.find('.invite-dialog__inline-button').text()).toEqual('COPY');
  });

  it('does not render the text content if no invite code', function () {
    const wrapper = subject({ inviteCode: '' });

    expect(wrapper.find('.invite-dialog__code-block').text()).not.toContain('Here is an invite');
  });

  it('does not render the text content if isLoading is true ', function () {
    const wrapper = subject({ inviteCode: '12345', isLoading: true });

    expect(wrapper.find('.invite-dialog__code-block').text()).not.toContain('Here is an invite');
  });

  it('disables copy button if code does not exist', function () {
    const wrapper = subject({ inviteCode: '' });

    expect(wrapper.find('.invite-dialog__inline-button').prop('disabled')).toBeTrue();
  });

  describe('invite text', () => {
    it('renders the invite code in a textarea', function () {
      const wrapper = subject({ inviteCode: '23817' });

      expect(wrapper.find('textarea').prop('value')).toContain('23817');
    });

    it('should not be editable', function () {
      const wrapper = subject({ inviteCode: '23817' });

      expect(wrapper.find('textarea').prop('readOnly')).toBeTrue();
    });
  });

  it('publishes close event.', function () {
    const onClose = jest.fn();
    const wrapper = subject({ onClose });

    wrapper.find('IconButton').simulate('click');

    expect(onClose).toHaveBeenCalled();
  });

  it('displays text in green if invites remaining', function () {
    // 2 invites left
    let wrapper = subject({ inviteCode: '123456', invitesUsed: 3, maxUses: 5 });
    expect(wrapper.find('.invite-dialog__invite-left').exists()).toBeTrue();

    // no invite left
    wrapper = subject({ inviteCode: '123456', invitesUsed: 5, maxUses: 5 });
    expect(wrapper.find('.invite-dialog__invite-left').exists()).toBeFalse();
  });

  it('renders network notification alert if user is in full screen, and is a part of networks', function () {
    let wrapper = subject({ inviteCode: '123456', isUserAMemberOfWorlds: false });
    expect(wrapper.find('.invite-dialog__network-alert').exists()).toBeFalse();

    wrapper = subject({ inviteCode: '123456', isUserAMemberOfWorlds: true });
    expect(wrapper.find('.invite-dialog__network-alert').exists()).toBeTrue();
  });
});
