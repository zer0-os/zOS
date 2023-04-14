import * as React from 'react';
import { StubComponent } from '.';
import { RootState } from '../../store';
import { connectContainer } from '../../store/redux-container';

export interface PublicProperties {}

export interface Properties extends PublicProperties {
  field: string;
}

export class Container extends React.Component<Properties> {
  static mapState(state: RootState): Partial<Properties> {
    return {
      field: state.theme.value.viewMode,
    };
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return <StubComponent mode={this.props.field} />;
  }
}

export const StubComponentContainer = connectContainer<PublicProperties>(Container);
