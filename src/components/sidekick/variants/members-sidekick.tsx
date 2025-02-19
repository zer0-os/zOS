import React from 'react';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import { GroupManagementContainer } from '../../messenger/group-management/container';
import { Stage as MessageInfoStage } from '../../../store/message-info';
import { Stage as GroupManagementStage } from '../../../store/group-management';
import { MessageInfoContainer } from '../../messenger/message-info/container';
import { Container as SidekickContainer } from '../components/container';
import { Header, Title } from '../../layout/header';

import classNames from 'classnames';
import styles from './members-sidekick.module.scss';

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  isSecondarySidekickOpen: boolean;
  messageInfoStage: MessageInfoStage;
  groupManagementStage: GroupManagementStage;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { groupManagement, messageInfo } = state;

    return {
      messageInfoStage: messageInfo.stage,
      groupManagementStage: groupManagement.stage,
      isSecondarySidekickOpen: groupManagement.isSecondarySidekickOpen,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  renderSecondarySidekickContent() {
    if (
      this.props.messageInfoStage !== MessageInfoStage.None &&
      this.props.groupManagementStage === GroupManagementStage.None
    ) {
      return <MessageInfoContainer />;
    }
    return <GroupManagementContainer />;
  }

  render() {
    return (
      <SidekickContainer
        className={classNames(
          styles.Members,
          this.props.className,
          this.props.isSecondarySidekickOpen ? styles.Open : styles.Closed
        )}
        header={
          <Header className={styles.Header}>
            <Title>Members</Title>
          </Header>
        }
      >
        {this.renderSecondarySidekickContent()}
      </SidekickContainer>
    );
  }
}

export const MembersSidekick = connectContainer<PublicProperties>(Container);
