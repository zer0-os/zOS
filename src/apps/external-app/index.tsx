/*
 * This component wraps an external app, e.g. Explorer.
 * It renders the app in an iFrame, and listens for messages from the iFrame's origin.
 * If a message is received, it handles it accordingly, e.g. mirroring iFrame route
 * changes to the parent window (or rather, the parent Router).
 */

import { Location, withRouter, History } from 'react-router-dom';
import { Component } from 'react';
import { connect } from 'react-redux';
import { Dispatch, AnyAction } from 'redux';
import { IFrame } from '../iframe';
import { IncomingMessage } from './types/types';
import { routeChangedHandler } from './message-handlers/routeChangeHandler';
import { isAuthenticateEvent, isRouteChangeEvent, isSubmitManifestEvent } from './types/messageTypeGuard';
import { authenticateHandler } from './message-handlers/authenticateHandler';
import { submitManifestHandler } from './message-handlers/submitManifestHandler';
import { clearActiveZAppManifest } from '../../store/active-zapp';
export interface PublicProperties {
  route: `/${string}`;
  title: string;
  url: string;
}

interface Properties extends PublicProperties {
  history: History;
  location: Location;
  dispatch: Dispatch<AnyAction>;
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
    this.props.dispatch(clearActiveZAppManifest());
  }

  onMessage = (event: MessageEvent<IncomingMessage>) => {
    if (isRouteChangeEvent(event)) {
      const handler = routeChangedHandler(this.props.history, this.props.route, this.props.url);
      handler(event);
    } else if (isAuthenticateEvent(event)) {
      authenticateHandler(event);
    } else if (isSubmitManifestEvent(event)) {
      const handler = submitManifestHandler(this.props.dispatch);
      handler(event);
    }
  };

  render() {
    return <IFrame src={this.state.loadedUrl} title={this.props.title} />;
  }
}

const ConnectedExternalApp = connect()(ExternalAppComponent);
export const ExternalApp = withRouter<PublicProperties>(ConnectedExternalApp);
