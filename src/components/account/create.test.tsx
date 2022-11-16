import React from 'react';
import { shallow } from 'enzyme';
import { Container as CreateAccount } from './create';

describe('CreateAccount', () => {
  const subject = (props: any = {}) => {
    const allProps = {
      currentAddress: '0x0000000000000000000000000000000000000001',
      fetchCurrentUser: jest.fn(),
      createAndAuthorize: jest.fn(() => Promise.resolve({ accessToken: 'success' })),
      inviteCode: '29e012b1-9893-412d-997e-0c5c8296af2d',
      ...props,
    };

    return shallow(<CreateAccount {...allProps} />);
  };

  describe('fetchCurrentUser', () => {
    it('verifies', async () => {
      const fetchCurrentUser = jest.fn();

      const wrapper = subject({ fetchCurrentUser });

      await wrapper.setProps({ user: { nonce: 'nonce-was-set' } });

      await new Promise(setImmediate);

      expect(fetchCurrentUser).toHaveBeenCalledWith();
    });

    it('does not call when error on createAndAuthorize', async () => {
      const fetchCurrentUser = jest.fn();
      const createAndAuthorize = jest.fn(() =>
        Promise.reject({ response: { body: { code: 'USER_HANDLE_ALREADY_EXISTS' } } })
      );

      const wrapper = subject({ createAndAuthorize });

      await wrapper.setProps({ user: { nonce: 'nonce-was-set' } });

      await new Promise(setImmediate);

      expect(fetchCurrentUser).not.toHaveBeenCalled();
    });
  });

  describe('createAndAuthorize', () => {
    it('verifies', async () => {
      const currentAddress = '0x0000000000000000000000000000000000000001';
      const inviteCode = 'my-invite-code';
      const createAndAuthorize = jest.fn(() => Promise.resolve({ accessToken: 'success' }));

      const wrapper = subject({ currentAddress, inviteCode, createAndAuthorize });

      const nonce = 'this-is-my-expiring-nonce';

      await wrapper.setProps({ user: { nonce } });

      expect(createAndAuthorize).toHaveBeenCalledWith(
        nonce,
        { firstName: '0x0000...0001', handle: '0x0000...0001', lastName: '' },
        inviteCode
      );
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
});
