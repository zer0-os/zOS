import React from 'react';

import { shallow } from 'enzyme';

import { InviteDialog, Properties } from '.';

describe('InviteDialog', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      inviteCode: '',
      inviteUrl: '',
      assetsPath: '',
      clipboard: { write: () => null },
      ...props,
    };

    return shallow(<InviteDialog {...allProps} />);
  };

  it('renders the code', function () {
    const wrapper = subject({ inviteCode: '23817' });

    expect(wrapper.find('.invite-dialog__code-block').text()).toContain('23817');
  });

  it('copies the invitation to the clipboard', function () {
    const clipboard = { write: jest.fn() };
    const wrapper = subject({ clipboard, inviteCode: '23817' });

    wrapper.find('.invite-dialog__inline-button').simulate('click');

    expect(clipboard.write).toHaveBeenCalledWith(expect.stringContaining('23817'));
  });

  it('sets button text to copied for a few seconds after copying the text', async function () {
    const clipboard = { write: jest.fn().mockResolvedValue(null) };
    jest.useFakeTimers();
    const wrapper = subject({ clipboard });

    wrapper.find('.invite-dialog__inline-button').simulate('click');
    await new Promise(setImmediate);

    expect(wrapper.find('.invite-dialog__inline-button').text()).toEqual('Copied');
    jest.runAllTimers();
    expect(wrapper.find('.invite-dialog__inline-button').text()).toEqual('Copy');
  });

  it('renders the loading state if code does not exist', function () {
    const wrapper = subject({ inviteCode: '' });

    expect(wrapper).toHaveElement('.invite-dialog__code-block Skeleton');
    expect(wrapper.find('.invite-dialog__code-block').text()).not.toContain('Here is an invite');
  });
});
