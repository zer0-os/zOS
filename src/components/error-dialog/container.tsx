import * as React from 'react';
import { RootState } from '../../store/reducer';
import { connectContainer } from '../../store/redux-container';
import { ErrorDialog } from '.';

export interface PublicProperties {
  onClose?: () => void;
}

export interface Properties extends PublicProperties {}

export class Container extends React.Component<Properties> {
  static mapState(_state: RootState): Partial<Properties> {
    return {};
  }

  static mapActions(_props: Properties): Partial<Properties> {
    return {};
  }

  render() {
    return <ErrorDialog onClose={this.props.onClose} />;
  }
}

export const ErrorDialogContainer = connectContainer<PublicProperties>(Container);
