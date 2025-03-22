import React from 'react';

import { WorldPanelItem } from './world-panel-item';
import {
  IconBell,
  IconWorld,
  IconHome,
  IconMessage01,
  IconSlantLines,
  IconFourDots,
  IconLogoZero,
  IconAura,
} from '@zero-tech/zui/icons';
import { MoreAppsModal } from './more-apps-modal';
import { Link } from 'react-router-dom';
import { IconProps } from '@zero-tech/zui/components/Icons/Icons.types';
import { featureFlags } from '../../lib/feature-flags';
import { LegacyPanel } from '../layout/panel';
import { getLastActiveConversation } from '../../lib/last-conversation';
import { CurrentUser } from './current-user';

import { bemClassName } from '../../lib/bem';

import './styles.scss';

const cn = bemClassName('app-bar');

export interface Properties {
  activeApp: string | undefined;
  hasUnreadNotifications: boolean;
  hasUnreadHighlights: boolean;
  lastActiveMessengerConversationId?: string | undefined;
  zAppIsFullscreen: boolean;
}

interface State {
  isModalOpen: boolean;
}

export class AppBar extends React.Component<Properties, State> {
  state = { isModalOpen: false };
  containerRef = React.createRef<HTMLDivElement>();
  mouseLeaveHandler: ((event: MouseEvent) => void) | null = null;

  componentWillUnmount() {
    // Remove listener to prevent memory leaks
    this.removeMouseLeaveListener();
  }

  openModal = () => this.setState({ isModalOpen: true });
  closeModal = () => this.setState({ isModalOpen: false });

  /**
   * Removes the mouseleave listener from the container.
   * @dev mouse listener needs to be removed so we don't add multiple listeners.
   */
  removeMouseLeaveListener = () => {
    if (this.containerRef.current && this.mouseLeaveHandler) {
      this.containerRef.current.removeEventListener('mouseleave', this.mouseLeaveHandler);
      this.mouseLeaveHandler = null;
    }
  };

  /**
   * Unhovers the container and prevents another hover occurring until the mouse
   * leaves the container.
   *
   * This method:
   * 1. Adds the 'no-hover' class to prevent expansion
   * 2. Uses requestAnimationFrame to defer the next operations to the browser's paint cycle
   * 3. Sets up a one-time mouseleave listener to restore hover functionality
   */
  unhoverContainer = () => {
    const container = this.containerRef.current;
    if (!container) return;

    // Add the no-hover class to prevent expansion
    container.classList.add('no-hover');

    requestAnimationFrame(() => {
      if (this.containerRef.current) {
        // The reflow will happen naturally in the next frame
        this.removeMouseLeaveListener();

        this.mouseLeaveHandler = () => {
          if (this.containerRef.current) {
            this.containerRef.current.classList.remove('no-hover');
            this.removeMouseLeaveListener();
          }
        };

        this.containerRef.current.addEventListener('mouseleave', this.mouseLeaveHandler);
      }
    });
  };

  renderNotificationIcon = () => {
    const { hasUnreadNotifications, hasUnreadHighlights } = this.props;

    return (
      <div {...cn('notification-icon-wrapper')}>
        <IconBell {...cn('notification-icon', hasUnreadHighlights && 'highlight')} size={22} />
        {hasUnreadNotifications && !hasUnreadHighlights && <div {...cn('notification-dot')} />}
        {hasUnreadHighlights && <div {...cn('highlight-dot')} />}
      </div>
    );
  };

  getLastConversationId = () => {
    return getLastActiveConversation();
  };

  render() {
    const { activeApp, zAppIsFullscreen } = this.props;
    const isActive = checkActive(activeApp);
    const messengerPath = this.props.lastActiveMessengerConversationId
      ? `/conversation/${this.props.lastActiveMessengerConversationId}`
      : '/';

    return (
      <>
        <div {...cn('', zAppIsFullscreen && 'zapp-fullscreen')}>
          <div {...cn('logo-wrapper')}>
            <IconLogoZero size={24} />
          </div>
          <LegacyPanel {...cn('container')} ref={this.containerRef}>
            <AppLink
              Icon={IconHome}
              isActive={isActive('home')}
              label='Home'
              to='/home'
              onLinkClick={this.unhoverContainer}
            />
            {featureFlags.enableFeedApp && (
              <AppLink
                Icon={IconSlantLines}
                isActive={isActive('feed')}
                label='Channels'
                to='/feed'
                onLinkClick={this.unhoverContainer}
              />
            )}
            <AppLink
              Icon={IconMessage01}
              isActive={isActive('conversation')}
              label='Chat'
              to={messengerPath}
              onLinkClick={this.unhoverContainer}
            />
            <AppLink
              Icon={IconWorld}
              isActive={isActive('explorer')}
              label='World Explorer'
              to='/explorer'
              onLinkClick={this.unhoverContainer}
            />
            {featureFlags.enableNotificationsApp && (
              <AppLink
                Icon={this.renderNotificationIcon}
                isActive={isActive('notifications')}
                label='Notifications'
                to='/notifications'
                onLinkClick={this.unhoverContainer}
              />
            )}
            {featureFlags.enableAuraZApp && (
              <AppLink
                Icon={IconAura}
                isActive={isActive('aura')}
                label='Aura'
                to='/aura'
                onLinkClick={this.unhoverContainer}
              />
            )}
            <div {...cn('link')} title='Other Apps'>
              <WorldPanelItem Icon={IconFourDots} label='Other Apps' isActive={false} onClick={this.openModal} />
              <span>Other Apps</span>
            </div>
          </LegacyPanel>
          <CurrentUser />
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
  onLinkClick?: () => void;
}

const AppLink = ({ Icon, isActive, to, label, onLinkClick }: AppLinkProps) => {
  const handleClick = () => {
    if (!isActive && onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <Link title={label} {...cn('link')} to={!isActive ? to : '#'} onClick={handleClick}>
      <WorldPanelItem Icon={Icon} label={label} isActive={isActive} />
      <span data-active={isActive ? '' : null}>{label}</span>
    </Link>
  );
};

const checkActive = (activeApp: Properties['activeApp']) => (label: string) => {
  return activeApp?.toLowerCase() === label.toLowerCase();
};
