/*
 * This component wraps an external app, e.g. Explorer.
 * It renders the app in an iFrame, and listens for messages from the iFrame's origin.
 * If a message is received, it handles it accordingly, e.g. mirroring iFrame route
 * changes to the parent window (or rather, the parent Router).
 */

import { Location, withRouter, History } from 'react-router-dom';
import { Component, ComponentType } from 'react';
import { connect } from 'react-redux';
import { Dispatch, AnyAction } from 'redux';
import { IFrame } from '../iframe';
import { IncomingMessage } from './types/types';
import { routeChangedHandler } from './message-handlers/routeChangeHandler';
import { isAuthenticateEvent, isRouteChangeEvent } from './types/messageTypeGuard';
import { authenticateHandler } from './message-handlers/authenticateHandler';
import { clearActiveZAppManifest, setActiveZAppManifest } from '../../store/active-zapp';
import { ZAppManifest } from './types/manifest';

export interface PublicProperties {
  manifest: ZAppManifest;
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
      manifest: { route, url },
      dispatch,
    } = this.props;

    const loadedUrl = new URL(pathname.replace(route, ''), url);
    this.setState({ loadedUrl: loadedUrl.href });

    window.addEventListener('message', this.onMessage);

    // Register the manifest with the store
    dispatch(setActiveZAppManifest(this.props.manifest));
  }

  componentWillUnmount(): void {
    window.removeEventListener('message', this.onMessage);
    this.props.dispatch(clearActiveZAppManifest());
  }

  onMessage = (event: MessageEvent<IncomingMessage>) => {
    const {
      history,
      manifest: { route, url },
    } = this.props;

    if (isRouteChangeEvent(event)) {
      const handler = routeChangedHandler(history, route, url);
      handler(event);
    } else if (isAuthenticateEvent(event)) {
      authenticateHandler(event);
    }
  };

  render() {
    return <IFrame src={this.state.loadedUrl} title={this.props.manifest.title} />;
  }
}

const ConnectedExternalApp = connect()(ExternalAppComponent);
export const ExternalApp = withRouter<PublicProperties>(ConnectedExternalApp) as ComponentType<PublicProperties>;
