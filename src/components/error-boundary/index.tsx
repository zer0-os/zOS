import React from 'react';
import { ErrorBoundary as SentryErrorBoundary } from '@sentry/react';

export interface Properties {
  children: any;
  boundary: string;
}

export class ErrorBoundary extends React.Component<Properties> {
  resolveApp = () => {
    const appFromPathname = window?.location?.pathname?.match(/.*\/(?<app>.*)(?=$)/)?.groups['app']; // '/0.wilder/feed' returns 'feed'
    return appFromPathname || undefined;
  };

  beforeCapture = (scope) => {
    const tags = {
      'application.boundary': this.props.boundary,
      'application.name': this.resolveApp(),
    };

    scope.setTags(tags);

    return scope;
  };

  render() {
    return (
      <SentryErrorBoundary
        beforeCapture={(scope) => {
          this.beforeCapture(scope);
        }}
      >
        {this.props.children}
      </SentryErrorBoundary>
    );
  }
}
