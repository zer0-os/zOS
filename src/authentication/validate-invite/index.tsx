import * as React from 'react';

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
  lastSubmittedInviteCode: string;
}

export class Invite extends React.Component<Properties, State> {
  state: State = {
    inviteCode: '',
    renderAlert: false,
    lastSubmittedInviteCode: '',
  };

  onInviteCodeChanged = (code: string) => {
    this.setState({ inviteCode: code });
  };

  submitForm = async (e) => {
    e.preventDefault();
    this.setState({ renderAlert: true, lastSubmittedInviteCode: this.state.inviteCode });
    this.props.validateInvite({ code: this.state.inviteCode });
  };

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
      case InviteCodeStatus.INVITE_CODE_MAX_USES:
        errorMessage = 'This invite has been used too many times. Please use a new invite code.';
        break;
      default:
        errorMessage = 'Invite code error.';
    }

    return (
      <Alert className={c('alert')} variant='error' isFilled>
        {errorMessage}
      </Alert>
    );
  };

  render() {
    const isError = this.state.renderAlert && this.props.inviteCodeStatus !== InviteCodeStatus.VALID;

    return (
      <div className={c('')}>
        <div className={c('heading-container')}>
          <h3 className={c('heading')}>Add invite code</h3>
          <div className={c('sub-heading')}>6 digit code you received in your invite</div>
        </div>
        <form className={c('form')} onSubmit={this.submitForm}>
          <div className={c('input-container')}>
            <Input
              onChange={this.onInviteCodeChanged}
              placeholder='e.g 123456'
              value={this.state.inviteCode}
              type='text'
              error={isError}
            />

            {isError && this.renderAlert(this.props.inviteCodeStatus)}
          </div>

          <Button
            isDisabled={
              !this.state.inviteCode.length ||
              this.state.inviteCode.length > MAX_INVITE_CODE_LENGTH ||
              this.state.inviteCode === this.state.lastSubmittedInviteCode
            }
            isLoading={this.props.isLoading}
            isSubmit
          >
            Get access
          </Button>
        </form>
      </div>
    );
  }
}
