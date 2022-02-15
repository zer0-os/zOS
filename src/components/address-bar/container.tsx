import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';

import { AddressBar } from '.';

interface PublicProperties {
  className?: string;
}

export interface Properties extends PublicProperties {
  route: string;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    const { zns: { value: { route } } } = state;

    return { route };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return <AddressBar className={this.props.className} route={this.props.route} />;
  }
}

export const AddressBarContainer = connectContainer<PublicProperties>(Container);
