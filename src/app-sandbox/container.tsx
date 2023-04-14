import React from 'react';
import { RootState } from '../store';
import { AppSandbox } from '.';
import { Store } from 'redux';

export interface PlatformUser {
  account: string;
}

interface Properties {
  store: Store<RootState>;
}

export class AppSandboxContainer extends React.Component<Properties> {
  render() {
    return <AppSandbox />;
  }
}
