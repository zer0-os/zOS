import React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { updateSidekick } from '../../store/layout';
import { MessengerList } from '../messenger/list';

import './styles.scss';

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  closeConversations: () => void;
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
    return {
      closeConversations: () => updateSidekick({ isOpen: false }),
    };
  }

  get isOpen() {
    return this.props.isOpen;
  }

  render() {
    return (
      <IfAuthenticated showChildren>
        <div className='sidekick'>
          <div className='sidekick__tab-content'>
            <div className='sidekick__tab-content--messages'>
              <MessengerList onClose={this.props.closeConversations} />
            </div>
          </div>
        </div>
      </IfAuthenticated>
    );
  }
}

export const Sidekick = connectContainer<PublicProperties>(Container);
