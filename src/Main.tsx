import React from 'react';
import { Link } from 'react-router-dom';
import { AppContainer, Apps } from './core-components/app-container';

import './Main.css';

// Renamed from App to Main to reduce confusion around
// apps & app due to the intent of this project.
export class Main extends React.Component {
  render() {
    return (
      <div className='main'>
        <Link to='/'>
          <div className='main__header'>zOS</div>
        </Link>
        <AppContainer selectedApp={Apps.Feed} />
      </div>
    );
  }
}
