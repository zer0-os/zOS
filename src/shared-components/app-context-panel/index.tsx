import React, { PropsWithChildren } from 'react';

import classNames from 'classnames';

export interface Properties {
  className?: string;
}

export class AppContextPanel extends React.Component<PropsWithChildren<Properties>> {
  render() {
    return <div className={classNames('app-context-panel', this.props.className)}>{this.props.children}</div>;
  }
}
