import React from 'react';

import './styles.scss';

import { StubComponentContainer } from '../components/stub-component/container';

export class AppSandbox extends React.Component {
  render() {
    const className = 'app-sandbox';

    return (
      <div className={className}>
        <StubComponentContainer />
      </div>
    );
  }
}
