import React from 'react';

export class AppContextPanel extends React.Component {
  render() {
    return <div className='app-context-panel'>{this.props.children}</div>;
  }
}
