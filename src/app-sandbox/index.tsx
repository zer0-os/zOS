import React from 'react';

import './styles.scss';

import { StubComponent } from '../components/stub-component';

export class AppSandbox extends React.Component {
  render() {
    const className = 'app-sandbox';

    return (
      <div className={className}>
        <StubComponent />
      </div>
    );
  }
}
