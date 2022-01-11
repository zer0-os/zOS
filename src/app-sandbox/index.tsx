import React from 'react';

import './styles.css';

export interface Properties {
  znsRoute: string;
}

export class AppSandbox extends React.Component<Properties> {
  render() {
    return (
      <div className="app-sandbox">
        {this.props.znsRoute}
      </div>
    );
  }
}
