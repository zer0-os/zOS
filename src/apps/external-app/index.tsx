/*
 * This component wraps an external app, e.g. Explorer.
 * It renders the app in an iFrame, and listens for messages from the iFrame's origin.
 * If a message is received, it handles it accordingly, e.g. mirroring iFrame route
 * changes to the parent window (or rather, the parent Router).
 */

import { Location, withRouter, History } from 'react-router-dom';
import { Component } from 'react';
import { IFrame } from '../iframe';
import { IncomingMessage } from './types/types';
import { routeChangedHandler } from './message-handlers/routeChangeHandler';
import { isAuthenticateEvent, isRouteChangeEvent, isSubmitManifestEvent } from './types/messageTypeGuard';
import { authenticateHandler } from './message-handlers/authenticateHandler';
import { submitManifestHandler } from './message-handlers/submitManifestHandler';

export interface PublicProperties {
  route: `/${string}`;
  title: string;
  url: string;
}

interface Properties extends PublicProperties {
  history: History;
  location: Location;
}

interface State {
  loadedUrl: string;
}

class ExternalAppComponent extends Component<Properties, State> {
  state = {
    loadedUrl: '',
  };

  componentDidMount() {
    const {
      location: { pathname },
      route,
      url,
    } = this.props;

    const loadedUrl = new URL(pathname.replace(route, ''), url);
    this.setState({ loadedUrl: loadedUrl.href });

    window.addEventListener('message', this.onMessage);
  }

  componentWillUnmount(): void {
    window.removeEventListener('message', this.onMessage);
  }

  onMessage = (event: MessageEvent<IncomingMessage>) => {
    if (isRouteChangeEvent(event)) {
      const handler = routeChangedHandler(this.props.history, this.props.route, this.props.url);
      handler(event);
    } else if (isAuthenticateEvent(event)) {
      authenticateHandler(event);
    } else if (isSubmitManifestEvent(event)) {
      submitManifestHandler(event);
    }
  };

  render() {
    return <IFrame src={this.state.loadedUrl} title={this.props.title} />;
  }
}

export const ExternalApp = withRouter<PublicProperties>(ExternalAppComponent);
