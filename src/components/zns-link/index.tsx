import React from 'react';
import { Link } from 'react-router-dom';
import { withRouter } from 'react-router';

import { Apps } from '../../lib/apps';

export interface PublicProperties {
  app?: Apps;
  route: string;
}

interface Properties extends PublicProperties {
  location: { pathname: string };
}

export class Component extends React.Component<Properties> {
  pathRegex = /\/([a-zA-Z.]+)\/(\w+)/;

  get route() {
    if (!this.props.route) return this.zosLocation.route;

    return this.props.route;
  }

  get app() {
    if (!this.props.app) return this.zosLocation.app;

    return this.props.app;
  }

  get fullRoute() {
    return `/${this.route}/${this.app}`;
  }

  get zosLocation() {
    const currentPath = this.props.location.pathname;

    if (!this.pathRegex.test(currentPath)) return { route: '', app: '' };

    const [, route, app ] =  currentPath.match(this.pathRegex);

    return { route, app };
  }

  render() {
    return <Link to={this.fullRoute}>{this.props.children}</ Link>;
  }
}

export const ZnsLink = withRouter<PublicProperties>(Component);
