import React from 'react';

import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { config } from '../../config';
import { fetchCurrentUser } from '../../store/authentication';
import { createAndAuthorize } from '../../store/authentication/api';
import { AuthenticationState, AuthorizationResponse } from '../../store/authentication/types';

export interface Properties {
  currentAddress: string;
  fetchCurrentUser: () => void;
  user: AuthenticationState['user'];

  createAndAuthorize: (nonce: string, user: object, inviteCode: string) => Promise<AuthorizationResponse>;
  inviteCode: string;
}

export class Container extends React.Component<Properties> {
  static defaultProps = { createAndAuthorize, inviteCode: config.inviteCode.dejaVu };

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
    return {
      fetchCurrentUser,
    };
  }

  componentDidUpdate = async (prevProps: Properties) => {
    const {
      user: { nonce },
      currentAddress,
      createAndAuthorize,
      fetchCurrentUser,
      inviteCode,
    } = this.props;

    if (nonce && currentAddress && prevProps.user?.nonce !== nonce) {
      const authResult = await createAndAuthorize(nonce, this.user(currentAddress), inviteCode)
        .then((response) => response)
        .catch((error) => {
          const {
            response: {
              body: { code },
            },
          } = error;

          if (/USER_HANDLE_ALREADY_EXISTS/.test(code)) {
            console.log('Sorry that user handle has already been taken');
          }
        });

      if (authResult) fetchCurrentUser();
    }
  };

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
