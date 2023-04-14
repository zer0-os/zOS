import React from 'react';

export interface Properties {}

export class StubComponent extends React.Component<Properties> {
  render() {
    return <div>This is a test component</div>;
  }
}
