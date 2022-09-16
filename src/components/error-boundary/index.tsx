import React from 'react';
import { ILogger } from '../../lib/logger';

export interface Properties {
  children: any;
  logger: ILogger;
}

interface State {
  error: Error;
}

export class ErrorBoundary extends React.Component<Properties, State> {
  constructor(props) {
    super(props);

    this.state = { error: null };
  }

  resolveApp() {
    const appFromPathname = window?.location?.pathname?.match(/.*\/(?<app>.*)(?=$)/)?.groups['app']; // '/0.wilder/feed' returns 'feed'
    return appFromPathname || 'core';
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error });

    this.props.logger.capture(error, this.resolveApp(), { errorInfo });
  }

  render() {
    return this.props.children;
  }
}
