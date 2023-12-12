import React from 'react';
import { connectContainer } from '../../store/redux-container';
import { IfAuthenticated } from '../authentication/if-authenticated';
import { MessengerList } from '../messenger/list';

import './styles.scss';

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {}

export class Container extends React.Component<Properties> {
  static mapState(): Partial<Properties> {
    return {};
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return (
      <IfAuthenticated showChildren>
        <div className='sidekick'>
          <div className='sidekick__tab-content'>
            <div className='sidekick__tab-content--messages'>
              <MessengerList />
            </div>
          </div>
        </div>
      </IfAuthenticated>
    );
  }
}

export const Sidekick = connectContainer<PublicProperties>(Container);
