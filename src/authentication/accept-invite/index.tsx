import * as React from 'react';
import { Button, Input } from '@zero-tech/zui/components';
import './styles.scss';

export interface Properties {
  isInviteValidated: boolean;
  isLoading: boolean;

  validateInvite: (data: { code: string }) => void;
}

const INVITE_CODE_LENGTH = 6;

interface State {
  inviteCode: string;
}

export class Invite extends React.Component<Properties, State> {
  state: State = {
    inviteCode: '',
  };

  onInviteCodeChanged = (code: string) => {
    this.setState({ inviteCode: code });
  };

  onClick = async () => {
    this.props.validateInvite({ code: this.state.inviteCode });
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
