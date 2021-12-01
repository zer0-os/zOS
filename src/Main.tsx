import React from 'react';
import { AppContainer, Apps } from './core-components/app-container';

import './Main.css';

// Renamed from App to Main to reduce confusion around
// apps & app due to the intent of this project.
export class Main extends React.Component {
  render() {
    return (
      <div className="Main">
        <AppContainer selectedApp={Apps.Feed} />
      </div>
    );
  }
}
