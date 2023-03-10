import React from 'react';
import { IconBellRinging3 } from '@zero-tech/zui/components/Icons';
import { IconButton } from '@zero-tech/zui/components/IconButton';
import { NotificationList } from '../notification';

interface Properties {}
interface State {
  notificationsStatus: boolean;
}

export class UserNotices extends React.Component<Properties, State> {
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

  renderNotificationsPopover() {
    if (this.state.notificationsStatus) {
      return (
        <div className='user-notices__notifications-popover'>
          <NotificationList />
        </div>
      );
    }
  }

  render() {
    return (
      <div className='user-notices'>
        <IconButton
          Icon={IconBellRinging3}
          onClick={this.openNotifications}
        />

        {this.renderNotificationsPopover()}
      </div>
    );
  }
}
