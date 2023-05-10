import * as React from 'react';

import { createPortal } from 'react-dom';
import { connectContainer } from '../../store/redux-container';
import { RewardsPopup } from '.';

interface PublicProperties {}

export interface Properties extends PublicProperties {}

export class Container extends React.Component<Properties> {
  static mapState() {
    return {};
  }
  static mapActions() {
    return {};
  }

  render() {
    return <>{createPortal(<RewardsPopup usd={''} zero={''} />, document.body)}</>;
  }
}

export const RewardsPopupContainer = connectContainer<PublicProperties>(Container);
