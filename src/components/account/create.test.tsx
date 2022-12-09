import React from 'react';
import { shallow } from 'enzyme';
import { Container as CreateAccount } from './create';
import { Dialog } from '@zer0-os/zos-component-library';

describe('CreateAccount', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      currentAddress: '0x0000000000000000000000000000000000000001',
      fetchCurrentUser: jest.fn(),
      updateImageProfile: jest.fn(),
      createAndAuthorize: jest.fn(() => Promise.resolve({ accessToken: 'success' })),
      inviteCode: '29e012b1-9893-412d-997e-0c5c8296af2d',
      user: {
        data: null,
      },
      ...props,
    };

    return shallow(<CreateAccount {...allProps} />);
  };

  it('should not render Dialog', async () => {
    const wrapper = subject({});

    expect(wrapper.find(Dialog).exists()).toBe(false);
  });

  it('should render Dialog', async () => {
    const wrapper = subject({});

    await wrapper.setProps({ user: { nonce: 'nonce-was-set' } });

    expect(wrapper.find(Dialog).exists()).toBe(true);
  });

  it('should create a user', async () => {
    const currentAddress = '0x0000000000000000000000000000000000000001';
    const inviteCode = 'my-invite-code';
    const createAndAuthorize = jest.fn(() => Promise.resolve({ accessToken: 'success' }));
    const fetchCurrentUser = jest.fn();

    const wrapper = subject({ currentAddress, inviteCode, createAndAuthorize, fetchCurrentUser });

    const nonce = 'this-is-my-expiring-nonce';

    await wrapper.setProps({ user: { nonce } });

    const form = wrapper.find('.profile-prompt');
    form.simulate('submit', {
      preventDefault: () => {},
    });

    expect(createAndAuthorize).toHaveBeenCalledWith(
      nonce,
      { firstName: '0x0000...0001', handle: '0x0000...0001', lastName: '' },
      inviteCode
    );
  });

  it('should update image profile', async () => {
    const updateImageProfile = jest.fn();
    const profileId = '12-11';
    const wrapper = subject({ updateImageProfile });
    await wrapper.setProps({ user: { nonce: 'nonce-was-set', data: null } });

    await wrapper.setProps({ user: { isLoading: false, data: { profileId } } });

    expect(updateImageProfile).toHaveBeenCalledWith(profileId, null);
  });

  it('does not call fetchCurrentUser when error on createAndAuthorize', async () => {
    const currentAddress = '0x0000000000000000000000000000000000000001';
    const inviteCode = 'my-invite-code';

    const createAndAuthorize = jest.fn(() =>
      Promise.reject({ response: { body: { code: 'USER_HANDLE_ALREADY_EXISTS' } } })
    );
    const fetchCurrentUser = jest.fn();

    const wrapper = subject({ currentAddress, inviteCode, createAndAuthorize, fetchCurrentUser });

    const nonce = 'this-is-my-expiring-nonce';

    await wrapper.setProps({ user: { nonce } });

    const form = wrapper.find('.profile-prompt');
    form.simulate('submit', {
      preventDefault: () => {},
    });

    expect(fetchCurrentUser).not.toHaveBeenCalled();

    setTimeout(() => {
      expect(wrapper.find('.input__error-message').exists()).toBe(true);
    }, 0);
  });

  it('does not call without nonce', async () => {
    const createAndAuthorize = jest.fn(() => Promise.resolve({ accessToken: 'success' }));

    const wrapper = subject({ createAndAuthorize });

    await wrapper.setProps({ user: { nonce: null } });

    expect(createAndAuthorize).not.toHaveBeenCalled();
  });

  it('does not call without currentAddress', async () => {
    const createAndAuthorize = jest.fn(() => Promise.resolve({ accessToken: 'success' }));

    const wrapper = subject({ createAndAuthorize });

    await wrapper.setProps({ user: { nonce: 'nonce-was-set' }, currentAddress: null });

    expect(createAndAuthorize).not.toHaveBeenCalled();
  });
});
