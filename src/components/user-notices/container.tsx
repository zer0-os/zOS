import React from 'react';
import { UserNoticeComponent } from './component';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';

interface PublicProperties {}

interface Properties extends PublicProperties {}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const layout = state.layout.value;

    return {
      hasContextPanel: layout.hasContextPanel,
      isContextPanelOpen: layout.isContextPanelOpen,
      isSidekickOpen: layout.isSidekickOpen,
    };
  }

  static mapActions(_state: RootState): Partial<Properties> {
    return {};
  }

  render() {
    return (
      <div>
        <UserNoticeComponent />
      </div>
    );
  }
}

export const UserNotices = connectContainer<PublicProperties>(Container);
