import React from 'react';

import { shallow } from 'enzyme';

import { Container, Properties } from './container';
import { RootState } from '../../store/reducer';
import { CreateInvitationState } from '../../store/create-invitation';

describe('Container', () => {
  const subject = (props: Partial<Properties>) => {
    const allProps: Properties = {
      inviteCode: '',
      inviteUrl: '',
      assetPath: '',
      inviteCount: 0,
      isLoading: false,
      fetchInvite: () => null,
      clearInvite: () => null,
      ...props,
    };

    return shallow(<Container {...allProps} />);
  };

  it('fetches the invite code on render', function () {
    const fetchInvite = jest.fn();
    subject({ fetchInvite });

    expect(fetchInvite).toHaveBeenCalledOnce();
  });

  it('clears the invite code when unmounted', function () {
    const clearInvite = jest.fn();
    const wrapper = subject({ clearInvite });

    wrapper.unmount();

    expect(clearInvite).toHaveBeenCalled();
  });

  describe('mapState', () => {
    const subject = (invitationState: Partial<CreateInvitationState> = {}) => {
      const state = {
        createInvitation: { code: '', ...invitationState },
      } as RootState;
      return Container.mapState(state);
    };

    it('inviteCode', () => {
      const props = subject({ code: '1117' });

      expect(props.inviteCode).toEqual('1117');
    });

    it('inviteUrl', () => {
      const props = subject({ url: 'some-url' });

      expect(props.inviteUrl).toEqual('some-url');
    });
  });
});
