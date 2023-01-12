import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';

import { IfAuthenticated } from '../authentication/if-authenticated';
import { IconButton, Icons } from '@zer0-os/zos-component-library';
import classNames from 'classnames';
import { AuthenticationState } from '../../store/authentication/types';
import { AppLayout, update as updateLayout } from '../../store/layout';

require('./styles.scss');

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  user: AuthenticationState['user'];
  updateLayout: (layout: Partial<AppLayout>) => void;
}

export interface State {
  isOpen: boolean;
}

export class Container extends React.Component<Properties, State> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      authentication: { user },
    } = state;

    return {
      user,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { updateLayout };
  }

  state = { isOpen: true };

  slideAnimationEnded = () => {
    if (!this.state.isOpen) {
      this.setState({ isOpen: false });
    }
  };

  clickTab = () => {};

  handleSidekickPanel = () => {
    this.props.updateLayout({ isSidekickOpen: !this.state.isOpen });
    this.setState({ isOpen: !this.state.isOpen });
  };

  renderSidekickPanel() {
    return (
      <div
        className='app-sidekick-panel__target'
        onClick={this.handleSidekickPanel}
      >
        <svg
          className='sidekick-panel-tab__tab'
          viewBox='0 0 16 104'
          fill='none'
          xmlns='http://www.w3.org/2000/svg'
        >
          <path d='M4.03079 89.9538L11.9692 78.0462C14.5975 74.1038 16 69.4716 16 64.7334V51.5V39.2666C16 34.5284 14.5975 29.8962 11.9692 25.9538L4.03079 14.0462C1.40251 10.1038 0 5.47158 0 0.733383V51.5V103.267C0 98.5284 1.40251 93.8962 4.03079 89.9538Z' />
        </svg>
        <div className='sidekick-panel-tab__icon'>
          <span className='sidekick-panel-tab__icon-item' />
          <span className='sidekick-panel-tab__icon-item' />
          <span className='sidekick-panel-tab__icon-item' />
        </div>
      </div>
    );
  }

  render() {
    return (
      <IfAuthenticated showChildren>
        <div
          className={classNames('sidekick', this.props.className, { 'sidekick__slide-out': !this.state.isOpen })}
          onAnimationEnd={this.slideAnimationEnded}
        >
          {this.renderSidekickPanel()}
          <div className='sidekick-panel'>
            <div className='sidekick__tabs'>
              <IconButton
                className='sidekick__tabs-network'
                icon={Icons.Network}
                onClick={this.clickTab}
              />
              <IconButton
                className='sidekick__tabs-messages'
                icon={Icons.Messages}
                onClick={this.clickTab}
              />
              <IconButton
                className='sidekick__tabs-notifications'
                icon={Icons.Notifications}
                onClick={this.clickTab}
              />
            </div>
          </div>
        </div>
      </IfAuthenticated>
    );
  }
}

export const Sidekick = connectContainer<PublicProperties>(Container);
