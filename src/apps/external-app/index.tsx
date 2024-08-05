/*
 * This component wraps an external app, e.g. Explorer.
 * It renders the app in an iFrame, and listens for messages from the iFrame's origin.
 * If a message is received, it handles it accordingly, e.g. mirroring iFrame route
 * changes to the parent window (or rather, the parent Router).
 */

import { Location, withRouter, History } from 'react-router-dom';
import { Component } from 'react';
import { IFrame } from '../iframe';

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

  onMessage = (event: MessageEvent) => {
    if (event.data.type === 'zapp-route-changed') {
      const isFromCorrectSource = new URL(this.props.url).href === new URL(event.origin).href;

      if (!isFromCorrectSource) {
        return;
      }

      // If there's no pathname or it's the route route ('/'), we should navigate to the root of the app
      if (!event.data.data.pathname || event.data.data.pathname === '/') {
        this.props.history.push(this.props.route);
      } else {
        this.props.history.push(this.props.route + event.data.data.pathname);
      }
    }
  };

  render() {
    return <IFrame src={this.state.loadedUrl} title={this.props.title} />;
  }
}

export const ExternalApp = withRouter<PublicProperties>(ExternalAppComponent);
