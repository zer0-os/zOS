import * as React from 'react';
import { Link } from 'react-router-dom';

import { Button, Input, Alert } from '@zero-tech/zui/components';
import { InviteCodeStatus } from '../../store/registration';

import './styles.scss';
import { bem } from '../../lib/bem';
const c = bem('validate-invite');

export interface Properties {
  inviteCodeStatus: string;
  isLoading: boolean;

  validateInvite: (data: { code: string }) => void;
}

// allow upto 14 chars (number/string)
const MAX_INVITE_CODE_LENGTH = 14;

interface State {
  inviteCode: string;
  renderAlert: boolean;
}

export class Invite extends React.Component<Properties, State> {
  state: State = {
    inviteCode: '67E44B', // XXX
    renderAlert: false,
  };

  onInviteCodeChanged = (code: string) => {
    this.setState({ inviteCode: code });
  };

  submitForm = async (e) => {
    e.preventDefault();
    this.setState({ renderAlert: true });
    this.props.validateInvite({ code: this.state.inviteCode });
  };

  componentDidUpdate(_prevProps: Readonly<Properties>, prevState: Readonly<State>): void {
    // Hide alert when invite code is changed
    if (prevState.inviteCode !== this.state.inviteCode && this.state.renderAlert) {
      this.setState({ renderAlert: false });
    }
  }

  renderAlert = (status: string) => {
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

    return <Alert variant='error'>{errorMessage}</Alert>;
  };

  render() {
    return (
      <div className={c('')}>
        <h3 className={c('heading')}>Add your invite code</h3>
        <div className={c('sub-heading')}>This is the 6 digit code you received in your invite</div>

        <form className={c('form')} onSubmit={this.submitForm}>
          <Input
            onChange={this.onInviteCodeChanged}
            placeholder='E.g. 123456'
            value={this.state.inviteCode}
            type='text'
          />

          {this.state.renderAlert &&
            this.props.inviteCodeStatus !== InviteCodeStatus.VALID &&
            this.renderAlert(this.props.inviteCodeStatus)}

          <Button
            variant='primary'
            isDisabled={!this.state.inviteCode.length || this.state.inviteCode.length > MAX_INVITE_CODE_LENGTH}
            isLoading={this.props.isLoading}
            isSubmit
          >
            Get access
          </Button>
        </form>

        <div className={c('other-options')}>
          <div>
            <span>Not been invited yet? </span>
            <a href='https://www.zine.live/#/portal/signup'>Subscribe for public launch updates</a>
          </div>

          <div>
            <span>Already on ZERO? </span>
            <Link to='/login'>Log in</Link>
          </div>
        </div>
      </div>
    );
  }
}
