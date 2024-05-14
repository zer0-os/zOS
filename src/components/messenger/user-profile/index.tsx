import * as React from 'react';

import { OverviewPanel } from './overview-panel';
import { Stage } from '../../../store/edit-profile';
import { EditProfileContainer } from '../../edit-profile/container';

export interface Properties {
  stage: Stage;
  name: string;
  image: string;
  subHandle?: string;

  onClose: () => void;
  onLogout: () => void;
  onBackup: () => void;
  onEdit: () => void;
  onBackToOverview: () => void;
}

export class UserProfile extends React.Component<Properties> {
  render() {
    return (
      <>
        {this.props.stage === Stage.Overview && (
          <OverviewPanel
            name={this.props.name}
            image={this.props.image}
            subHandle={this.props.subHandle}
            onBack={this.props.onClose}
            onOpenLogoutDialog={this.props.onLogout}
            onOpenBackupDialog={this.props.onBackup}
            onOpenEditProfile={this.props.onEdit}
          />
        )}

        {this.props.stage === Stage.EditProfile && <EditProfileContainer onClose={this.props.onBackToOverview} />}
      </>
    );
  }
}
