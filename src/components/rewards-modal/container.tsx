import * as React from 'react';

import { connectContainer } from '../../store/redux-container';
import { RootState } from '../../store/reducer';
import { RewardsModal } from '.';

export interface PublicProperties {
  onClose: () => void;
}

export interface Properties extends PublicProperties {}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const {} = state;

    return {};
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return <RewardsModal />;
  }
}
export const RewardsModalContainer = connectContainer<PublicProperties>(Container);
