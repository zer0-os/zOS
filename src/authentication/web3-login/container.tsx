import * as React from 'react';

import { RootState } from '../../store/reducer';

import { Web3Login } from '.';

export interface Web3LoginContainerPublicProperties {}

export interface Web3LoginContainerProperties extends Web3LoginContainerPublicProperties {}

export class Web3LoginContainer extends React.Component<Web3LoginContainerProperties> {
  static mapState(state: RootState) {
    //
  }

  static mapErrors(errors: string[]) {
    //
  }

  static mapActions() {
    //
  }

  render() {
    return <Web3Login />;
  }
}
