import * as React from 'react';
import { RootState } from '../../store/reducer';
import { InviteDialog } from '.';
import { connectContainer } from '../../store/redux-container';
import { fetchInvite } from '../../store/create-invitation';
import { config } from '../../config';

export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {
  inviteCode: string;
  invitesUsed: number;
  maxUses: number;
  inviteUrl: string;
  assetPath: string;
  isAMemberOfWorlds: boolean;
  isMessengerFullScreen: boolean;

  fetchInvite: () => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      createInvitation,
      authentication: { user },
      layout,
    } = state;

    return {
      inviteCode: createInvitation.code,
      inviteUrl: createInvitation.url,
      assetPath: config.assetsPath,
      invitesUsed: createInvitation.invitesUsed,
      maxUses: createInvitation.maxUses,
      isAMemberOfWorlds: user?.data?.isAMemberOfWorlds,
      isMessengerFullScreen: layout?.value?.isMessengerFullScreen,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { fetchInvite };
  }

  componentDidMount() {
    this.props.fetchInvite();
  }

  render() {
    return (
      <InviteDialog
        inviteCode={this.props.inviteCode}
        invitesUsed={this.props.invitesUsed}
        maxUses={this.props.maxUses}
        inviteUrl={this.props.inviteUrl}
        assetsPath={this.props.assetPath}
        onClose={this.props.onClose}
        isUserInFullScreenModeAndInWorlds={this.props.isMessengerFullScreen && this.props.isAMemberOfWorlds}
      />
    );
  }
}

export const InviteDialogContainer = connectContainer<PublicProperties>(Container);
