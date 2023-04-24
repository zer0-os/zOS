import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { Invite } from '.';
import { validateInvite } from '../../store/registration';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  isLoading: boolean;
  isInviteValidated: boolean;

  validateInvite: (data: { code: string }) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { registration } = state;

    return {
      isLoading: registration.loading,
      isInviteValidated: registration.isInviteValidated,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { validateInvite };
  }

  render() {
    return (
      <Invite
        isInviteValidated={this.props.isInviteValidated}
        validateInvite={this.props.validateInvite}
        isLoading={this.props.isLoading}
      />
    );
  }
}

export const InviteContainer = connectContainer<PublicProperties>(Container);
