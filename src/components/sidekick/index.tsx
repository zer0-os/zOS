import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { IfAuthenticated } from '../authentication/if-authenticated';
import classNames from 'classnames';
import { UpdateSidekickPayload, updateSidekick, syncSidekickState } from '../../store/layout';
import { MessengerList } from '../messenger/list';

import './styles.scss';

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  updateSidekick: (action: UpdateSidekickPayload) => void;
  syncSidekickState: () => void;
  isOpen: boolean;
}

export interface State {
  canStartAnimation: boolean;
}

export class Container extends React.Component<Properties, State> {
  state = { canStartAnimation: false };

  static mapState(state: RootState): Partial<Properties> {
    const {
      layout: { value },
    } = state;

    return {
      isOpen: value.isSidekickOpen,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { updateSidekick, syncSidekickState };
  }

  componentDidMount() {
    this.props.syncSidekickState();
  }

  get isOpen() {
    return this.props.isOpen;
  }

  toggleSidekickPanel = (): void => {
    this.setState({ canStartAnimation: true });
    this.props.updateSidekick({ isOpen: !this.isOpen });
  };

  renderSidekickPanel(): JSX.Element {
    return (
      <div
        className='app-sidekick-panel__target'
        onClick={this.toggleSidekickPanel}
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

  renderTabContent(): JSX.Element {
    return (
      <div className='sidekick__tab-content--messages'>
        <MessengerList />
      </div>
    );
  }

  render() {
    return (
      <IfAuthenticated showChildren>
        <div
          className={classNames(
            'sidekick',
            this.props.className,
            { 'sidekick--slide-out': this.state.canStartAnimation && !this.isOpen },
            { 'sidekick--slide-in': this.isOpen }
          )}
        >
          {this.renderSidekickPanel()}
          <div className='sidekick__tab-content'>{this.renderTabContent()}</div>
        </div>
      </IfAuthenticated>
    );
  }
}

export const Sidekick = connectContainer<PublicProperties>(Container);
