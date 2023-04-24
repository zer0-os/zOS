import * as React from 'react';
import { Button, Input, Alert } from '@zero-tech/zui/components';
import './styles.scss';
import { InviteCodeStatus } from '../../store/registration';

export interface Properties {
  inviteStatus: string;
  isLoading: boolean;

  validateInvite: (data: { code: string }) => void;
}

const INVITE_CODE_LENGTH = 6;

interface State {
  inviteCode: string;
  showAlert: boolean;
}

export class Invite extends React.Component<Properties, State> {
  state: State = {
    inviteCode: '',
    showAlert: false,
  };

  onInviteCodeChanged = (code: string) => {
    this.setState({ inviteCode: code });
  };

  onClick = async () => {
    this.setState({ showAlert: true });
    this.props.validateInvite({ code: this.state.inviteCode });
  };

  componentDidUpdate(_prevProps: Readonly<Properties>, prevState: Readonly<State>): void {
    // Hide alert when invite code is changed
    if (prevState.inviteCode !== this.state.inviteCode && this.state.showAlert) {
      this.setState({ showAlert: false });
    }
  }

  showAlert = (status: string) => {
    let errorMessage: string;
    switch (status) {
      case InviteCodeStatus.INVITE_CODE_NOT_FOUND:
        errorMessage = 'Invite code not found. Please check your invite message.';
        break;
      case InviteCodeStatus.INVITE_CODE_CANCELED:
        errorMessage = 'This invite code has been cancelled.';
        break;
      case InviteCodeStatus.INVITE_CODE_USED:
        errorMessage =
          'This invite code has already been redeemed. If you cannot get another invite you can join the waitlist below.';
        break;
      case InviteCodeStatus.INVITE_CODE_EXPIRED:
        errorMessage = 'This invite code has been expired. Please use a new invite code.';
        break;
      default:
        errorMessage = 'Invite code error.';
    }

    return (
      <Alert variant='error' className='invite__input--error'>
        {errorMessage}
      </Alert>
    );
  };

  render() {
    return (
      <>
        <h3 className='invite__title'>Add your invite code</h3>
        <p className='invite__text'>This is the 6 digit code you received in your invite</p>

        <Input
          onChange={this.onInviteCodeChanged}
          placeholder='E.g. 123456'
          value={this.state.inviteCode}
          className='invite__input'
          type='number'
        />

        {this.state.showAlert &&
          this.props.inviteStatus !== InviteCodeStatus.VALID &&
          this.showAlert(this.props.inviteStatus)}

        <Button
          variant='primary'
          className='invite__button'
          onPress={this.onClick}
          isDisabled={this.state.inviteCode.length !== INVITE_CODE_LENGTH}
          isLoading={this.props.isLoading}
        >
          Get access
        </Button>

        {/* TODO: hyperlink the second texts */}
        <div className='invite__subtext1'>
          <p className='invite__subtext1__text1'> Not been invited yet? </p>
          <p className='invite__subtext1__text2'>Subscribe for public launch updates </p>
        </div>

        <div className='invite__subtext2'>
          <p className='invite__subtext2__text1'> Already on ZERO? </p>
          <p className='invite__subtext2__text2'>Log in </p>
        </div>
      </>
    );
  }
}
