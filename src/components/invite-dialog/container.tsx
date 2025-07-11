import * as React from 'react';
import { RootState } from '../../store/reducer';
import { InviteDialog } from '.';
import { connectContainer } from '../../store/redux-container';
import { clearInvite, fetchInvite } from '../../store/create-invitation';
import { config } from '../../config';

export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  inviteCode: string;
  inviteUrl: string;
  assetsPath: string;
  isLoading: boolean;

  fetchInvite: () => void;
  clearInvite: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { createInvitation } = state;

    return {
      inviteCode: createInvitation.code,
      inviteUrl: createInvitation.url,
      assetsPath: config.imageAssetsPath,
      isLoading: createInvitation.isLoading,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { fetchInvite, clearInvite };
  }

  componentDidMount() {
    this.props.fetchInvite();
  }

  componentWillUnmount() {
    this.props.clearInvite();
  }

  render() {
    return (
      <InviteDialog
        inviteCode={this.props.inviteCode}
        inviteUrl={this.props.inviteUrl}
        assetsPath={this.props.assetsPath}
        onClose={this.props.onClose}
        isLoading={this.props.isLoading}
      />
    );
  }
}

export const InviteDialogContainer = connectContainer<PublicProperties>(Container);
