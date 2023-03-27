import React, { ChangeEvent, FormEvent } from 'react';
import { Dialog } from '@zer0-os/zos-component-library';

import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { config } from '../../config';
import { fetchCurrentUserWithChatAccessToken } from '../../store/authentication';
import { createAndAuthorize, updateImageProfile } from '../../store/authentication/api';
import { AuthenticationState, AuthorizationResponse } from '../../store/authentication/types';
import { ImageUpload } from '../image-upload';
import { Button } from '@zer0-os/zos-component-library';

import './styles.scss';
import classNames from 'classnames';

export interface Properties {
  currentAddress: string;
  fetchCurrentUserWithChatAccessToken: () => void;
  user: AuthenticationState['user'];
  createAndAuthorize: (nonce: string, user: object, inviteCode: string) => Promise<AuthorizationResponse>;
  updateImageProfile: (profileId: string, iamgeFile: any) => Promise<AuthorizationResponse>;
  inviteCode: string;
}

interface State {
  displayName: string;
  showDialog: boolean;
  profileImage: File;
  displayNameError: string;
  error: string;
}

export class Container extends React.Component<Properties, State> {
  state = {
    displayName: '',
    showDialog: false,
    profileImage: null,
    displayNameError: '',
    error: '',
  };

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
      fetchCurrentUserWithChatAccessToken,
    };
  }

  componentDidUpdate = async (prevProps: Properties) => {
    const {
      user: { nonce },
      currentAddress,
    } = this.props;

    if (nonce && currentAddress && prevProps.user?.nonce !== nonce) {
      this.setState({
        displayName: this.shortAddress(),
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

  updateProfileImage = async () => {
    if (!this.state.profileImage) {
      this.closeDialog();
      return;
    }

    const profileId = this.props.user.data.profileId;

    try {
      await this.props.updateImageProfile(profileId, this.state.profileImage);
      this.closeDialog();
    } catch (error) {
      if (typeof error === 'string') {
        this.setState({ error: error });
      } else {
        this.setState({ error: 'updating image profile failed.' });
      }
    }
  };

  onSubmit = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const {
      user: { nonce },
      createAndAuthorize,
      fetchCurrentUserWithChatAccessToken,
      inviteCode,
    } = this.props;

    const { displayName } = this.state;

    const user = { handle: displayName, firstName: displayName, lastName: '' };
    const authorizationResult = await createAndAuthorize(nonce, user, inviteCode)
      .then((response) => response)
      .catch((error) => {
        const {
          response: {
            body: { code },
          },
        } = error;

        if (/USER_HANDLE_ALREADY_EXISTS/.test(code)) {
          this.setState({
            displayNameError: 'Sorry, that name has already been claimed, Please try again',
          });
        } else if (typeof error === 'string') {
          this.setState({ error });
        } else {
          this.setState({ error: 'Creating user failed' });
        }
      });

    if (authorizationResult) {
      fetchCurrentUserWithChatAccessToken();
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

  renderError(message: string) {
    return (
      <div className='input__error-message'>
        <svg
          width='16'
          height='16'
          viewBox='0 0 16 16'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
          className='input__error-message-icon'
        >
          <g clip-path='url(#clip0_5179_13261)'>
            <path
              d='M8.00004 5.33333V8M8.00004 10.6667H8.00671M14.6667 8C14.6667 11.6819 11.6819 14.6667 8.00004 14.6667C4.31814 14.6667 1.33337 11.6819 1.33337 8C1.33337 4.3181 4.31814 1.33333 8.00004 1.33333C11.6819 1.33333 14.6667 4.3181 14.6667 8Z'
              stroke='#FF6369'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </g>
          <defs>
            <clipPath id='clip0_5179_13261'>
              <rect
                width='16'
                height='16'
                fill='white'
              />
            </clipPath>
          </defs>
        </svg>
        <span>{message}</span>
      </div>
    );
  }

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
              className={classNames('profile-prompt__input-text', {
                input__error: Boolean(this.state.displayNameError),
              })}
              onChange={this.onDisplayNameChange}
              autoFocus={true}
            />
            {Boolean(this.state.displayNameError) && this.renderError(this.state.displayNameError)}
          </div>

          {Boolean(this.state.error) && this.renderError(this.state.error)}

          <div className='profile-prompt__submit'>
            <Button
              tabIndex={0}
              onClick={this.onSubmit}
              onEnterKeyPress={this.onSubmit}
            >
              Create Account
            </Button>
          </div>
        </form>
      </Dialog>
    );
  }
}

export const Create = connectContainer<{}>(Container);
