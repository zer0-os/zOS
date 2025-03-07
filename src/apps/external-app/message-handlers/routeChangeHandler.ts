import { RouteChangeMessage } from '../types/types';
import { History } from 'react-router-dom';

export const routeChangedHandler =
  (history: History, route: string, url: string) => (event: MessageEvent<RouteChangeMessage>) => {
    const isFromCorrectSource = new URL(url).href === new URL(event.origin).href;

    if (!isFromCorrectSource) {
      return;
    }

    // If there's no pathname or it's the route route ('/'), we should navigate to the root of the app
    if (!event.data.data.pathname || event.data.data.pathname === '/') {
      history.push(route);
    } else {
      history.push(route + event.data.data.pathname);
    }
  };
