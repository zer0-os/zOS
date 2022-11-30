import React, { ChangeEvent } from 'react';
import { Dialog } from '@zer0-os/zos-component-library';

import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { config } from '../../config';
import { fetchCurrentUser } from '../../store/authentication';
import { createAndAuthorize, updateImageProfile } from '../../store/authentication/api';
import { AuthenticationState, AuthorizationResponse } from '../../store/authentication/types';
import { ImageUpload } from '../image-upload/image-upload';
import './styles.scss';

export interface Properties {
  currentAddress: string;
  fetchCurrentUser: () => void;
  user: AuthenticationState['user'];

  createAndAuthorize: (nonce: string, user: object, inviteCode: string) => Promise<AuthorizationResponse>;
  updateImageProfile: (profileId: string, iamgeFile: any) => Promise<AuthorizationResponse>;
  inviteCode: string;
}

interface State {
  displayName: string;
  showDialog: boolean;
}

export class Container extends React.Component<Properties, State> {
  state = { displayName: '', showDialog: false };
  static defaultProps = { createAndAuthorize, updateImageProfile, inviteCode: config.inviteCode.dejaVu };

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
    } = this.props;

    if (nonce && currentAddress && prevProps.user?.nonce !== nonce) {
      console.log('ahsdjhasjdhasjhd');
      this.setState({
        showDialog: true,
      });
    }
  };

  shortAddress = (): string => {
    const { currentAddress } = this.props;

    return [
      currentAddress.slice(0, 6),
      '...',
      currentAddress.slice(-4),
    ].join('');
  };

  onSubmit = async (event) => {
    event.preventDefault();

    const {
      user: { nonce },
      createAndAuthorize,
      fetchCurrentUser,
      inviteCode,
    } = this.props;

    const handle = this.shortAddress();

    const user = { handle, firstName: this.state.displayName || handle, lastName: '' };

    // debugger;
    // return
    const authorizationResult = await createAndAuthorize(nonce, user, inviteCode)
      .then((response) => {
        console.log(response);
        debugger;
        // updateImageProfile(response)
        return response;
      })
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

    if (authorizationResult) {
      fetchCurrentUser();
    }
  };

  onDisplayNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      displayName: event.target.value,
    });
  };

  handleClose = () => {};

  onImageChange = (file: File): void => {
    console.log('file', file);
  };

  render() {
    if (!this.state.showDialog) {
      return null;
    }

    return (
      <Dialog onClose={this.handleClose}>
        <form
          className='profile-prompt'
          onSubmit={this.onSubmit}
        >
          <div className='profile-prompt__head'>Create your account</div>
          <div className='profile-prompt__address'>
            <div className='profile-prompt__connection-status'>Connected:</div>
            <div className='profile-prompt__address-value'>{this.shortAddress()}</div>
          </div>
          <div className='profile-prompt__picture'>
            <h3 className='profile-prompt__title'>Display Picture</h3>
            <p className='profile-prompt__text'>
              This is the image associated with your account that other citizens of ZERO will see
            </p>
            <div className='profile-prompt__image-upload'>
              <ImageUpload onChange={this.onImageChange} />
            </div>
          </div>

          <div className='profile-prompt__display-name'>
            <h3 className='profile-prompt__title'>Display Name</h3>
            <p className='profile-prompt__text'>This is the name that other citizens of ZERO will see</p>
            <input
              type='text'
              value={this.state.displayName}
              className='profile-prompt__input-text'
              onChange={this.onDisplayNameChange}
            />
          </div>

          <div className='profile-prompt__submit'>
            <input
              type='submit'
              value='Create Account'
            />
          </div>
        </form>
      </Dialog>
    );
  }
}

export const Create = connectContainer<{}>(Container);
