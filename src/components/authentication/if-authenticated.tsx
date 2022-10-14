import React, { ReactNode } from 'react';

import { AuthenticationContext, withContext } from './context';

export interface Properties extends PublicProperties {
  context: AuthenticationContext;
}

interface PublicProperties {
  showChildren?: boolean;
  hideChildren?: boolean;
  children: ReactNode;
}

export class Component extends React.Component<Properties> {
  render() {
    const {
      showChildren,
      hideChildren,
      context: { isAuthenticated },
    } = this.props;

    if (showChildren !== undefined && hideChildren !== undefined && (showChildren || hideChildren))
      throw new Error('Both props showChildren and hideChildren were defined, please choose one.');
    if (
      (isAuthenticated && showChildren) ||
      (isAuthenticated && showChildren === undefined && hideChildren === undefined) ||
      (!isAuthenticated && hideChildren)
    )
      return this.props.children;

    return null;
  }
}

export const IfAuthenticated = withContext<PublicProperties>(Component);
