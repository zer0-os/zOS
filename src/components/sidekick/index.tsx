import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';
import { IfAuthenticated } from '../authentication/if-authenticated';
import classNames from 'classnames';
import { syncSidekickState } from '../../store/layout';
import { MessengerList } from '../messenger/list';

import './styles.scss';

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  syncSidekickState: () => void;
  isOpen: boolean;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {
      layout: { value },
    } = state;

    return {
      isOpen: value.isSidekickOpen,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return { syncSidekickState };
  }

  componentDidMount() {
    this.props.syncSidekickState();
  }

  get isOpen() {
    return this.props.isOpen;
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
        <div className={classNames('sidekick', this.props.className, { 'sidekick--open': this.isOpen })}>
          <div className='sidekick__tab-content'>{this.renderTabContent()}</div>
        </div>
      </IfAuthenticated>
    );
  }
}

export const Sidekick = connectContainer<PublicProperties>(Container);
