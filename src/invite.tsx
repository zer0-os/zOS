import React from 'react';
import { RootState } from './store/reducer';
import { connectContainer } from './store/redux-container';
import { ReactComponent as ZeroLogo } from './zero-logo.svg';
import { Input, Button } from '@zero-tech/zui/components';
import { ThemeEngine, Themes } from '@zero-tech/zui/components/ThemeEngine';

import './invite.scss';

const INVITE_CODE_LENGTH = 6;
export interface Properties {
  isAuthenticated: boolean;
}

export interface State {
  inviteCode: string;
  isValidating: boolean;
  isDisabled: boolean;
}

export class Container extends React.Component {
  state: State = {
    inviteCode: '',
    isValidating: false,
    isDisabled: true,
  };

  static mapState(_state: RootState): Partial<Properties> {
    return {
      isAuthenticated: true,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  componentDidMount() {}

  onInviteCodeChanged = async (code) => {
    this.setState({ inviteCode: code });
    this.setState({ isDisabled: String(code).length !== INVITE_CODE_LENGTH });
  };

  render() {
    return (
      <>
        <ThemeEngine theme={Themes.Dark} />
        <div className='main'>
          <ZeroLogo className='main__logo' />
          <h3 className='main__title'>Add your invite code</h3>
          <p className='main__text'>This is the 6 digit code you received in your invite</p>
          <Input
            onChange={this.onInviteCodeChanged}
            placeholder='E.g. 123456'
            value=''
            className='main__input'
            type='number'
          />
          <Button variant='primary' className='main__button' isDisabled={this.state.isDisabled}>
            Get access
          </Button>

          {/* TODO: hyperlink the second texts */}
          <div className='main__subtext1'>
            <p className='main__subtext1__text1'> Not been invited yet? </p>
            <p className='main__subtext1__text2'>Subscribe for public launch updates </p>
          </div>

          <div className='main__subtext2'>
            <p className='main__subtext2__text1'> Already on ZERO? </p>
            <p className='main__subtext2__text2'>Log in </p>
          </div>
        </div>
      </>
    );
  }
}

export const Invite = connectContainer<{}>(Container);
