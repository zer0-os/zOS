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
import { IncomingMessage, ZOSMessageType } from './types/types';
import { routeChangedHandler } from './message-handlers/routeChangeHandler';
import { isAuthenticateEvent, isRouteChangeEvent, isChannelHandshakeEvent } from './types/messageTypeGuard';
import { authenticateHandler } from './message-handlers/authenticateHandler';
import { clearActiveZAppManifest, setActiveZAppManifest } from '../../store/active-zapp';
import { ZAppManifest } from './types/manifest';
import { WHITELISTED_APPS } from './constants/whitelistedApps';

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
  messagePort: MessagePort | null;
}

class ExternalAppComponent extends Component<Properties, State> {
  state = {
    loadedUrl: '',
    messagePort: null,
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
    if (this.state.messagePort) {
      this.state.messagePort.close();
    }
    this.props.dispatch(clearActiveZAppManifest());
  }

  setupMessageChannel = (event: MessageEvent<IncomingMessage>) => {
    const { origin } = new URL(this.props.manifest.url);
    if (event.origin !== origin || !WHITELISTED_APPS.includes(event.origin)) {
      return;
    }

    const channel = new MessageChannel();

    channel.port1.onmessage = (e) => {
      if (isRouteChangeEvent(e)) {
        const handler = routeChangedHandler(this.props.history, this.props.manifest.route, this.props.manifest.url);
        handler(e);
      } else if (isAuthenticateEvent(e)) {
        authenticateHandler(this.state.messagePort);
      }
    };

    this.setState({ messagePort: channel.port1 });

    if (event.source && 'postMessage' in event.source) {
      event.source.postMessage(
        {
          type: ZOSMessageType.ChannelHandshakeResponse,
          port: channel.port2,
        },
        { targetOrigin: event.origin, transfer: [channel.port2] }
      );
    }
  };

  onMessage = (event: MessageEvent<IncomingMessage>) => {
    // Legacy message handler for backwards compatibility
    // Remove this once we're sure all apps have updated to the new MessageChannel handler
    if (isRouteChangeEvent(event)) {
      const handler = routeChangedHandler(this.props.history, this.props.manifest.route, this.props.manifest.url);
      handler(event);
    }

    if (isChannelHandshakeEvent(event) && !this.state.messagePort) {
      this.setupMessageChannel(event);
    }
  };

  getAllowAttribute = () => {
    return this.props.manifest.features.reduce((acc, feature) => {
      if (feature.type === 'microphone') {
        return `${acc} microphone`;
      }
      return acc;
    }, '');
  };

  render() {
    return <IFrame src={this.state.loadedUrl} title={this.props.manifest.title} allow={this.getAllowAttribute()} />;
  }
}

const ConnectedExternalApp = connect()(ExternalAppComponent);
export const ExternalApp = withRouter<PublicProperties>(ConnectedExternalApp);
