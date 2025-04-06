import React from 'react';
import { RootState } from '../../../store/reducer';
import { connectContainer } from '../../../store/redux-container';
import { GroupManagementContainer } from '../../messenger/group-management/container';
import { Stage as MessageInfoStage } from '../../../store/message-info';
import { Stage as GroupManagementStage } from '../../../store/group-management';
import { MessageInfoContainer } from '../../messenger/message-info/container';
import { Container as SidekickContainer } from '../components/container';
import { Title } from '../../layout/header';
import { PanelHeader } from '../../layout/panel';
import { Panel } from '../../../store/panels/constants';

import classNames from 'classnames';
import styles from './members-sidekick.module.scss';

const TITLE = 'Members';

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  messageInfoStage: MessageInfoStage;
  groupManagementStage: GroupManagementStage;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { groupManagement, messageInfo } = state;

    return {
      messageInfoStage: messageInfo.stage,
      groupManagementStage: groupManagement.stage,
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
        variant='secondary'
        className={classNames(styles.Members, this.props.className)}
        header={
          <PanelHeader className={styles.Header}>
            <Title>{TITLE}</Title>
          </PanelHeader>
        }
        panel={Panel.MEMBERS}
        name={TITLE}
      >
        <div className={styles.Content}>{this.renderSecondarySidekickContent()}</div>
      </SidekickContainer>
    );
  }
}

export const MembersSidekick = connectContainer<PublicProperties>(Container);
