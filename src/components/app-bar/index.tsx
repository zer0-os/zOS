import * as React from 'react';

import { WorldPanelItem } from './world-panel-item';
import { IconBell1, IconDotsGrid, IconGlobe3, IconMessageSquare2 } from '@zero-tech/zui/icons';
import { MoreAppsModal } from './more-apps-modal';
import { Link } from 'react-router-dom';
import { IconProps } from '@zero-tech/zui/components/Icons/Icons.types';
import { featureFlags } from '../../lib/feature-flags';

import { bemClassName } from '../../lib/bem';

import './styles.scss';

const cn = bemClassName('app-bar');

export interface Properties {
  activeApp: string | undefined;
  hasUnreadNotifications: boolean;
  hasUnreadHighlights: boolean;
}

interface State {
  isModalOpen: boolean;
}

export class AppBar extends React.Component<Properties, State> {
  state = { isModalOpen: false };

  openModal = () => this.setState({ isModalOpen: true });
  closeModal = () => this.setState({ isModalOpen: false });

  renderNotificationIcon = () => {
    const { hasUnreadNotifications, hasUnreadHighlights } = this.props;

    return (
      <div {...cn('notification-icon-wrapper')}>
        <IconBell1 size={24} {...cn('notification-icon', hasUnreadHighlights && 'highlight')} />
        {hasUnreadNotifications && !hasUnreadHighlights && <div {...cn('notification-dot')} />}
        {hasUnreadHighlights && <div {...cn('highlight-dot')} />}
      </div>
    );
  };

  render() {
    const { activeApp } = this.props;
    const isActive = checkActive(activeApp);

    return (
      <>
        <div {...cn('')}>
          <AppLink Icon={IconMessageSquare2} isActive={isActive('conversation')} label='Messenger' to='/conversation' />
          {featureFlags.enableNotificationsApp && (
            <AppLink
              Icon={this.renderNotificationIcon}
              isActive={isActive('notifications')}
              label='Notifications'
              to='/notifications'
            />
          )}
          <AppLink Icon={IconGlobe3} isActive={isActive('explorer')} label='Explorer' to='/explorer' />
          <WorldPanelItem Icon={IconDotsGrid} label='More Apps' isActive={false} onClick={this.openModal} />
        </div>
        {this.state.isModalOpen && <MoreAppsModal onClose={this.closeModal} />}
      </>
    );
  }
}

interface AppLinkProps {
  Icon: React.JSXElementConstructor<IconProps>;
  isActive: boolean;
  label: string;
  to: string;
}

const AppLink = ({ Icon, isActive, to, label }: AppLinkProps) => {
  return (
    <Link to={to}>
      <WorldPanelItem Icon={Icon} label={label} isActive={isActive} />
    </Link>
  );
};

const checkActive = (activeApp: Properties['activeApp']) => (label: string) => {
  return activeApp?.toLowerCase() === label.toLowerCase();
};
