import React from 'react';
import { IconBellRinging3 } from '@zero-tech/zui/components/Icons';
import { IconButton } from '@zero-tech/zui/components/IconButton';
import { NotificationList } from '../notification';

interface Properties {}
interface State {
  notificationsStatus: boolean;
}

export class UserNoticeComponent extends React.Component<Properties, State> {
  state = { notificationsStatus: true };

  componentDidMount() {
    // add event mouseDown to hide notifgication
  }

  componentWillUnmount() {
    // remove event listener
  }

  openNotifications() {
    this.setState({});
  }

  render() {
    return (
      <div>
        <IconButton
          Icon={IconBellRinging3}
          onClick={this.openNotifications}
        />

        {this.state.notificationsStatus && <NotificationList />}
      </div>
    );
  }
}
