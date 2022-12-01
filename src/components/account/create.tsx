import React, { ChangeEvent, FormEvent } from 'react';
import { Dialog } from '@zer0-os/zos-component-library';

import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { config } from '../../config';
import { fetchCurrentUser } from '../../store/authentication';
import { createAndAuthorize, updateImageProfile } from '../../store/authentication/api';
import { AuthenticationState, AuthorizationResponse } from '../../store/authentication/types';
import { ImageUpload } from '../image-upload';
import { Button } from '@zer0-os/zos-component-library';

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
  profileImage: File;
}

export class Container extends React.Component<Properties, State> {
  state = { displayName: '', showDialog: false, profileImage: null };
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
      this.setState({
        showDialog: true,
      });
    }

    if (
      this.state.showDialog &&
      this.props.user.isLoading === false &&
      prevProps.user &&
      prevProps.user.data === null &&
      this.props.user.data !== null
    ) {
      this.updateProfileImage();
    }
  };

  shortAddress = (): string => {
    const { currentAddress } = this.props;

    if (!currentAddress) {
      return '';
    } else {
      return [
        currentAddress.slice(0, 6),
        '...',
        currentAddress.slice(-4),
      ].join('');
    }
  };

  closeDialog() {
    this.setState({
      showDialog: false,
    });
  }

  updateProfileImage = async (): Promise<void> => {
    const profileId = this.props.user.data.profileId;

    try {
      await this.props.updateImageProfile(profileId, this.state.profileImage);
      this.closeDialog();
    } catch (error) {
      console.log('updating image profile failed. error:', error);
    }
  };

  onSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const {
      user: { nonce },
      createAndAuthorize,
      fetchCurrentUser,
      inviteCode,
    } = this.props;

    const handle = this.shortAddress();

    const user = { handle, firstName: this.state.displayName || handle, lastName: '' };

    const authorizationResult = await createAndAuthorize(nonce, user, inviteCode)
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

    if (authorizationResult) {
      fetchCurrentUser();
    }
  };

  onDisplayNameChange = (event: ChangeEvent<HTMLInputElement>): void => {
    this.setState({
      displayName: event.target.value,
    });
  };

  onImageChange = (file: File): void => {
    this.setState({
      profileImage: file,
    });
  };

  render() {
    if (!this.state.showDialog) {
      return null;
    }

    return (
      <Dialog>
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
            <Button onClick={this.onSubmit}>Create Account</Button>
          </div>
        </form>
      </Dialog>
    );
  }
}

export const Create = connectContainer<{}>(Container);
