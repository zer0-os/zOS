import React from 'react';

import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { config } from '../../config';
import { createAndAuthorize } from '../../store/authentication/api';
import { AuthenticationState } from '../../store/authentication/types';

export interface Properties {
  currentAddress: string;
  user: AuthenticationState['user'];
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      authentication: { user },
      web3: { value },
    } = state;

    return {
      currentAddress: value.address,
      user,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  componentDidUpdate(prevProps: Properties) {
    const {
      user: { nonce },
      currentAddress,
    } = this.props;
    const inviteCode = config.inviteCode.dejaVu;

    if (nonce && currentAddress && prevProps.user?.nonce !== nonce) {
      createAndAuthorize(nonce, this.user(currentAddress), inviteCode).catch((error) => {
        const {
          response: {
            body: { code },
          },
        } = error;

        if (/USER_HANDLE_ALREADY_EXISTS/.test(code)) {
          console.log('Sorry that user handle has already been taken');
        }
      });
    }
  }

  user(currentAddress) {
    const handle = [
      currentAddress.slice(0, 6),
      '...',
      currentAddress.slice(-4),
    ].join('');

    return { handle, firstName: handle, lastName: '' };
  }

  render() {
    return null;
  }
}

export const Create = connectContainer<{}>(Container);
