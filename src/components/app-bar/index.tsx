import * as React from 'react';

import { WorldPanelItem } from './world-panel-item';
import { IconBell1, IconDotsGrid, IconGlobe3, IconHome, IconMessageSquare2, IconSlashes } from '@zero-tech/zui/icons';
import { MoreAppsModal } from './more-apps-modal';
import { Link } from 'react-router-dom';
import { IconProps } from '@zero-tech/zui/components/Icons/Icons.types';
import { featureFlags } from '../../lib/feature-flags';
import { LegacyPanel } from '../layout/panel';

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
  containerRef: HTMLDivElement | null = null;
  appBarRef = React.createRef<HTMLDivElement>();
  mouseLeaveHandler: ((event: MouseEvent) => void) | null = null;

  componentDidMount() {
    if (this.appBarRef.current) {
      this.containerRef = this.appBarRef.current.querySelector(`.${cn('container').className}`);
    }
  }

  componentWillUnmount() {
    this.removeMouseLeaveListener();
  }

  openModal = () => this.setState({ isModalOpen: true });
  closeModal = () => this.setState({ isModalOpen: false });

  /**
   * Removes the mouseleave listener from the container.
   * @dev mouse listener needs to be removed so we don't add multiple listeners.
   */
  removeMouseLeaveListener = () => {
    if (this.containerRef && this.mouseLeaveHandler) {
      this.containerRef.removeEventListener('mouseleave', this.mouseLeaveHandler);
      this.mouseLeaveHandler = null;
    }
  };

  /**
   * Unhovers the container, and prevents another hover occuring until the mouse
   * leaves the container.
   */
  unhoverContainer = () => {
    if (this.containerRef) {
      this.containerRef.classList.add('no-hover');

      // Force a reflow to ensure the width change happens immediately
      this.containerRef.getBoundingClientRect();

      // Ensure we aren't adding multiple listeners
      this.removeMouseLeaveListener();

      this.mouseLeaveHandler = (_event: MouseEvent) => {
        if (this.containerRef) {
          this.containerRef.classList.remove('no-hover');
          this.removeMouseLeaveListener();
        }
      };

      this.containerRef.addEventListener('mouseleave', this.mouseLeaveHandler);
    }
  };

  renderNotificationIcon = () => {
    const { hasUnreadNotifications, hasUnreadHighlights } = this.props;

    return (
      <div {...cn('notification-icon-wrapper')}>
        <IconBell1
          {...cn('notification-icon', hasUnreadHighlights && 'highlight')}
          isFilled={checkActive(this.props.activeApp)('notifications')}
          size={22}
        />
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
        <div {...cn('')} ref={this.appBarRef}>
          <LegacyPanel {...cn('container')}>
            <AppLink
              Icon={IconHome}
              isActive={isActive('home')}
              label='Home'
              to='/home'
              onLinkClick={this.unhoverContainer}
            />
            <AppLink
              Icon={IconMessageSquare2}
              isActive={isActive('conversation')}
              label='Messenger'
              to='/conversation'
              onLinkClick={this.unhoverContainer}
            />
            {featureFlags.enableFeedApp && (
              <AppLink
                Icon={IconSlashes}
                isActive={isActive('feed')}
                label='Channels'
                to='/feed'
                onLinkClick={this.unhoverContainer}
              />
            )}
            {featureFlags.enableNotificationsApp && (
              <AppLink
                Icon={this.renderNotificationIcon}
                isActive={isActive('notifications')}
                label='Notifications'
                to='/notifications'
                onLinkClick={this.unhoverContainer}
              />
            )}
            <AppLink
              Icon={IconGlobe3}
              isActive={isActive('explorer')}
              label='Explorer'
              to='/explorer'
              onLinkClick={this.unhoverContainer}
            />
            <div {...cn('link')} title='More Apps'>
              <WorldPanelItem Icon={IconDotsGrid} label='More Apps' isActive={false} onClick={this.openModal} />
              <span>More Apps</span>
            </div>
          </LegacyPanel>
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
    <Link title={label} {...cn('link')} to={!isActive && to} onClick={handleClick}>
      <WorldPanelItem Icon={Icon} label={label} isActive={isActive} />
      <span data-active={isActive ? '' : null}>{label}</span>
    </Link>
  );
};

const checkActive = (activeApp: Properties['activeApp']) => (label: string) => {
  return activeApp?.toLowerCase() === label.toLowerCase();
};
