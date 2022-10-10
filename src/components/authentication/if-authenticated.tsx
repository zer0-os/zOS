import React from 'react';

import { AuthenticationContext } from '../../context/authentication';

export interface Properties {
  show?: boolean;
  hide?: boolean;
}

export class IfAuthenticated extends React.Component<Properties> {
  static contextType = AuthenticationContext;

  render() {
    const { show, hide } = this.props;
    const { isAuthenticated } = this.context;

    if (show !== undefined && hide !== undefined && (show || hide))
      throw new Error('Both props show and hide were defined, please choose one.');
    if (
      (isAuthenticated && show) ||
      (isAuthenticated && show === undefined && hide === undefined) ||
      (!isAuthenticated && hide)
    )
      return this.props.children;

    return null;
  }
}
