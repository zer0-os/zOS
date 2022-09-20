import React from 'react';
import Cookies from 'js-cookie';
import Web3Utils from 'web3-utils';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';

import { inject as injectWeb3 } from '../../lib/web3/web3-react';
import { inject as injectProviderService } from '../../lib/web3/provider-service';
import { ConnectionStatus } from '../../lib/web3';
import { setAccessToken } from '../../store/authentication';
import { config } from '../../config';
import { authorize } from '../../store/authentication';

export interface Properties {
  connectionStatus: ConnectionStatus;
  setAccessToken: (accesToken: string) => void;
  providerService: { get: () => any };
  accessToken: string;
  currentAddress: string;
  authorizeUser: (payload: { signedWeb3Token: string }) => void;
  getFromCookie: (cookieName: string) => string;
}

interface State {
  hasConnected: boolean;
}

export const ACCESS_TOKEN_COOKIE_NAME = 'zero-access-token';

export class Container extends React.Component<Properties, State> {
  static defaultProps = {
    getFromCookie: Cookies.get,
  };

  static mapState(state: RootState): Partial<Properties> {
    const {
      authentication: { accessToken },
      web3: { status, value },
    } = state;

    return {
      accessToken,
      currentAddress: value.address,
      connectionStatus: status,
      authorizeUser: authorize,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      setAccessToken,
    };
  }

  componentDidMount() {
    this.handleToken();
  }

  componentDidUpdate(prevProps: Properties) {
    if (
      prevProps.connectionStatus !== ConnectionStatus.Connected &&
      this.props.connectionStatus === ConnectionStatus.Connected &&
      this.props.currentAddress
    ) {
      this.authorize();
    }
  }

  handleToken() {
    const accessToken = this.props.getFromCookie(ACCESS_TOKEN_COOKIE_NAME);

    if (accessToken) {
      this.props.setAccessToken(accessToken);
    }
  }

  get isLoggedIn(): Boolean {
    return Boolean(this.props.accessToken);
  }

  authorize(): void {
    if (this.isLoggedIn) {
      return;
    }

    const web3Provider = this.props.providerService.get();

    const method = 'personal_sign';
    const from = Web3Utils.toHex(this.props.currentAddress.toLowerCase());
    const params = [
      config.web3AuthenticationMessage,
      from,
    ];

    try {
      web3Provider.provider.sendAsync(
        {
          method,
          params,
          from,
        },
        (err, res) => {
          if (err) console.log(err);

          this.props.authorizeUser({ signedWeb3Token: res.result });
        }
      );
    } catch (error) {
      console.log(error);
    }
  }

  render() {
    return null;
  }
}

export const Authentication = injectProviderService(injectWeb3(connectContainer<{}>(Container)));
