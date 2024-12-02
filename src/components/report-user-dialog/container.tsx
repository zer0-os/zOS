import * as React from 'react';

import { connectContainer } from '../../store/redux-container';
import { RootState } from '../../store/reducer';
import { reportUser } from '../../store/report-user';
import { ReportUserModal } from '.';
import { ReportUserPayload } from '../../store/report-user';
import { displayName } from '../../lib/user';
import { denormalize as denormalizeUser } from '../../store/users';

export interface PublicProperties {
  onClose: () => void;
}

export interface Properties extends PublicProperties {
  reason: string;
  comment?: string;
  reportedUserName: string;
  loading: boolean;
  errorMessage: string;
  successMessage: string;

  reportUser: (payload: ReportUserPayload) => void;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      reportUser: { reportedUserId, loading, errorMessage, successMessage },
    } = state;

    const user = denormalizeUser(reportedUserId, state);
    const reportedUserName = displayName(user);

    return {
      reportedUserName,
      loading,
      errorMessage,
      successMessage,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {
      reportUser,
    };
  }

  report = (payload: ReportUserPayload) => {
    this.props.reportUser(payload);
  };

  render() {
    return (
      <ReportUserModal
        reportedUserName={this.props.reportedUserName}
        onReport={this.report}
        onClose={this.props.onClose}
        loading={this.props.loading}
        errorMessage={this.props.errorMessage}
        successMessage={this.props.successMessage}
      />
    );
  }
}

export const ReportUserContainer = connectContainer<PublicProperties>(Container);
