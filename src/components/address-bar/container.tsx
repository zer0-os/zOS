import React from 'react';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';

import { AddressBar } from '.';

export interface Properties {
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
    return <AddressBar route={this.props.route} />;
  }
}

export const AddressBarContainer = connectContainer<{}>(Container);
